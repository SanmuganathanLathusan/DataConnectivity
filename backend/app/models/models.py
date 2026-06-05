"""
MongoDB document helpers.
No SQLAlchemy — documents are plain Python dicts stored in MongoDB.
These dataclass-style helpers are used for type hints only.
"""
from datetime import datetime
from typing import Optional
from bson import ObjectId


def user_helper(user: dict) -> dict:
    """Serialize a MongoDB user document to a response-safe dict."""
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "is_active": user.get("is_active", 1),
        "created_at": user.get("created_at", datetime.utcnow()),
    }


def connection_helper(conn: dict) -> dict:
    """Serialize a MongoDB connection document."""
    return {
        "id": str(conn["_id"]),
        "user_id": str(conn["user_id"]),
        "name": conn["name"],
        "db_type": conn["db_type"],
        "host": conn["host"],
        "port": conn["port"],
        "username": conn["username"],
        "encrypted_password": conn.get("encrypted_password", ""),
        "database_name": conn["database_name"],
        "created_at": conn.get("created_at", datetime.utcnow()),
    }


def transfer_helper(transfer: dict, source_name: str = "Deleted", dest_name: str = "Deleted") -> dict:
    """Serialize a MongoDB transfer document."""
    return {
        "id": str(transfer["_id"]),
        "user_id": str(transfer["user_id"]),
        "source_connection_id": str(transfer.get("source_connection_id", "")),
        "destination_connection_id": str(transfer.get("destination_connection_id", "")),
        "source_connection_name": source_name,
        "destination_connection_name": dest_name,
        "table_name": transfer["table_name"],
        "status": transfer.get("status", "running"),
        "rows_transferred": transfer.get("rows_transferred", 0),
        "started_at": transfer.get("started_at", datetime.utcnow()),
        "completed_at": transfer.get("completed_at"),
        "error_message": transfer.get("error_message"),
        "execution_time": transfer.get("execution_time"),
    }
