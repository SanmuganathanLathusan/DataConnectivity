from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.api.auth import get_current_user, get_db
from app.services.database import get_db_metadata, get_table_details, get_table_preview

router = APIRouter()


@router.get("/{conn_id}/metadata")
async def get_connection_metadata(
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
    try:
        return get_db_metadata(conn)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch metadata: {str(e)}")


@router.get("/{conn_id}/table-preview")
async def preview_table(
    conn_id: str,
    schema: str,
    table_name: str,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conn = await db["connections"].find_one({
        "_id": ObjectId(conn_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return get_table_preview(conn, schema, table_name, limit)


@router.get("/{conn_id}/table-columns")
async def get_columns(
    conn_id: str,
    schema: str,
    table_name: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    conn = await db["connections"].find_one({
        "_id": ObjectId(conn_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return get_table_details(conn, schema, table_name)
