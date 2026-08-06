import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import health_router
from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.services.database import initialize_database

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smart_warehouse")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting Smart AI Warehouse API")
    initialize_database()
    yield
    logger.info("Shutting down Smart AI Warehouse API")


app = FastAPI(
    title="Smart AI Warehouse API",
    version="0.1.0",
    lifespan=lifespan,
)

_cors_env = os.getenv("CORS_ORIGINS")
_default_local_origins = [
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]
# For local development allow all origins to simplify CORS during testing.
# In production, set `CORS_ORIGINS` environment variable and tighten origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("%s %s", request.method, request.url.path)
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.exception("Unhandled exception for %s", request.url.path)
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    return response


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(user_router)
