from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database_init import create_tables
from routers.auth import router as auth_router
from routers.billing import router as billing_router
from routers.connectors import router as connectors_router
from routers.data import router as data_router
from routers.query import router as query_router   
from routers.org import router as org_router
from routers.stream import router as stream_router

app = FastAPI(title="Project 3 Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(org_router)
app.include_router(connectors_router)
app.include_router(data_router)
app.include_router(billing_router)
app.include_router(stream_router)
app.include_router(query_router)

@app.on_event("startup")
def on_startup():
    create_tables()


@app.get("/")
def read_root():
    return {"status": "ok"}