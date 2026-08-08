from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/health")
def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@router.get("/")
def root() -> JSONResponse:
    return JSONResponse({"status": "ok", "message": "Smart AI Warehouse API is running."})
