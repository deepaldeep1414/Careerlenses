"""
backend/utils/security.py
─────────────────────────
Central security utilities:
  - password hashing / verification (bcrypt — raw, NOT passlib)
  - JWT creation / decoding
  - get_current_user FastAPI dependency
  - Role-based access control (require_role)

NOTE: This module intentionally uses the 'bcrypt' package directly.
      passlib 1.7.4 is incompatible with bcrypt >= 4.0 and must NOT be used
      for hashing/verification here.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import os
import logging

import bcrypt
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ── JWT config ────────────────────────────────────────────────────────────────
SECRET_KEY: str = os.getenv("SECRET_KEY", "insecure-default-change-me")
ALGORITHM: str  = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
)

# tokenUrl must match the login endpoint path for Swagger UI to work
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Password helpers ──────────────────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt (direct, not passlib)."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """
    Return True if plain matches the bcrypt hash.
    Handles encoding safely and catches malformed hashes gracefully.
    """
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception as exc:
        logger.error("bcrypt.checkpw failed: %s", exc)
        return False


# ── JWT helpers ───────────────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT.
    `data` should contain at least {"sub": email, "role": role}.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta
        else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """
    Decode and verify a JWT.
    Raises HTTP 401 on invalid / expired / malformed tokens.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception


# ── Auth dependency ───────────────────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    FastAPI dependency — resolves the current authenticated user payload from JWT.
    Use this on any protected endpoint.

    Usage:
        @router.get("/protected")
        def my_route(payload: dict = Depends(get_current_user)):
            return {"email": payload["sub"]}
    """
    return decode_token(token)


# ── Role-based access control ─────────────────────────────────────────────────

def require_role(*roles: str):
    """
    Dependency factory for role-gated endpoints.

    Usage:
        @router.get("/admin-only", dependencies=[Depends(require_role("admin"))])
        def admin_route():
            ...
    """
    def _checker(payload: dict = Depends(get_current_user)):
        role = payload.get("role", "user")
        if role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(roles)}",
            )
        return payload
    return _checker
