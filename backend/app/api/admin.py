from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId

from app.api.auth import get_current_user, get_db
from app.models.models import user_helper
from app.schemas.schemas import User as UserSchema

router = APIRouter()


async def check_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized. Admin access required.")
    return current_user


@router.get("/stats")
async def get_admin_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(check_admin)
):
    total_users = await db["users"].count_documents({})
    total_connections = await db["connections"].count_documents({})
    total_transfers = await db["transfers"].count_documents({})
    active_transfers = await db["transfers"].count_documents({"status": "running"})
    failed_transfers = await db["transfers"].count_documents({"status": "failed"})

    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$rows_transferred"}}}]
    agg = await db["transfers"].aggregate(pipeline).to_list(1)
    total_rows = agg[0]["total"] if agg else 0

    return {
        "total_users": total_users,
        "total_connections": total_connections,
        "total_transfers": total_transfers,
        "total_rows_moved": total_rows,
        "active_transfers": active_transfers,
        "failed_transfers": failed_transfers
    }


@router.get("/users", response_model=List[UserSchema])
async def get_all_users(
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(check_admin)
):
    users = []
    async for user in db["users"].find():
        users.append(user_helper(user))
    return users


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    admin: dict = Depends(check_admin)
):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account.")

    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db["users"].delete_one({"_id": ObjectId(user_id)})
    return {"message": "User deleted successfully"}
