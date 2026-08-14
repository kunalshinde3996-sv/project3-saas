from unittest.mock import MagicMock

import stripe

from models.billing import PlanTier, Subscription, SubscriptionStatus
from services import stripe_service


def _sub_query_returns(fake_db, sub):
    fake_db.query.return_value.filter.return_value.first.return_value = sub


class TestGetMySubscription:
    def test_creates_free_sub_on_first_call(self, client, fake_db):
        _sub_query_returns(fake_db, None)  # no row yet -> get_or_create_subscription makes one

        resp = client.get("/api/billing/me")

        assert resp.status_code == 200
        body = resp.json()
        assert body["plan"] == "free"
        assert body["status"] == "none"

    def test_returns_existing_plan(self, fake_user, fake_db, client):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.active)
        _sub_query_returns(fake_db, sub)

        resp = client.get("/api/billing/me")

        assert resp.status_code == 200
        assert resp.json()["plan"] == "pro"


class TestCreateCheckout:
    def test_rejects_free_plan_checkout(self, client, fake_db):
        resp = client.post("/api/billing/checkout", json={"plan": "free"})
        assert resp.status_code == 400

    def test_creates_checkout_session_for_pro(self, monkeypatch, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.free, status=SubscriptionStatus.none)
        _sub_query_returns(fake_db, sub)

        monkeypatch.setenv("STRIPE_PRICE_PRO", "price_pro_test")
        monkeypatch.setattr(stripe_service, "get_or_create_customer", lambda **kw: "cus_123")
        monkeypatch.setattr(
            stripe_service,
            "create_checkout_session",
            lambda **kw: MagicMock(url="https://checkout.stripe.com/test-session"),
        )

        resp = client.post("/api/billing/checkout", json={"plan": "pro"})

        assert resp.status_code == 200
        assert resp.json()["url"] == "https://checkout.stripe.com/test-session"

    def test_500_when_price_not_configured(self, monkeypatch, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.free, status=SubscriptionStatus.none)
        _sub_query_returns(fake_db, sub)
        monkeypatch.delenv("STRIPE_PRICE_PRO", raising=False)

        resp = client.post("/api/billing/checkout", json={"plan": "pro"})

        assert resp.status_code == 500


class TestCreatePortal:
    def test_400_when_no_stripe_customer_yet(self, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.free, status=SubscriptionStatus.none)
        sub.stripe_customer_id = None
        _sub_query_returns(fake_db, sub)

        resp = client.post("/api/billing/portal")

        assert resp.status_code == 400

    def test_returns_portal_url(self, monkeypatch, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.active)
        sub.stripe_customer_id = "cus_123"
        _sub_query_returns(fake_db, sub)
        monkeypatch.setattr(
            stripe_service,
            "create_portal_session",
            lambda **kw: MagicMock(url="https://billing.stripe.com/test-portal"),
        )

        resp = client.post("/api/billing/portal")

        assert resp.status_code == 200
        assert resp.json()["url"] == "https://billing.stripe.com/test-portal"


class TestWebhook:
    def test_rejects_bad_signature(self, monkeypatch, client, fake_db):
        def _raise(*args, **kwargs):
            raise stripe.error.SignatureVerificationError("bad sig", "sig_header")

        monkeypatch.setattr(stripe_service, "construct_webhook_event", _raise)

        resp = client.post(
            "/api/billing/webhook",
            content=b'{"type": "checkout.session.completed"}',
            headers={"stripe-signature": "invalid"},
        )

        assert resp.status_code == 400

    def test_unmatched_customer_is_a_noop_not_an_error(self, monkeypatch, client, fake_db):
        fake_event = {
            "type": "customer.subscription.deleted",
            "data": {"object": {"customer": "cus_123"}},
        }
        monkeypatch.setattr(stripe_service, "construct_webhook_event", lambda payload, sig: fake_event)
        fake_db.query.return_value.filter.return_value.first.return_value = None  # no matching sub -> handler no-ops

        resp = client.post(
            "/api/billing/webhook",
            content=b"{}",
            headers={"stripe-signature": "valid"},
        )

        assert resp.status_code == 200
        assert resp.json() == {"received": True}

    def test_subscription_deleted_downgrades_to_free(self, monkeypatch, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.active)
        sub.stripe_customer_id = "cus_123"
        fake_event = {
            "type": "customer.subscription.deleted",
            "data": {"object": {"customer": "cus_123"}},
        }
        monkeypatch.setattr(stripe_service, "construct_webhook_event", lambda payload, sig: fake_event)
        fake_db.query.return_value.filter.return_value.first.return_value = sub

        resp = client.post("/api/billing/webhook", content=b"{}", headers={"stripe-signature": "valid"})

        assert resp.status_code == 200
        assert sub.status == SubscriptionStatus.canceled
        assert sub.plan == PlanTier.free
        fake_db.commit.assert_called()

    def test_invoice_payment_failed_marks_past_due(self, monkeypatch, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.active)
        sub.stripe_customer_id = "cus_123"
        fake_event = {
            "type": "invoice.payment_failed",
            "data": {"object": {"customer": "cus_123"}},
        }
        monkeypatch.setattr(stripe_service, "construct_webhook_event", lambda payload, sig: fake_event)
        fake_db.query.return_value.filter.return_value.first.return_value = sub

        resp = client.post("/api/billing/webhook", content=b"{}", headers={"stripe-signature": "valid"})

        assert resp.status_code == 200
        assert sub.status == SubscriptionStatus.past_due

    def test_subscription_updated_syncs_plan_from_price(self, monkeypatch, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.active)
        sub.stripe_customer_id = "cus_123"
        fake_event = {
            "type": "customer.subscription.updated",
            "data": {
                "object": {
                    "customer": "cus_123",
                    "status": "active",
                    "current_period_end": 1_800_000_000,
                    "items": {"data": [{"price": {"id": "price_enterprise_test"}}]},
                }
            },
        }
        monkeypatch.setattr(stripe_service, "construct_webhook_event", lambda payload, sig: fake_event)
        monkeypatch.setattr(stripe_service, "plan_for_price", lambda price_id: "enterprise")
        fake_db.query.return_value.filter.return_value.first.return_value = sub

        resp = client.post("/api/billing/webhook", content=b"{}", headers={"stripe-signature": "valid"})

        assert resp.status_code == 200
        assert sub.plan == PlanTier.enterprise
        assert sub.status == SubscriptionStatus.active

    def test_checkout_completed_activates_subscription(self, monkeypatch, client, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.free, status=SubscriptionStatus.none)
        sub.stripe_customer_id = "cus_123"
        fake_event = {
            "type": "checkout.session.completed",
            "data": {"object": {"customer": "cus_123", "subscription": "sub_abc"}},
        }
        fake_stripe_sub = {
            "items": {"data": [{"price": {"id": "price_pro_test"}}]},
            "current_period_end": 1_800_000_000,
        }
        monkeypatch.setattr(stripe_service, "construct_webhook_event", lambda payload, sig: fake_event)
        monkeypatch.setattr(stripe_service, "plan_for_price", lambda price_id: "pro")
        monkeypatch.setattr(stripe.Subscription, "retrieve", staticmethod(lambda sub_id: fake_stripe_sub))
        fake_db.query.return_value.filter.return_value.first.return_value = sub

        resp = client.post("/api/billing/webhook", content=b"{}", headers={"stripe-signature": "valid"})

        assert resp.status_code == 200
        assert sub.status == SubscriptionStatus.active
        assert sub.plan == PlanTier.pro
        assert sub.stripe_subscription_id == "sub_abc"
