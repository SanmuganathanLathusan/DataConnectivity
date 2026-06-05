from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.db.session import get_database
from app.models.models import connection_helper
from app.schemas.schemas import ConnectionCreate, Connection as ConnectionSchema, ConnectionUpdate
from app.api.auth import get_current_user, get_db
from app.services.encryption import encrypt_password
from app.services.database import test_connection_logic

router = APIRouter()


@router.get("/", response_model=List[ConnectionSchema])
async def get_connections(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cursor = db["connections"].find({"user_id": ObjectId(current_user["id"])})
    connections = []
    async for conn in cursor:
        connections.append(connection_helper(conn))
    return connections


@router.post("/", response_model=ConnectionSchema)
async def create_connection(
    conn_in: ConnectionCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    data = conn_in.dict(exclude={"password"})
    data["encrypted_password"] = encrypt_password(conn_in.password)
    data["user_id"] = ObjectId(current_user["id"])
    data["created_at"] = datetime.utcnow()

    result = await db["connections"].insert_one(data)
    created = await db["connections"].find_one({"_id": result.inserted_id})
    return connection_helper(created)


@router.put("/{conn_id}", response_model=ConnectionSchema)
async def update_connection(
    conn_id: str,
    conn_in: ConnectionUpdate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conn = await db["connections"].find_one({
        "_id": ObjectId(conn_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    update_data = conn_in.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["encrypted_password"] = encrypt_password(update_data.pop("password"))

    await db["connections"].update_one({"_id": ObjectId(conn_id)}, {"$set": update_data})
    updated = await db["connections"].find_one({"_id": ObjectId(conn_id)})
    return connection_helper(updated)


@router.delete("/{conn_id}")
async def delete_connection(
    conn_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conn = await db["connections"].find_one({
        "_id": ObjectId(conn_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    await db["connections"].delete_one({"_id": ObjectId(conn_id)})
    return {"message": "Connection deleted"}


@router.post("/{conn_id}/test")
async def test_connection_endpoint(
    conn_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conn = await db["connections"].find_one({
        "_id": ObjectId(conn_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")

    success, message = test_connection_logic(conn)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}
