"""
backend/models/user.py
──────────────────────
SQLAlchemy ORM model + Pydantic schemas for Users.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from pydantic import BaseModel, EmailStr, field_validator
from database import Base


# ── ORM model ─────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    email         = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role          = Column(String, default="user", nullable=False)   # "user" | "admin"
    created_at    = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    """Payload for POST /auth/register"""
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class UserLogin(BaseModel):
    """Payload for POST /auth/login (JSON body variant — not used by OAuth2 form)"""
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    """Safe user fields returned to the client — never exposes password_hash"""
    id: int
    name: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserPublic


class TokenData(BaseModel):
    email: str | None = None
    role: str | None = None
