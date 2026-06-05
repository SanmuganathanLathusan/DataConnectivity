from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from bson import ObjectId
from datetime import datetime

from app.db.session import get_database
from app.models.models import transfer_helper
from app.schemas.schemas import TransferBase, TransferResponse
from app.api.auth import get_current_user, get_db
from app.services.transfer import perform_transfer

router = APIRouter()


async def _enrich_transfer(db, transfer: dict) -> dict:
    """Fetch source/dest connection names and serialize the transfer."""
    source_name = "Deleted"
    dest_name = "Deleted"
    try:
        src = await db["connections"].find_one({"_id": ObjectId(transfer.get("source_connection_id"))})
        if src:
            source_name = src.get("name", "Deleted")
    except Exception:
        pass
    try:
        dst = await db["connections"].find_one({"_id": ObjectId(transfer.get("destination_connection_id"))})
        if dst:
            dest_name = dst.get("name", "Deleted")
    except Exception:
        pass
    return transfer_helper(transfer, source_name, dest_name)


@router.post("/", response_model=TransferResponse)
async def start_transfer(
    transfer_in: TransferBase,
    background_tasks: BackgroundTasks,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    new_transfer = {
        "user_id": ObjectId(current_user["id"]),
        "source_connection_id": ObjectId(transfer_in.source_connection_id),
        "destination_connection_id": ObjectId(transfer_in.destination_connection_id),
        "table_name": transfer_in.table_name,
        "status": "running",
        "rows_transferred": 0,
        "started_at": datetime.utcnow(),
        "completed_at": None,
        "error_message": None,
        "execution_time": None,
    }
    result = await db["transfers"].insert_one(new_transfer)
    created = await db["transfers"].find_one({"_id": result.inserted_id})

    background_tasks.add_task(
        perform_transfer,
        transfer_id=str(result.inserted_id),
        source_id=transfer_in.source_connection_id,
        dest_id=transfer_in.destination_connection_id,
        table_name=transfer_in.table_name,
        source_schema=transfer_in.source_schema,
        dest_schema=transfer_in.dest_schema,
        column_mapping=transfer_in.column_mapping
    )

    return await _enrich_transfer(db, created)


@router.get("/", response_model=List[TransferResponse])
async def get_transfers(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    cursor = db["transfers"].find(
        {"user_id": ObjectId(current_user["id"])}
    ).sort("started_at", -1)

    results = []
    async for t in cursor:
        results.append(await _enrich_transfer(db, t))
    return results


@router.get("/{transfer_id}", response_model=TransferResponse)
async def get_transfer(
    transfer_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    transfer = await db["transfers"].find_one({
        "_id": ObjectId(transfer_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    return await _enrich_transfer(db, transfer)


@router.delete("/{transfer_id}")
async def delete_transfer(
    transfer_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    transfer = await db["transfers"].find_one({
        "_id": ObjectId(transfer_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    await db["transfers"].delete_one({"_id": ObjectId(transfer_id)})
    return {"message": "Transfer record deleted"}


@router.patch("/{transfer_id}/cancel")
async def cancel_transfer(
    transfer_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    transfer = await db["transfers"].find_one({
        "_id": ObjectId(transfer_id),
        "user_id": ObjectId(current_user["id"])
    })
    if not transfer:
        raise HTTPException(status_code=404, detail="Transfer not found")
    if transfer.get("status") != "running":
        raise HTTPException(status_code=400, detail="Only running transfers can be cancelled")
    await db["transfers"].update_one(
        {"_id": ObjectId(transfer_id)},
        {"$set": {"status": "failed", "error_message": "Manually cancelled by user"}}
    )
    return {"message": "Transfer cancelled"}
