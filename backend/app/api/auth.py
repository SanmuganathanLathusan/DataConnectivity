from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import timedelta
from jose import jwt, JWTError
from bson import ObjectId

from app.db.session import get_database
from app.models.models import user_helper
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.schemas.schemas import (
    UserCreate, UserUpdate, User as UserSchema, Token, PasswordChange,
    ForgotPassword, ResetPassword, GoogleLogin
)
from app.services.email_service import send_reset_password_email
from google.oauth2 import id_token
from google.auth.transport import requests

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


def get_db() -> AsyncIOMotorDatabase:
    return get_database()


async def get_current_user(
    db: AsyncIOMotorDatabase = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await db["users"].find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user_helper(user)


@router.post("/register", response_model=UserSchema)
async def register(user_in: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    print(f"REGISTERING: Target DB: {db.name}")
    existing = await db["users"].find_one({"email": user_in.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    from datetime import datetime
    new_user = {
        "email": user_in.email,
        "name": user_in.name,
        "password_hash": get_password_hash(user_in.password),
        "is_active": 1,
        "created_at": datetime.utcnow(),
    }
    result = await db["users"].insert_one(new_user)
    created = await db["users"].find_one({"_id": result.inserted_id})
    return user_helper(created)


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=user["email"], expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/change-password")
async def change_password(
    data: PasswordChange,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_doc = await db["users"].find_one({"email": current_user["email"]})
    if not verify_password(data.old_password, user_doc["password_hash"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect old password")

    await db["users"].update_one(
        {"email": current_user["email"]},
        {"$set": {"password_hash": get_password_hash(data.new_password)}}
    )
    return {"message": "Password updated successfully"}


@router.get("/me", response_model=UserSchema)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserSchema)
async def update_me(
    data: UserUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if data.name is not None:
        update_data["name"] = data.name.strip()

    if not update_data:
        return current_user

    await db["users"].update_one(
        {"email": current_user["email"]},
        {"$set": update_data}
    )

    updated_user = await db["users"].find_one({"email": current_user["email"]})
    return user_helper(updated_user)


@router.delete("/account")
async def delete_account(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    await db["users"].delete_one({"email": current_user["email"]})
    return {"message": "Account deleted successfully"}


@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db["users"].find_one({"email": data.email})
    if not user:
        return {"message": "If that email exists, we've sent a reset link."}

    reset_token = create_access_token(subject=user["email"], expires_delta=timedelta(hours=1))
    sent = send_reset_password_email(user["email"], reset_token)
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send reset email")
    return {"message": "If that email exists, we've sent a reset link."}


@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        payload = jwt.decode(data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = await db["users"].find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db["users"].update_one(
        {"email": email},
        {"$set": {"password_hash": get_password_hash(data.new_password)}}
    )
    return {"message": "Password reset successfully"}


@router.post("/google")
async def google_auth(data: GoogleLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(
            data.id_token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])

        user = await db["users"].find_one({"email": email})
        if not user:
            from datetime import datetime
            new_user = {
                "email": email,
                "name": name,
                "password_hash": "google-authenticated",
                "is_active": 1,
                "created_at": datetime.utcnow(),
            }
            result = await db["users"].insert_one(new_user)
            user = await db["users"].find_one({"_id": result.inserted_id})

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(subject=user["email"], expires_delta=access_token_expires)
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
