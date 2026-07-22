from fastapi import APIRouter, Depends

from app.models.user import UserResponse
from app.routers.auth_router import _get_current_user

router = APIRouter(prefix='/users', tags=['Users'])


@router.get('/me', response_model=UserResponse)
def read_current_user(user: UserResponse = Depends(_get_current_user)) -> UserResponse:
    return user
