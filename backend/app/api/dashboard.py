from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.db.session import get_database
from app.models.models import transfer_helper
from app.schemas.schemas import DashboardStats
from app.api.auth import get_current_user, get_db

router = APIRouter()


@router.get("/", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    uid = ObjectId(current_user["id"])
    total_connections = await db["connections"].count_documents({"user_id": uid})
    active_transfers = await db["transfers"].count_documents({"user_id": uid, "status": "running"})
    failed_transfers_count = await db["transfers"].count_documents({"user_id": uid, "status": "failed"})

    # Sum rows_transferred
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": None, "total": {"$sum": "$rows_transferred"}}}
    ]
    agg = await db["transfers"].aggregate(pipeline).to_list(1)
    total_rows = agg[0]["total"] if agg else 0

    # Recent 5 transfers
    cursor = db["transfers"].find({"user_id": uid}).sort("started_at", -1).limit(5)
    recent_raw = await cursor.to_list(5)

    recent_transfers = []
    for t in recent_raw:
        src_name = "Deleted"
        dst_name = "Deleted"
        try:
            src = await db["connections"].find_one({"_id": ObjectId(t.get("source_connection_id"))})
            if src:
                src_name = src.get("name", "Deleted")
        except Exception:
            pass
        try:
            dst = await db["connections"].find_one({"_id": ObjectId(t.get("destination_connection_id"))})
            if dst:
                dst_name = dst.get("name", "Deleted")
        except Exception:
            pass
        recent_transfers.append(transfer_helper(t, src_name, dst_name))

    return {
        "total_connections": total_connections,
        "active_transfers": active_transfers,
        "total_rows_transferred": total_rows,
        "recent_transfers": recent_transfers,
        "failed_transfers_count": failed_transfers_count
    }


@router.get("/notifications")
async def get_notifications(
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    uid = ObjectId(current_user["id"])
    cursor = db["transfers"].find({"user_id": uid}).sort("started_at", -1).limit(10)
    recent_transfers = await cursor.to_list(10)

    notifications = []
    for t in recent_transfers:
        if t["status"] == "success":
            title = "Transfer Complete"
            icon = "DatabaseZap"
            color = "text-emerald-500"
            desc = f"Table \"{t['table_name']}\" migrated successfully."
            time = t.get("completed_at")
        elif t["status"] == "failed":
            title = "Transfer Failed"
            icon = "AlertCircle"
            color = "text-rose-500"
            desc = f"Error migrating \"{t['table_name']}\"."
            time = t.get("completed_at")
        else:
            title = "Transfer Running"
            icon = "Activity"
            color = "text-brand-500"
            desc = f"Migrating \"{t['table_name']}\"..."
            time = t.get("started_at")

        notifications.append({
            "id": str(t["_id"]),
            "title": title,
            "desc": desc,
            "time": time.isoformat() if time else None,
            "icon": icon,
            "color": color
        })

    return notifications
