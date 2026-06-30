import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers import health_router

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smart_todo")


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting Smart Todo API")
    yield
    logger.info("Shutting down Smart Todo API")


app = FastAPI(
    title="Smart Todo API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "http://127.0.0.1:3000").split(",")],
    allow_credentials=True,
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


app.include_router(health_router.router)
