import asyncio
import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from auth.jwt import CREDENTIALS_EXCEPTION, verify_token
from database import SessionLocal, get_db
from models.connector import Connector, DataRecord
from models.user import User

router = APIRouter(prefix="/api/stream", tags=["stream"])

POLL_INTERVAL_SECONDS = 3


def _get_org_connector(db: Session, connector_id: uuid.UUID, org_id) -> Connector:
    connector = (
        db.query(Connector)
        .filter(Connector.id == connector_id, Connector.org_id == org_id)
        .first()
    )
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    return connector


async def _event_generator(connector_id: uuid.UUID, org_id):
    """
    DB-polling SSE generator (not pub/sub — simplest thing that works for a class
    project and needs no extra infra like Redis). Every POLL_INTERVAL_SECONDS it
    checks for DataRecords newer than the last one it sent, for THIS connector and
    THIS org only — org isolation applies here exactly like every other data route.

    Opens its own DB session because this runs detached from the request's
    dependency-injected session (the request returns immediately once the
    StreamingResponse starts).
    """
    last_seen = datetime.now(timezone.utc)

    while True:
        db = SessionLocal()
        try:
            new_records = (
                db.query(DataRecord)
                .filter(
                    DataRecord.connector_id == connector_id,
                    DataRecord.org_id == org_id,
                    DataRecord.created_at > last_seen,
                )
                .order_by(DataRecord.created_at)
                .all()
            )
            for record in new_records:
                payload = {
                    "id": str(record.id),
                    "connector_id": str(record.connector_id),
                    "data": record.data,
                    "created_at": record.created_at.isoformat(),
                }
                yield f"event: message\ndata: {json.dumps(payload)}\n\n"
                last_seen = record.created_at
        finally:
            db.close()

        # Keeps the connection alive through proxies/load balancers that time out
        # idle connections (Render does this). Browsers ignore comment lines.
        yield ": keep-alive\n\n"
        await asyncio.sleep(POLL_INTERVAL_SECONDS)


@router.get("/{connector_id}")
async def stream_connector(
    connector_id: uuid.UUID,
    token: str = Query(..., description="JWT — browser EventSource can't set an Authorization header, so it's passed as a query param instead."),
    db: Session = Depends(get_db),
):
    # Manual auth instead of the usual Depends(get_current_user): the browser's native
    # EventSource API cannot send custom headers, so the JWT has to travel as ?token=
    # for this one endpoint. Everything else still goes through the header as normal.
    payload = verify_token(token)
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if user is None:
        raise CREDENTIALS_EXCEPTION

    # Validate the connector belongs to the caller's org BEFORE opening the stream —
    # same 404-not-403 pattern as routers/data.py, so we don't leak connector existence.
    _get_org_connector(db, connector_id, user.org_id)

    return StreamingResponse(
        _event_generator(connector_id, user.org_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disables nginx/Render buffering of the stream
        },
    )
