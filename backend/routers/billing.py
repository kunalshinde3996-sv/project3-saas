import os
import uuid
from datetime import datetime

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.jwt import get_current_user
from auth.plan_gates import get_or_create_subscription
from database import get_db
from models.billing import PlanTier, Subscription, SubscriptionStatus
from models.user import User
from services import stripe_service

router = APIRouter(prefix="/api/billing", tags=["billing"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ---------- schemas ----------

class SubscriptionResponse(BaseModel):
    plan: PlanTier
    status: SubscriptionStatus
    current_period_end: datetime | None

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    plan: PlanTier  # "pro" or "enterprise" — "free" is rejected, see below


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str


# ---------- routes ----------

@router.get("/me", response_model=SubscriptionResponse)
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """M5's PlanGate / billing settings page reads this to know what to lock/unlock."""
    sub = get_or_create_subscription(db, current_user.org_id)
    return sub


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.plan == PlanTier.free:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot checkout into the free plan")

    price_id = {
        PlanTier.pro: os.getenv("STRIPE_PRICE_PRO"),
        PlanTier.enterprise: os.getenv("STRIPE_PRICE_ENTERPRISE"),
    }[body.plan]
    if not price_id:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Price not configured for this plan")

    sub = get_or_create_subscription(db, current_user.org_id)

    customer_id = stripe_service.get_or_create_customer(
        email=current_user.email,
        org_id=str(current_user.org_id),
        existing_customer_id=sub.stripe_customer_id,
    )
    if sub.stripe_customer_id != customer_id:
        sub.stripe_customer_id = customer_id
        db.commit()

    session = stripe_service.create_checkout_session(
        customer_id=customer_id,
        price_id=price_id,
        success_url=f"{FRONTEND_URL}/dashboard/billing?checkout=success",
        cancel_url=f"{FRONTEND_URL}/dashboard/billing?checkout=cancelled",
    )
    return CheckoutResponse(url=session.url)


@router.post("/portal", response_model=PortalResponse)
def create_portal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """'Manage billing' button — Stripe hosts the whole upgrade/downgrade/cancel/invoices UI."""
    sub = get_or_create_subscription(db, current_user.org_id)
    if not sub.stripe_customer_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "No billing account yet — start a checkout first.",
        )

    session = stripe_service.create_portal_session(
        customer_id=sub.stripe_customer_id,
        return_url=f"{FRONTEND_URL}/dashboard/billing",
    )
    return PortalResponse(url=session.url)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    No auth dependency on purpose — Stripe calls this, not a logged-in user.
    Security comes from verifying the signature below, not from a JWT.
    Register this exact URL (https://<your-render-url>/api/billing/webhook) in the
    Stripe Dashboard, and test locally with:
        stripe listen --forward-to localhost:8000/api/billing/webhook
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe_service.construct_webhook_event(payload, sig_header)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid webhook signature")

    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _activate_from_checkout(db, obj)

    elif event_type == "customer.subscription.updated":
        _sync_subscription(db, obj)

    elif event_type == "customer.subscription.deleted":
        _cancel_subscription(db, obj)

    elif event_type == "invoice.payment_failed":
        _mark_past_due(db, obj)

    # Any event type we don't handle is fine to ignore — Stripe sends a lot of them.
    return {"received": True}


# ---------- webhook event handlers ----------
# Each of these is deliberately small and defensive: webhook delivery can be retried
# or arrive out of order, so we always look up by stripe_customer_id / stripe_subscription_id
# rather than assuming any particular event ordering.

def _get_sub_by_customer(db: Session, customer_id: str) -> Subscription | None:
    return db.query(Subscription).filter(Subscription.stripe_customer_id == customer_id).first()


def _activate_from_checkout(db: Session, session_obj: dict) -> None:
    customer_id = session_obj.get("customer")
    subscription_id = session_obj.get("subscription")
    sub = _get_sub_by_customer(db, customer_id)
    if sub is None:
        return  # shouldn't happen — customer was created by our own /checkout call

    sub.stripe_subscription_id = subscription_id
    sub.status = SubscriptionStatus.active

    # Pull the price back off Stripe to know which plan they bought.
    if subscription_id:
        stripe_sub = stripe.Subscription.retrieve(subscription_id)
        price_id = stripe_sub["items"]["data"][0]["price"]["id"]
        plan = stripe_service.plan_for_price(price_id)
        if plan:
            sub.plan = PlanTier(plan)
        sub.current_period_end = datetime.fromtimestamp(stripe_sub["current_period_end"])

    db.commit()


def _sync_subscription(db: Session, stripe_sub_obj: dict) -> None:
    """Fires on upgrade/downgrade done through the Stripe portal, and on renewal."""
    sub = _get_sub_by_customer(db, stripe_sub_obj.get("customer"))
    if sub is None:
        return

    price_id = stripe_sub_obj["items"]["data"][0]["price"]["id"]
    plan = stripe_service.plan_for_price(price_id)
    if plan:
        sub.plan = PlanTier(plan)

    sub.status = SubscriptionStatus.active if stripe_sub_obj["status"] == "active" else SubscriptionStatus.past_due
    sub.current_period_end = datetime.fromtimestamp(stripe_sub_obj["current_period_end"])
    db.commit()


def _cancel_subscription(db: Session, stripe_sub_obj: dict) -> None:
    sub = _get_sub_by_customer(db, stripe_sub_obj.get("customer"))
    if sub is None:
        return
    sub.status = SubscriptionStatus.canceled
    sub.plan = PlanTier.free
    db.commit()


def _mark_past_due(db: Session, invoice_obj: dict) -> None:
    sub = _get_sub_by_customer(db, invoice_obj.get("customer"))
    if sub is None:
        return
    sub.status = SubscriptionStatus.past_due
    db.commit()
    # A real app would email the user here. Out of scope for the demo, but this is
    # the one line where you'd hook that in.
