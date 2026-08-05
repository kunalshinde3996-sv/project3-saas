import uuid
from datetime import datetime
from typing import Any, Dict, List

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from auth.jwt import get_current_user
from database import get_db
from models.connector import Connector, ConnectorType, DataRecord
from models.user import User
from services.csv_parser import parse_csv

router = APIRouter(prefix="/api/connectors", tags=["connectors"])


class ConnectorResponse(BaseModel):
    id: uuid.UUID
    name: str
    connector_type: ConnectorType
    config: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class ApiPollCreateRequest(BaseModel):
    name: str
    url: HttpUrl
    interval_seconds: int


class DataRecordResponse(BaseModel):
    id: uuid.UUID
    connector_id: uuid.UUID
    data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class CsvUploadResponse(BaseModel):
    connector: ConnectorResponse
    records_ingested: int


def _get_org_connector(db: Session, connector_id: uuid.UUID, org_id) -> Connector:
    connector = (
        db.query(Connector)
        .filter(Connector.id == connector_id, Connector.org_id == org_id)
        .first()
    )
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connector not found")
    return connector


@router.post("/csv-upload", response_model=CsvUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_csv(
    name: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = await parse_csv(file)

    connector = Connector(
        org_id=current_user.org_id,
        name=name,
        connector_type=ConnectorType.csv,
        config={"filename": file.filename},
    )
    db.add(connector)
    db.flush()

    for row in rows:
        db.add(DataRecord(org_id=current_user.org_id, connector_id=connector.id, data=row))

    db.commit()
    db.refresh(connector)

    return CsvUploadResponse(connector=connector, records_ingested=len(rows))


@router.post("/webhook/{connector_id}", status_code=status.HTTP_201_CREATED)
async def receive_webhook(connector_id: uuid.UUID, request: Request, db: Session = Depends(get_db)):
    connector = (
        db.query(Connector)
        .filter(Connector.id == connector_id, Connector.connector_type == ConnectorType.webhook)
        .first()
    )
    if not connector:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Webhook connector not found")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON payload")

    if not isinstance(payload, dict):
        payload = {"payload": payload}

    record = DataRecord(org_id=connector.org_id, connector_id=connector.id, data=payload)
    db.add(record)
    db.commit()
    db.refresh(record)

    return {"status": "received", "record_id": record.id}


@router.post("/api-poll", response_model=ConnectorResponse, status_code=status.HTTP_201_CREATED)
def create_api_poll_connector(
    payload: ApiPollCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    connector = Connector(
        org_id=current_user.org_id,
        name=payload.name,
        connector_type=ConnectorType.api_poll,
        config={"url": str(payload.url), "interval_seconds": payload.interval_seconds},
    )
    db.add(connector)
    db.commit()
    db.refresh(connector)
    return connector


@router.get("", response_model=List[ConnectorResponse])
def list_connectors(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Connector).filter(Connector.org_id == current_user.org_id).all()


@router.get("/{connector_id}/data", response_model=List[DataRecordResponse])
def get_connector_data(
    connector_id: uuid.UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    connector = _get_org_connector(db, connector_id, current_user.org_id)

    return (
        db.query(DataRecord)
        .filter(DataRecord.connector_id == connector.id, DataRecord.org_id == current_user.org_id)
        .order_by(DataRecord.created_at)
        .offset(skip)
        .limit(limit)
        .all()
    )
