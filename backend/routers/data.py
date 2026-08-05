import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth.jwt import get_current_user
from database import get_db
from models.connector import Connector, DataRecord
from models.user import User

router = APIRouter(prefix="/api/data", tags=["data"])

RESERVED_QUERY_PARAMS = {"skip", "limit"}
COLUMN_SAMPLE_SIZE = 500


class DataRecordResponse(BaseModel):
    id: uuid.UUID
    connector_id: uuid.UUID
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class DateRange(BaseModel):
    start: Optional[datetime]
    end: Optional[datetime]


class SummaryResponse(BaseModel):
    row_count: int
    column_count: int
    date_range: DateRange


def _get_org_connector(db: Session, connector_id: uuid.UUID, org_id) -> Connector:
    connector = (
        db.query(Connector)
        .filter(Connector.id == connector_id, Connector.org_id == org_id)
        .first()
    )
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    return connector


def _base_query(db: Session, connector_id: uuid.UUID, org_id):
    return db.query(DataRecord).filter(
        DataRecord.connector_id == connector_id, DataRecord.org_id == org_id
    )


@router.get("/{connector_id}/records", response_model=List[DataRecordResponse])
def get_records(
    connector_id: uuid.UUID,
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    connector = _get_org_connector(db, connector_id, current_user.org_id)

    query = _base_query(db, connector.id, current_user.org_id)

    for key, value in request.query_params.items():
        if key in RESERVED_QUERY_PARAMS:
            continue
        query = query.filter(DataRecord.data[key].astext == value)

    return query.order_by(DataRecord.created_at).offset(skip).limit(limit).all()


@router.get("/{connector_id}/columns")
def get_columns(
    connector_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    connector = _get_org_connector(db, connector_id, current_user.org_id)

    rows = (
        db.query(DataRecord.data)
        .filter(DataRecord.connector_id == connector.id, DataRecord.org_id == current_user.org_id)
        .limit(COLUMN_SAMPLE_SIZE)
        .all()
    )

    columns: Set[str] = set()
    for (data,) in rows:
        if isinstance(data, dict):
            columns.update(data.keys())

    return {"columns": sorted(columns)}


@router.get("/{connector_id}/summary", response_model=SummaryResponse)
def get_summary(
    connector_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    connector = _get_org_connector(db, connector_id, current_user.org_id)

    row_count = _base_query(db, connector.id, current_user.org_id).count()

    min_created, max_created = (
        db.query(func.min(DataRecord.created_at), func.max(DataRecord.created_at))
        .filter(DataRecord.connector_id == connector.id, DataRecord.org_id == current_user.org_id)
        .first()
    )

    sample = _base_query(db, connector.id, current_user.org_id).limit(COLUMN_SAMPLE_SIZE).all()
    columns: Set[str] = set()
    for record in sample:
        if isinstance(record.data, dict):
            columns.update(record.data.keys())

    return SummaryResponse(
        row_count=row_count,
        column_count=len(columns),
        date_range=DateRange(start=min_created, end=max_created),
    )
