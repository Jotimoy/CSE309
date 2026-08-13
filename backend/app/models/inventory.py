from pydantic import BaseModel
from typing import Optional


class LocationCreate(BaseModel):
    name: str
    type: Optional[str]


class LocationResponse(BaseModel):
    id: int
    name: str
    type: Optional[str]
    created_at: str


class ItemCreate(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    unit: Optional[str] = None


class ItemUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    unit: Optional[str]


class ItemResponse(BaseModel):
    id: int
    sku: str
    name: str
    description: Optional[str]
    unit: Optional[str]
    created_at: str


class StockResponse(BaseModel):
    id: int
    item_id: int
    location_id: int
    quantity: int
    updated_at: str


class StockMovementCreate(BaseModel):
    item_id: int
    from_location: Optional[int] = None
    to_location: Optional[int] = None
    quantity: int
    reason: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    item_id: int
    from_location: Optional[int]
    to_location: Optional[int]
    quantity: int
    reason: Optional[str]
    created_at: str


class AlertResponse(BaseModel):
    id: int
    item_id: int
    location_id: Optional[int]
    type: str
    message: str
    is_resolved: int
    created_at: str
