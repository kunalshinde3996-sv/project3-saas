import uuid

import pytest
from fastapi import HTTPException

from auth.plan_gates import get_or_create_subscription, has_access, require_plan
from models.billing import PlanTier, Subscription, SubscriptionStatus


class TestHasAccess:
    def test_free_user_cannot_access_pro_feature(self):
        assert has_access(PlanTier.free, PlanTier.pro) is False

    def test_pro_user_can_access_pro_feature(self):
        assert has_access(PlanTier.pro, PlanTier.pro) is True

    def test_enterprise_user_can_access_pro_feature(self):
        assert has_access(PlanTier.enterprise, PlanTier.pro) is True

    def test_pro_user_cannot_access_enterprise_feature(self):
        assert has_access(PlanTier.pro, PlanTier.enterprise) is False

    def test_any_plan_can_access_free_feature(self):
        assert has_access(PlanTier.free, PlanTier.free) is True
        assert has_access(PlanTier.pro, PlanTier.free) is True
        assert has_access(PlanTier.enterprise, PlanTier.free) is True


class TestGetOrCreateSubscription:
    def test_creates_free_subscription_when_none_exists(self, fake_db):
        org_id = uuid.uuid4()
        fake_db.query.return_value.filter.return_value.first.return_value = None

        sub = get_or_create_subscription(fake_db, org_id)

        assert sub.org_id == org_id
        assert sub.plan == PlanTier.free
        assert sub.status == SubscriptionStatus.none
        fake_db.add.assert_called_once()
        fake_db.commit.assert_called_once()

    def test_returns_existing_subscription_without_creating(self, fake_db):
        org_id = uuid.uuid4()
        existing = Subscription(org_id=org_id, plan=PlanTier.pro, status=SubscriptionStatus.active)
        fake_db.query.return_value.filter.return_value.first.return_value = existing

        sub = get_or_create_subscription(fake_db, org_id)

        assert sub is existing
        fake_db.add.assert_not_called()


class TestRequirePlan:
    """require_plan() returns a FastAPI dependency (the inner `checker` function); we
    call it directly with fake args rather than going through HTTP, so these stay
    fast, isolated unit tests instead of full integration tests."""

    def test_raises_403_when_plan_too_low(self, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.free, status=SubscriptionStatus.active)
        fake_db.query.return_value.filter.return_value.first.return_value = sub
        checker = require_plan(PlanTier.pro)

        with pytest.raises(HTTPException) as exc_info:
            checker(current_user=fake_user, db=fake_db)

        assert exc_info.value.status_code == 403

    def test_allows_when_plan_sufficient(self, fake_db, fake_user):
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.active)
        fake_db.query.return_value.filter.return_value.first.return_value = sub
        checker = require_plan(PlanTier.pro)

        result = checker(current_user=fake_user, db=fake_db)

        assert result is fake_user

    def test_canceled_subscription_is_treated_as_free(self, fake_db, fake_user):
        """A canceled sub keeps whatever `plan` it last had (e.g. 'pro') but should be
        treated as free until the org resubscribes — this is the one non-obvious rule
        in require_plan(), so it gets its own test."""
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.canceled)
        fake_db.query.return_value.filter.return_value.first.return_value = sub
        checker = require_plan(PlanTier.pro)

        with pytest.raises(HTTPException) as exc_info:
            checker(current_user=fake_user, db=fake_db)

        assert exc_info.value.status_code == 403

    def test_past_due_subscription_keeps_access(self, fake_db, fake_user):
        """Grace period: past_due still counts as the paid plan, unlike canceled."""
        sub = Subscription(org_id=fake_user.org_id, plan=PlanTier.pro, status=SubscriptionStatus.past_due)
        fake_db.query.return_value.filter.return_value.first.return_value = sub
        checker = require_plan(PlanTier.pro)

        result = checker(current_user=fake_user, db=fake_db)

        assert result is fake_user
