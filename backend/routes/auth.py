"""
routes/auth.py — /api/auth/* endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, UserRepository
from auth.utils import create_access_token, create_refresh_token, decode_token
from auth.dependencies import get_current_user
from database.models import User

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email:     EmailStr
    username:  str
    full_name: str
    password:  str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username can only contain letters, numbers, _ and -")
        return v.lower()

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _token_response(user: User) -> dict:
    role = user.role.value if hasattr(user.role, "value") else str(user.role)
    payload = {"sub": str(user.id), "email": user.email, "role": role}
    return {
        "access_token":  create_access_token(payload),
        "refresh_token": create_refresh_token(payload),
        "token_type":    "bearer",
        "user": UserRepository.to_dict(user),
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)

    if await repo.get_by_email(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await repo.get_by_username(body.username):
        raise HTTPException(status_code=400, detail="Username already taken")

    user = await repo.create(
        email=body.email,
        username=body.username,
        full_name=body.full_name,
        password=body.password,
    )
    await db.commit()
    return _token_response(user)


@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    user = await repo.authenticate(body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return _token_response(user)


@router.post("/refresh")
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    repo = UserRepository(db)
    user = await repo.get_by_id(int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    return _token_response(user)


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return UserRepository.to_dict(current_user)


@router.post("/logout")
async def logout():
    # JWT is stateless — client must delete the token
    # In production add token to a Redis deny-list here
    return {"message": "Logged out successfully"}
