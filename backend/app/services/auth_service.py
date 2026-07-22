import datetime
import hashlib
import secrets
from typing import Optional

from .database import get_connection

PASSWORD_ITERATIONS = 100_000
TOKEN_LENGTH = 32
TOKEN_TTL_DAYS = 30


def _hash_password(password: str, salt: Optional[bytes] = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_bytes(16)
    password_hash = hashlib.pbkdf2_hmac(
        'sha256', password.encode('utf-8'), salt, PASSWORD_ITERATIONS
    )
    return salt.hex(), password_hash.hex()


def verify_password(password: str, salt_hex: str, hash_hex: str) -> bool:
    salt = bytes.fromhex(salt_hex)
    password_hash = hashlib.pbkdf2_hmac(
        'sha256', password.encode('utf-8'), salt, PASSWORD_ITERATIONS
    )
    return secrets.compare_digest(password_hash.hex(), hash_hex)


def create_user(name: str, email: str, password: str) -> dict:
    connection = get_connection()
    cursor = connection.cursor()
    salt, password_hash = _hash_password(password)
    created_at = datetime.datetime.utcnow().isoformat()

    try:
        cursor.execute(
            'INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)',
            (name, email.lower().strip(), password_hash, salt, created_at),
        )
        connection.commit()
    except Exception as exc:
        connection.close()
        raise RuntimeError('Unable to create user.') from exc

    user_id = cursor.lastrowid
    connection.close()
    return {
        'id': user_id,
        'name': name,
        'email': email.lower().strip(),
        'role': 'user',
        'created_at': created_at,
    }


def get_user_by_email(email: str) -> Optional[dict]:
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email.lower().strip(),))
    row = cursor.fetchone()
    connection.close()
    if row is None:
        return None
    return dict(row)


def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = get_user_by_email(email)
    if not user:
        return None

    if not verify_password(password, user['salt'], user['password_hash']):
        return None

    return user


def create_auth_token(user_id: int) -> str:
    token = secrets.token_urlsafe(TOKEN_LENGTH)
    created_at = datetime.datetime.utcnow().isoformat()
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        'INSERT INTO auth_tokens (user_id, token, created_at) VALUES (?, ?, ?)',
        (user_id, token, created_at),
    )
    connection.commit()
    connection.close()
    return token


def get_user_by_token(token: str) -> Optional[dict]:
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute(
        '''
        SELECT u.id, u.name, u.email, u.role, u.created_at
        FROM auth_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token = ?
        ''',
        (token,),
    )
    row = cursor.fetchone()
    connection.close()
    if row is None:
        return None
    return dict(row)
