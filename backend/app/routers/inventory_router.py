from typing import List

from fastapi import APIRouter, HTTPException, status

from app.models.inventory import (
    ItemCreate,
    ItemResponse,
    ItemUpdate,
    LocationCreate,
    LocationResponse,
    StockResponse,
    StockMovementCreate,
    StockMovementResponse,
    AlertResponse,
)
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(loc: LocationCreate) -> LocationResponse:
    created = inventory_service.create_location(loc.name, loc.type)
    return LocationResponse(**created)


@router.get("/locations", response_model=List[LocationResponse])
def list_locations() -> List[LocationResponse]:
    rows = inventory_service.list_locations()
    return [LocationResponse(**r) for r in rows]


@router.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item: ItemCreate) -> ItemResponse:
    created = inventory_service.create_item(item.sku, item.name, item.description, item.unit)
    return ItemResponse(**created)


@router.get("/items", response_model=List[ItemResponse])
def list_items() -> List[ItemResponse]:
    rows = inventory_service.list_items()
    return [ItemResponse(**r) for r in rows]


@router.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int) -> ItemResponse:
    row = inventory_service.get_item(item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemResponse(**row)


@router.put("/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, payload: ItemUpdate) -> ItemResponse:
    updated = inventory_service.update_item(item_id, payload.name, payload.description, payload.unit)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return ItemResponse(**updated)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int):
    ok = inventory_service.delete_item(item_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Item not found")
    return None


@router.get("/stock/{item_id}/{location_id}", response_model=StockResponse)
def get_stock(item_id: int, location_id: int) -> StockResponse:
    row = inventory_service.get_stock(item_id, location_id)
    if not row:
        raise HTTPException(status_code=404, detail="Stock record not found")
    return StockResponse(**row)


@router.post("/stock/set", response_model=StockResponse)
def set_stock(payload: StockMovementCreate):
    # reuse StockMovementCreate for payload shape
    try:
        res = inventory_service.set_stock(payload.item_id, payload.to_location or 0, payload.quantity)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return StockResponse(**res)


@router.post("/stock/adjust", response_model=StockResponse)
def adjust_stock(payload: StockMovementCreate):
    try:
        res = inventory_service.adjust_stock(payload.item_id, payload.to_location or 0, payload.quantity, payload.reason)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return StockResponse(**res)


@router.get("/movements", response_model=List[StockMovementResponse])
def list_movements(limit: int = 100) -> List[StockMovementResponse]:
    rows = inventory_service.list_stock_movements(limit)
    return [StockMovementResponse(**r) for r in rows]


@router.get('/alerts', response_model=List[AlertResponse])
def list_alerts() -> List[AlertResponse]:
    rows = inventory_service.list_alerts()
    return [AlertResponse(**r) for r in rows]


@router.post('/alerts/{alert_id}/resolve')
def resolve_alert(alert_id: int):
    ok = inventory_service.resolve_alert(alert_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Alert not found')
    return {'status': 'ok'}
