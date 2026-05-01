import os
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

from ..db.dynamo import get_table
from ..models.user import UserCreate, UserLogin, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

_SECRET = os.getenv("JWT_SECRET", "changeme-please-set-jwt-secret-in-env")
_ALGO = "HS256"
_EXPIRE_DAYS = 7

_DEMO_EMAIL = "demo@demo.com"
_DEMO_PASSWORD = "demo1234"

# In-memory user store — used when DynamoDB is not configured
_mem_users: dict[str, str] = {}  # email -> hashed password


def _hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _make_token(email: str) -> str:
    payload = {
        "sub": email,
        "userId": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=_EXPIRE_DAYS),
    }
    return jwt.encode(payload, _SECRET, algorithm=_ALGO)


def _use_dynamo() -> bool:
    return bool(os.getenv("AWS_ACCESS_KEY_ID") and os.getenv("AWS_SECRET_ACCESS_KEY"))


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: UserCreate):
    if body.email == _DEMO_EMAIL or body.email in _mem_users:
        raise HTTPException(status_code=400, detail="Email already registered")

    if _use_dynamo():
        table = get_table()
        pk = f"AUTH#{body.email}"
        if table.get_item(Key={"PK": pk, "SK": "PROFILE"}).get("Item"):
            raise HTTPException(status_code=400, detail="Email already registered")
        table.put_item(Item={
            "PK": pk,
            "SK": "PROFILE",
            "email": body.email,
            "password_hash": _hash(body.password),
        })
    else:
        _mem_users[body.email] = _hash(body.password)

    return TokenResponse(access_token=_make_token(body.email), userId=body.email)


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin):
    if body.email == _DEMO_EMAIL and body.password == _DEMO_PASSWORD:
        return TokenResponse(access_token=_make_token(_DEMO_EMAIL), userId=_DEMO_EMAIL)

    if body.email in _mem_users:
        if not _verify(body.password, _mem_users[body.email]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return TokenResponse(access_token=_make_token(body.email), userId=body.email)

    if _use_dynamo():
        table = get_table()
        item = table.get_item(Key={"PK": f"AUTH#{body.email}", "SK": "PROFILE"}).get("Item")
        if not item or not _verify(body.password, item["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        return TokenResponse(access_token=_make_token(body.email), userId=body.email)

    raise HTTPException(status_code=401, detail="Invalid email or password")
