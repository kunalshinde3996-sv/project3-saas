"""
Thin wrapper around the Stripe SDK. Nothing in here touches the DB — routers/billing.py
does that. Keeping Stripe calls in one file makes it easy to mock in tests and easy for
teammates to see the whole Stripe surface area at a glance.
"""
import os

import stripe
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

# Map Stripe Price IDs (from your Stripe Dashboard test-mode products) to our internal
# plan tiers. Free has no Stripe price — you never checkout into Free, you just start there
# or get downgraded to it.
PRICE_TO_PLAN = {
    os.getenv("STRIPE_PRICE_PRO"): "pro",
    os.getenv("STRIPE_PRICE_ENTERPRISE"): "enterprise",
}


def get_or_create_customer(email: str, org_id: str, existing_customer_id: str | None) -> str:
    """Reuse the stored Stripe customer if we have one, otherwise create it."""
    if existing_customer_id:
        return existing_customer_id
    customer = stripe.Customer.create(email=email, metadata={"org_id": org_id})
    return customer.id


def create_checkout_session(customer_id: str, price_id: str, success_url: str, cancel_url: str):
    return stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
    )


def create_portal_session(customer_id: str, return_url: str):
    return stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )


def construct_webhook_event(payload: bytes, sig_header: str):
    """Raises stripe.error.SignatureVerificationError if the signature is bad — the
    router catches that and returns 400. Never skip this check: without it, anyone
    who finds your webhook URL can POST fake 'payment succeeded' events."""
    return stripe.Webhook.construct_event(payload, sig_header, WEBHOOK_SECRET)


def plan_for_price(price_id: str) -> str | None:
    return PRICE_TO_PLAN.get(price_id)
