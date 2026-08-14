import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class PlanTier(str, enum.Enum):
    free = "free"
    pro = "pro"
    enterprise = "enterprise"


# Order matters here — index in this list = rank. Used by has_access() in auth/plan_gates.py
# to decide "is this org's plan >= the plan a route requires".
PLAN_ORDER = [PlanTier.free, PlanTier.pro, PlanTier.enterprise]


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    past_due = "past_due"
    canceled = "canceled"
    # Org exists but has never started a Stripe checkout — pure free tier, no Stripe objects yet.
    none = "none"


class Subscription(Base):
    """
    One row per organization. Created lazily (see get_or_create_subscription in
    auth/plan_gates.py) the first time anything billing-related touches an org, so
    M1's org creation flow doesn't need to know about billing at all.
    """

    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), unique=True, nullable=False)

    plan = Column(Enum(PlanTier), nullable=False, default=PlanTier.free)
    status = Column(Enum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.none)

    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)

    current_period_end = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
