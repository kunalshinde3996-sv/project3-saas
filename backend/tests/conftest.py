"""
Shared test fixtures for the backend test suite.

Design choice: we don't spin up a real Postgres for these tests. Billing logic is
tested by overriding FastAPI's dependencies (get_db, get_current_user) with fakes and
monkeypatching the `stripe` calls in services/stripe_service.py, so `pytest` runs fast
and offline (no network, no real Stripe test-mode account needed) in CI.

If M1 later adds a real test-database fixture (e.g. a throwaway Postgres schema) for
integration tests, these unit tests can stay as-is alongside it.
"""
import sys
import uuid
from pathlib import Path
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

# Make `backend/` importable the same way main.py's sibling modules are (routers.*,
# auth.*, etc. all import with bare names, not backend.routers.*).
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from auth.jwt import get_current_user  # noqa: E402
from database import get_db  # noqa: E402
from main import app  # noqa: E402
from models.user import User, UserRole  # noqa: E402


@pytest.fixture
def fake_user() -> User:
    return User(
        id=uuid.uuid4(),
        email="owner@acme.test",
        hashed_password="not-a-real-hash",
        role=UserRole.owner,
        org_id=uuid.uuid4(),
    )


@pytest.fixture
def fake_db():
    """A MagicMock standing in for a SQLAlchemy Session. Individual tests configure
    what .query(...).filter(...).first() returns for their scenario."""
    return MagicMock()


@pytest.fixture
def client(fake_user, fake_db):
    # Deliberately NOT using `with TestClient(app) as c:` — that form runs the app's
    # startup event (create_tables(), which needs a real Postgres) via ASGI lifespan.
    # These are router-logic tests, not DB-integration tests, so we skip lifespan
    # entirely and only exercise request/response handling with get_db/get_current_user
    # swapped out below.
    app.dependency_overrides[get_current_user] = lambda: fake_user
    app.dependency_overrides[get_db] = lambda: fake_db
    yield TestClient(app)
    app.dependency_overrides.clear()
