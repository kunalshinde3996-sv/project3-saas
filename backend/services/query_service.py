import os
import re
import json

import duckdb
import pandas as pd
from scipy import stats
from sqlalchemy.orm import Session
from langchain_openai import ChatOpenAI
from langchain.messages import AIMessage, HumanMessage, SystemMessage

from models.connector import Connector, DataRecord


class ConversationBufferMemory:
    def __init__(self, return_messages: bool = True):
        self.return_messages = return_messages
        self.messages: list[HumanMessage | AIMessage | SystemMessage] = []

    @property
    def chat_memory(self) -> "ConversationBufferMemory":
        return self


# --- Conversational memory store (per user, kept in process memory) ---
# key = user id (string), value = ConversationBufferMemory
_memory_store: dict[str, ConversationBufferMemory] = {}


def get_memory(user_id: str) -> ConversationBufferMemory:
    if user_id not in _memory_store:
        _memory_store[user_id] = ConversationBufferMemory(return_messages=True)
    return _memory_store[user_id]


def get_org_dataframe(db: Session, org_id) -> pd.DataFrame:
    """Pull every DataRecord across all of this org's connectors into one dataframe."""
    connectors = db.query(Connector).filter(Connector.org_id == org_id).all()
    if not connectors:
        return pd.DataFrame()

    frames = []
    for c in connectors:
        records = (
            db.query(DataRecord)
            .filter(DataRecord.connector_id == c.id)
            .limit(500)
            .all()
        )
        if not records:
            continue
        rows = [r.data for r in records]
        df = pd.json_normalize(rows)
        df["_connector"] = c.name
        frames.append(df)

    if not frames:
        return pd.DataFrame()

    return pd.concat(frames, ignore_index=True, sort=False)


SQL_SYSTEM_PROMPT = """You are a SQL assistant. You write DuckDB SQL queries against a single \
table named `data`. Only write SELECT statements -- never INSERT, UPDATE, DELETE, DROP, ALTER, \
or any other DDL/DML. Only reference the columns you are given. If the question cannot be \
answered with these columns, respond with exactly: SELECT 'unsupported' AS error;

Return ONLY the raw SQL query. No explanation, no markdown code fences."""


def generate_sql(question: str, columns: list[str], memory: ConversationBufferMemory) -> str:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))

    history_msgs = memory.chat_memory.messages[-6:]  # last ~3 exchanges for follow-ups
    messages = [
        SystemMessage(content=SQL_SYSTEM_PROMPT + f"\n\nAvailable columns in `data`: {columns}")
    ]
    messages.extend(history_msgs)
    messages.append(HumanMessage(content=question))

    response = llm.invoke(messages)
    sql = response.content.strip()
    sql = re.sub(r"^```sql|^```|```$", "", sql, flags=re.IGNORECASE).strip()
    return sql


def add_turn(memory: ConversationBufferMemory, question: str, sql: str) -> None:
    memory.chat_memory.messages.append(HumanMessage(content=question))
    memory.chat_memory.messages.append(AIMessage(content=sql))


def is_safe_select(sql: str) -> bool:
    lowered = sql.strip().lower()
    if not lowered.startswith("select"):
        return False
    banned = ["insert", "update", "delete", "drop", "alter", "create", "attach", "copy", "pragma", ";--"]
    return not any(word in lowered for word in banned)


def run_sql(df: pd.DataFrame, sql: str) -> list[dict]:
    con = duckdb.connect()
    con.register("data", df)
    result = con.execute(sql).fetchdf()
    con.close()
    return json.loads(result.to_json(orient="records"))


def detect_anomalies(rows: list[dict]) -> list[dict]:
    """Adds a `<col>_is_outlier` boolean flag for numeric columns using z-score (|z| > 3)."""
    if not rows:
        return rows
    df = pd.DataFrame(rows)
    numeric_cols = df.select_dtypes(include="number").columns
    for col in numeric_cols:
        if df[col].isna().all() or df[col].std(ddof=0) == 0:
            continue
        z = stats.zscore(df[col].fillna(df[col].mean()))
        df[f"{col}_is_outlier"] = abs(z) > 3
    return json.loads(df.to_json(orient="records"))


def suggest_chart_type(rows: list[dict]) -> str:
    if not rows:
        return "table"
    first = rows[0]
    keys = list(first.keys())
    numeric_keys = [k for k in keys if isinstance(first[k], (int, float))]

    if len(rows) == 1:
        return "table"
    if len(keys) == 2 and len(numeric_keys) == 1:
        return "bar" if len(rows) <= 15 else "line"
    if len(numeric_keys) == 1 and len(rows) <= 8:
        return "pie"
    return "table"