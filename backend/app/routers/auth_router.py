from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.models.user import AuthResponse, UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    authenticate_user,
    create_auth_token,
    create_user,
    get_user_by_token,
    get_user_by_email,
)

router = APIRouter(prefix='/auth', tags=['Authentication'])


def _get_bearer_token(authorization: str | None = Header(None)) -> str:
    if authorization is None or not authorization.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authorization header missing or malformed',
        )
    return authorization.removeprefix('Bearer ').strip()


def _get_current_user(token: str = Depends(_get_bearer_token)) -> UserResponse:
    user_data = get_user_by_token(token)
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or expired authentication token',
        )
    return UserResponse(**user_data)


@router.post('/register', response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate) -> AuthResponse:
    if get_user_by_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='A user with this email already exists.',
        )

    created_user = create_user(user.name, user.email, user.password)
    token = create_auth_token(created_user['id'])

    return AuthResponse(token=token, user=UserResponse(**created_user))


@router.post('/login', response_model=AuthResponse)
def login(credentials: UserLogin) -> AuthResponse:
    user = authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid email or password',
        )

    token = create_auth_token(user['id'])
    return AuthResponse(token=token, user=UserResponse(**user))


@router.get('/me', response_model=UserResponse)
def current_user(user: UserResponse = Depends(_get_current_user)) -> UserResponse:
    return user
