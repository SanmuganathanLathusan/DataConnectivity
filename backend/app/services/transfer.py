import time
from datetime import datetime
from bson import ObjectId
from sqlalchemy import Table, MetaData, select, insert
from pymongo import MongoClient

from app.core.config import settings
from app.services.database import get_engine_for_connection


def _get_mongo_db():
    """Synchronous PyMongo client for background tasks."""
    client = MongoClient(settings.MONGO_URI)
    return client, client[settings.MONGO_DB_NAME]


def perform_transfer(
    transfer_id: str,
    source_id: str,
    dest_id: str,
    table_name: str,
    source_schema: str = "public",
    dest_schema: str = "public",
    column_mapping: dict = None
):
    client, db = _get_mongo_db()
    transfer_record = None
    start_time = time.time()

    try:
        source_conn = db["connections"].find_one({"_id": ObjectId(source_id)})
        dest_conn = db["connections"].find_one({"_id": ObjectId(dest_id)})
        transfer_record = db["transfers"].find_one({"_id": ObjectId(transfer_id)})

        if not source_conn or not dest_conn or not transfer_record:
            return

        source_engine = get_engine_for_connection(source_conn)
        dest_engine = get_engine_for_connection(dest_conn)

        # Adjust schema defaults based on DB type
        s_schema = source_schema if source_conn.get("db_type") == "postgresql" else None
        d_schema = dest_schema if dest_conn.get("db_type") == "postgresql" else None

        source_meta = MetaData()
        dest_meta = MetaData()

        # Reflect source table
        source_table = Table(table_name, source_meta, autoload_with=source_engine, schema=s_schema)

        # Check if destination table exists; if not, create it
        try:
            dest_table = Table(table_name, dest_meta, autoload_with=dest_engine, schema=d_schema)
        except Exception:
            cols = [c.copy() for c in source_table.columns]
            dest_table = Table(table_name, dest_meta, *cols, schema=d_schema)
            dest_table.create(dest_engine)

        with source_engine.connect() as s_conn:
            batch_size = 1000
            total_rows = 0
            result = s_conn.execute(select(source_table))

            while True:
                rows = result.fetchmany(batch_size)
                if not rows:
                    break

                data_to_insert = []
                for row in rows:
                    row_dict = row._asdict()
                    if column_mapping:
                        new_row = {d_col: row_dict[s_col] for s_col, d_col in column_mapping.items() if s_col in row_dict}
                        data_to_insert.append(new_row)
                    else:
                        data_to_insert.append(row_dict)

                if data_to_insert:
                    with dest_engine.begin() as d_conn:
                        d_conn.execute(insert(dest_table), data_to_insert)

                total_rows += len(rows)
                db["transfers"].update_one(
                    {"_id": ObjectId(transfer_id)},
                    {"$set": {"rows_transferred": total_rows}}
                )

        db["transfers"].update_one(
            {"_id": ObjectId(transfer_id)},
            {"$set": {
                "status": "success",
                "completed_at": datetime.utcnow(),
                "execution_time": int(time.time() - start_time)
            }}
        )

    except Exception as e:
        if transfer_record:
            db["transfers"].update_one(
                {"_id": ObjectId(transfer_id)},
                {"$set": {
                    "status": "failed",
                    "error_message": str(e),
                    "completed_at": datetime.utcnow(),
                    "execution_time": int(time.time() - start_time)
                }}
            )
    finally:
        client.close()
