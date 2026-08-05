# API Contract

Base URL (local dev): `http://localhost:8000`

All endpoints are prefixed with `/api`. Unless noted otherwise, endpoints require an
`Authorization: Bearer <token>` header, where `<token>` is the JWT returned by
`/api/auth/register` or `/api/auth/login`. All requests/responses are JSON unless noted.

Status legend: **Implemented** = live in `/backend` today. **Planned** = contract agreed
with the frontend team, backend not built yet.

---

## Auth — `/api/auth`

### POST /api/auth/register — Implemented

Create a new organization + an `owner` user in it, and return a JWT for the new user.

Request body:

```json
{
  "email": "user@example.com",
  "password": "string",
  "org_name": "Acme Inc"
}
```

Response `201`:

```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

Errors: `400` if the email is already registered.

### POST /api/auth/login — Implemented

Verify credentials and return a JWT.

Request body:

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

Response `200`:

```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

Errors: `401` on incorrect email/password.

### GET /api/auth/me — Implemented

Returns the currently authenticated user.

Response `200`:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "owner | admin | viewer",
  "org_id": "uuid"
}
```

---

## Organization — `/api/org`

### GET /api/org/me — Implemented

Returns the current user's organization. Any authenticated role.

Response `200`:

```json
{
  "id": "uuid",
  "name": "Acme Inc",
  "schema_name": "acme-inc-a1b2c3d4",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### PATCH /api/org/me — Implemented

Update the organization name. **Owner only** (`403` otherwise).

Request body:

```json
{ "name": "New Org Name" }
```

Response `200`: same shape as `GET /api/org/me`.

### GET /api/org/members — Implemented

List all members of the current org. **Owner or admin** (`403` for viewers).

Response `200`:

```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "owner | admin | viewer",
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

### POST /api/org/invite — Implemented

Create a new member of the current org by email + role. **Owner only** (`403` otherwise).

> Note: this provisions the account directly (no invite-token/email flow exists yet) — the
> new member's initial password is generated server-side and is not returned in the
> response. A proper invite-acceptance flow is not yet built.

Request body:

```json
{
  "email": "newmember@example.com",
  "role": "owner | admin | viewer"
}
```

Response `201`:

```json
{
  "id": "uuid",
  "email": "newmember@example.com",
  "role": "viewer",
  "created_at": "2026-01-01T00:00:00Z"
}
```

Errors: `400` if the email is already registered.

---

## Connectors — `/api/connectors`

### POST /api/connectors/csv-upload — Implemented

Upload a CSV file, parse it, and store each row as a `DataRecord` under a new `csv`
connector. Requires auth. `multipart/form-data` body (not JSON).

Form fields:

| Field | Type | Description |
| --- | --- | --- |
| `name` | string | Name for the new connector |
| `file` | file | CSV file to upload |

Response `201`:

```json
{
  "connector": {
    "id": "uuid",
    "name": "Q1 Sales Export",
    "connector_type": "csv",
    "config": { "filename": "sales.csv" },
    "created_at": "2026-01-01T00:00:00Z"
  },
  "records_ingested": 128
}
```

### POST /api/connectors/webhook/{connector_id} — Implemented

Receive an arbitrary JSON payload from an external system and store it as a `DataRecord`.
**No auth required** — this is a public endpoint intended for external callers holding the
connector's UUID. The connector must already exist and be of type `webhook` (create one via
the database directly for now — there is no endpoint yet to create a `webhook` connector).

Request body: any JSON object (non-object payloads are wrapped as `{"payload": <value>}`).

Response `201`:

```json
{ "status": "received", "record_id": "uuid" }
```

Errors: `404` if no `webhook` connector with that id exists. `400` on invalid JSON.

### POST /api/connectors/api-poll — Implemented

Create a new `api_poll` connector with a target URL and polling interval. Requires auth.

> Note: this only persists the connector config. There is no scheduler/worker yet that
> actually polls the URL — that would need a background job runner (e.g. Celery/APScheduler)
> which isn't part of the stack today.

Request body:

```json
{
  "name": "Stripe Revenue",
  "url": "https://api.example.com/data",
  "interval_seconds": 300
}
```

Response `201`:

```json
{
  "id": "uuid",
  "name": "Stripe Revenue",
  "connector_type": "api_poll",
  "config": { "url": "https://api.example.com/data", "interval_seconds": 300 },
  "created_at": "2026-01-01T00:00:00Z"
}
```

### GET /api/connectors — Implemented

List all connectors for the current org. Requires auth.

Response `200`:

```json
[
  {
    "id": "uuid",
    "name": "Q1 Sales Export",
    "connector_type": "csv | api_poll | webhook",
    "config": {},
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

### GET /api/connectors/{connector_id}/data — Implemented

Get paginated data records for one connector. Requires auth; `404` if the connector doesn't
belong to the caller's org.

Query params:

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `skip` | int | 0 | offset |
| `limit` | int | 50 | max 500 |

Response `200`:

```json
[
  {
    "id": "uuid",
    "connector_id": "uuid",
    "data": { "any": "json" },
    "created_at": "2026-01-01T00:00:00Z"
  }
]
```

---

## Data — `/api/data`

All endpoints require auth and `404` if the connector doesn't belong to the caller's org.

### GET /api/data/{connector_id}/records — Implemented

Paginated records for a connector, same response shape as
`GET /api/connectors/{connector_id}/data`.

Query params:

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `skip` | int | 0 | offset |
| `limit` | int | 50 | max 500 |
| any other key | string | — | filters records where `data[key] == value` |

Example: `GET /api/data/{connector_id}/records?status=active&skip=0&limit=25`

### GET /api/data/{connector_id}/columns — Implemented

Column names discovered from up to 500 sampled records' `data` keys.

Response `200`:

```json
{ "columns": ["email", "amount", "status"] }
```

### GET /api/data/{connector_id}/summary — Implemented

Basic stats for a connector's data.

Response `200`:

```json
{
  "row_count": 128,
  "column_count": 6,
  "date_range": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-01-15T00:00:00Z"
  }
}
```

---

## AI Query — `/api/query`

### POST /api/query — Planned (not yet implemented)

Natural-language question against the org's data. The backend is expected to translate the
question into SQL, run it scoped to the caller's org, and suggest a chart type for the
result.

Request body:

```json
{
  "question": "What were total sales last month?",
  "org_id": "uuid"
}
```

Response `200`:

```json
{
  "sql": "SELECT ...",
  "data": [{ "...": "row objects, shape depends on the query" }],
  "chart_type": "bar | line | pie | table"
}
```

Open questions for whoever implements this: how `org_id` in the body relates to the
caller's JWT org (should probably be validated to match, not trusted as-is), which LLM/SQL
generation approach is used, and how query errors are surfaced.

---

## Streaming — `/api/stream/{connector_id}`

### GET /api/stream/{connector_id} — Planned (not yet implemented)

Server-Sent Events (SSE) stream of new `DataRecord`s for a connector, for live-updating
dashboards. Requires auth; should `404`/`403` the same way as the other connector-scoped
endpoints if the connector isn't in the caller's org.

Response: `Content-Type: text/event-stream`. Each new record is pushed as an SSE `message`
event whose `data` field is a JSON-encoded `DataRecord`:

```
event: message
data: {"id": "uuid", "connector_id": "uuid", "data": {"...": "..."}, "created_at": "2026-01-01T00:00:00Z"}

```

Open questions for whoever implements this: how new records are detected (DB polling vs.
pub/sub), and whether it replays recent history on connect or only pushes new records.
