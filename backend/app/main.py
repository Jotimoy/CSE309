import logging
import os
from contextlib import asynccontextmanager
import threading
import time

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import HTTPException
from starlette.status import HTTP_429_TOO_MANY_REQUESTS
import time
from collections import defaultdict

from .routers import health_router
from app.routers.auth_router import router as auth_router
from app.routers.user_router import router as user_router
from app.routers.inventory_router import router as inventory_router
from app.routers.dashboard_router import router as dashboard_router
from app.services.database import initialize_database
from app.services import inventory_service

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smart_warehouse")

# Ensure database is initialized on import so tests and non-lifespan callers work
initialize_database()

# Start low-stock scanner thread at import so tests see alerts without needing lifespan
_scanner_stop_event = threading.Event()
_scanner_interval = int(os.getenv('ALERT_SCAN_INTERVAL_SECONDS', '60'))

def _scanner():
    logger.info('Low-stock scanner started (interval=%s)', _scanner_interval)
    while not _scanner_stop_event.is_set():
        try:
            inventory_service.scan_low_stock()
        except Exception:
            logger.exception('Error during low-stock scan')
        _scanner_stop_event.wait(_scanner_interval)

_scanner_thread = threading.Thread(target=_scanner, daemon=True, name='low-stock-scanner')
_scanner_thread.start()


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting Smart AI Warehouse API")
    initialize_database()
    # start low-stock scanner thread
    # scanner is started at import time so tests that instantiate TestClient benefit
    # from the background scanner without relying on lifespan startup.
    yield
    # signal background thread to stop and wait briefly
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
    # simple in-memory rate limiter: X requests per IP per window
    try:
        # rate limit config
        RATE_LIMIT = int(os.getenv('RATE_LIMIT_PER_MINUTE', '300'))
        window = 60
        client_ip = request.client.host if request.client else 'unknown'
        now = int(time.time())
        bucket_key = (client_ip, now // window)
        if not hasattr(app.state, 'rate_buckets'):
            app.state.rate_buckets = defaultdict(int)
        app.state.rate_buckets[bucket_key] += 1
        if app.state.rate_buckets[bucket_key] > RATE_LIMIT:
            raise HTTPException(status_code=HTTP_429_TOO_MANY_REQUESTS, detail='Rate limit exceeded')

        response = await call_next(request)
    except HTTPException as exc:
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    except Exception as exc:
        logger.exception("Unhandled exception for %s", request.url.path)
        return JSONResponse(status_code=500, content={"detail": str(exc)})
    return response


app.include_router(health_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(inventory_router)
app.include_router(dashboard_router)
