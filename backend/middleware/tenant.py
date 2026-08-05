from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from auth.jwt import verify_token
from database import SessionLocal
from models.organization import Organization


def get_org_schema(token: str, db: Session) -> Optional[str]:
    try:
        payload = verify_token(token)
    except HTTPException:
        return None

    org_id = payload.get("org_id")
    if not org_id:
        return None

    org = db.query(Organization).filter(Organization.id == org_id).first()
    return org.schema_name if org else None


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request.state.org_id = None
        request.state.schema_name = None

        auth_header = request.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1]
            db = SessionLocal()
            try:
                schema_name = get_org_schema(token, db)
                if schema_name:
                    request.state.schema_name = schema_name
                    request.state.org_id = verify_token(token).get("org_id")
            except HTTPException:
                pass
            finally:
                db.close()

        return await call_next(request)
