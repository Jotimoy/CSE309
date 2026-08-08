from fastapi import APIRouter
from typing import Dict

from app.services.dashboard_service import summary

router = APIRouter(prefix='/inventory', tags=['Inventory'])


@router.get('/summary')
def get_summary(threshold: int = 10) -> Dict:
    return summary(threshold)
