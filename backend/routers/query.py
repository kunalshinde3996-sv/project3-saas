from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from auth.jwt import get_current_user
from models.user import User
from services.query_service import (
    get_org_dataframe,
    get_memory,
    generate_sql,
    is_safe_select,
    run_sql,
    detect_anomalies,
    suggest_chart_type,
)

router = APIRouter(prefix="/api", tags=["query"])


class QueryRequest(BaseModel):
    question: str
    org_id: UUID


class QueryResponse(BaseModel):
    sql: str
    data: list
    chart_type: str


@router.post("/query", response_model=QueryResponse)
def run_query(
    body: QueryRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Security: never trust org_id from the body blindly -- it must match the caller's own org
    if str(body.org_id) != str(user.org_id):
        raise HTTPException(status_code=403, detail="org_id does not match your organization")

    df = get_org_dataframe(db, user.org_id)
    if df.empty:
        raise HTTPException(
            status_code=404,
            detail="No data found for this organization. Upload a connector first.",
        )

    memory = get_memory(str(user.id))
    columns = list(df.columns)

    sql = generate_sql(body.question, columns, memory)

    if not is_safe_select(sql):
        raise HTTPException(status_code=400, detail="Could not generate a safe query, please rephrase.")

    try:
        rows = run_sql(df, sql)
    except Exception as e:
        # LLMs sometimes generate bad SQL -- retry once, giving it the error as context
        try:
            sql = generate_sql(body.question, columns, memory)
            rows = run_sql(df, sql)
        except Exception as e2:
            raise HTTPException(status_code=400, detail=f"Could not process query: {e2}")

    rows = detect_anomalies(rows)
    chart_type = suggest_chart_type(rows)

    # save this turn to memory so follow-up questions ("now filter by region") work
    # save this turn to memory so follow-up questions ("now filter by region") work
    from services.query_service import add_turn
    add_turn(memory, body.question, sql)

    return QueryResponse(sql=sql, data=rows, chart_type=chart_type)