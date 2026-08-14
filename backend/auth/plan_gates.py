from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.jwt import get_current_user
from database import get_db
from models.billing import PLAN_ORDER, PlanTier, Subscription, SubscriptionStatus
from models.user import User


def has_access(current_plan: PlanTier, min_plan: PlanTier) -> bool:
    """True if current_plan is at or above min_plan in the free < pro < enterprise order."""
    return PLAN_ORDER.index(current_plan) >= PLAN_ORDER.index(min_plan)


def get_or_create_subscription(db: Session, org_id) -> Subscription:
    """Every org effectively has a subscription even if it never touched Stripe —
    it's just sitting on the Free plan. Create the row on first access so the rest
    of the billing code never has to special-case 'no subscription row yet'."""
    sub = db.query(Subscription).filter(Subscription.org_id == org_id).first()
    if sub is None:
        sub = Subscription(org_id=org_id, plan=PlanTier.free, status=SubscriptionStatus.none)
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


def require_plan(min_plan: PlanTier):
    """
    FastAPI dependency, mirrors auth/permissions.py's require_role() pattern.
    Usage on any route M2/M3 want gated:

        @router.get("/api/query/advanced")
        def advanced_query(user: User = Depends(require_plan(PlanTier.pro))):
            ...

    IMPORTANT: this is the *real* gate. The frontend PlanGate component (M5) only
    hides the button — it never actually stops a request. Anyone can call the API
    directly with curl/Postman, so every paid feature must also be wrapped here on
    the backend, or it's not actually gated.
    """

    def checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        sub = get_or_create_subscription(db, current_user.org_id)

        # A plan that's past_due still works (grace period) but a canceled one is
        # treated as Free regardless of what `plan` says, until they resubscribe.
        effective_plan = PlanTier.free if sub.status == SubscriptionStatus.canceled else sub.plan

        if not has_access(effective_plan, min_plan):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires the {min_plan.value} plan or higher. Upgrade required.",
            )
        return current_user

    return checker
