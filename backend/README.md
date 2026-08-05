# Project 3 Analytics API (Backend)

FastAPI + PostgreSQL backend for the multi-tenant SaaS analytics dashboard.

## Setup

1. Create and activate a virtual environment:

   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy the environment template and fill in real values:

   ```bash
   cp .env.example .env
   ```

4. Make sure PostgreSQL is running and the database referenced by `DATABASE_URL` exists.

## Running

```bash
uvicorn main:app --reload
```

Tables are created automatically on startup (`create_tables()` runs on the FastAPI `startup` event). The API is served at `http://localhost:8000`; interactive docs are available at `http://localhost:8000/docs`.

## Environment Variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/dbname` |
| `SECRET_KEY` | Secret used to sign JWTs |
| `ALGORITHM` | JWT signing algorithm (e.g. `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT access token lifetime, in minutes |

## API Endpoints

### Auth (`/api/auth`)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a new organization + owner user, returns a JWT |
| POST | `/api/auth/login` | Verify credentials, returns a JWT |
| GET | `/api/auth/me` | Return the current logged-in user |

### Organization (`/api/org`)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/org/me` | Return the current org's info |
| PATCH | `/api/org/me` | Update org name (owner only) |
| GET | `/api/org/members` | List members of the current org (owner/admin) |
| POST | `/api/org/invite` | Invite a new member by email + role (owner only) |

### Connectors (`/api/connectors`)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/api/connectors/csv-upload` | Upload a CSV file, parse it, store rows as data records |
| POST | `/api/connectors/webhook/{connector_id}` | Receive a webhook payload and store it as a data record |
| POST | `/api/connectors/api-poll` | Create a new API-polling connector (url + interval config) |
| GET | `/api/connectors` | List all connectors for the current org |
| GET | `/api/connectors/{connector_id}/data` | Get data records for a connector (paginated: `skip`, `limit`) |

### Data (`/api/data`)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/data/{connector_id}/records` | Paginated records for a connector, with optional key/value filters via query params |
| GET | `/api/data/{connector_id}/columns` | Column names discovered from the connector's data |
| GET | `/api/data/{connector_id}/summary` | Basic stats: row count, column count, date range |

All endpoints except `POST /api/auth/register`, `POST /api/auth/login`, and `POST /api/connectors/webhook/{connector_id}` require an `Authorization: Bearer <token>` header.
