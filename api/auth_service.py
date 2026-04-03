"""
auth_service.py
JWT-based authentication for English Adventure.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db
from models import User

SECRET_KEY  = os.getenv("JWT_SECRET", "change-me-in-production-please")
ALGORITHM   = "HS256"
TOKEN_TTL   = 60 * 24 * 7   # minutes → 7 days

pwd_ctx  = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2   = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Helpers ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    # bcrypt supports max 72 bytes; truncate safely
    return pwd_ctx.hash(password.encode("utf-8")[:72])

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain.encode("utf-8")[:72], hashed)

def create_token(user_id: int) -> str:
    expire = datetime.now(tz=timezone.utc) + timedelta(minutes=TOKEN_TTL)
    return jwt.encode({"sub": str(user_id), "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


# ── Dependency ───────────────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2),
    db: Session = Depends(get_db),
) -> User:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", "0"))
    except (JWTError, ValueError):
        raise credentials_exc

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise credentials_exc
    return user
