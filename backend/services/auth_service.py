"""
backend/services/auth_service.py
─────────────────────────────────
Business-logic layer for authentication.
Keeps routers thin — all DB access goes here.
"""
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.user import User, UserRegister, UserLogin, Token, UserPublic
from utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)


def register_user(payload: UserRegister, db: Session) -> dict:
    """
    Create a new user account.
    - Validates no duplicate email
    - Hashes password via bcrypt
    - Persists to DB
    Returns a simple success message.
    """
    # Duplicate check
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully", "email": user.email}


def login_user(payload: UserLogin, db: Session) -> Token:
    """
    Authenticate a user and return a JWT.
    - Finds user by email
    - Verifies bcrypt password
    - Issues signed JWT containing email + role
    Returns Token schema with access_token + user info.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    # Use constant-time check to avoid timing attacks
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        data={"sub": user.email, "role": user.role, "name": user.name},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(
        access_token=token,
        token_type="bearer",
        user=UserPublic.model_validate(user),
    )


def get_user_by_email(email: str, db: Session) -> User:
    """Fetch a User ORM object by email — raises 404 if missing."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user
