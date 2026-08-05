import re

from sqlalchemy import text

import models  # noqa: F401  ensures all models are registered on Base.metadata
from database import Base, engine

SCHEMA_NAME_PATTERN = re.compile(r"^[a-zA-Z0-9_\-]+$")


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


def drop_tables() -> None:
    Base.metadata.drop_all(bind=engine)


def create_org_schema(schema_name: str) -> None:
    if not SCHEMA_NAME_PATTERN.match(schema_name):
        raise ValueError(f"Invalid schema name: {schema_name}")

    with engine.begin() as connection:
        connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema_name}"'))
