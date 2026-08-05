import secrets
import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from auth.hashing import hash_password
from auth.jwt import get_current_user
from auth.permissions import require_role
from database import get_db
from models.organization import Organization
from models.user import User, UserRole

router = APIRouter(prefix="/api/org", tags=["organization"])


class OrgResponse(BaseModel):
    id: uuid.UUID
    name: str
    schema_name: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrgUpdateRequest(BaseModel):
    name: str


class MemberResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True


class InviteRequest(BaseModel):
    email: EmailStr
    role: UserRole


def _get_org(db: Session, org_id) -> Organization:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org


@router.get("/me", response_model=OrgResponse)
def get_my_org(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_org(db, current_user.org_id)


@router.patch("/me", response_model=OrgResponse)
def update_my_org(
    payload: OrgUpdateRequest,
    current_user: User = Depends(require_role(["owner"])),
    db: Session = Depends(get_db),
):
    org = _get_org(db, current_user.org_id)
    org.name = payload.name
    db.commit()
    db.refresh(org)
    return org


@router.get("/members", response_model=List[MemberResponse])
def list_members(
    current_user: User = Depends(require_role(["owner", "admin"])),
    db: Session = Depends(get_db),
):
    return db.query(User).filter(User.org_id == current_user.org_id).all()


@router.post("/invite", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
def invite_member(
    payload: InviteRequest,
    current_user: User = Depends(require_role(["owner"])),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    temp_password = secrets.token_urlsafe(12)
    member = User(
        email=payload.email,
        hashed_password=hash_password(temp_password),
        role=payload.role,
        org_id=current_user.org_id,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member
