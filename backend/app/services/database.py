from sqlalchemy import create_engine, inspect, text
from app.services.encryption import decrypt_password


def _get_attr(connection_data, key):
    """Support both dict and object-style connection data."""
    if isinstance(connection_data, dict):
        return connection_data.get(key)
    return getattr(connection_data, key, None)


def get_engine_for_connection(connection_data):
    password = decrypt_password(_get_attr(connection_data, "encrypted_password"))
    db_type = _get_attr(connection_data, "db_type")
    username = _get_attr(connection_data, "username")
    host = _get_attr(connection_data, "host")
    port = _get_attr(connection_data, "port")
    database_name = _get_attr(connection_data, "database_name")

    if db_type == "postgresql":
        db_url = f"postgresql://{username}:{password}@{host}:{port}/{database_name}"
    elif db_type == "mysql":
        db_url = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_name}"
    else:
        raise ValueError(f"Unsupported database type: {db_type}")

    return create_engine(db_url)


def test_connection_logic(connection_data):
    try:
        engine = get_engine_for_connection(connection_data)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "Connection successful"
    except Exception as e:
        return False, str(e)


def get_db_metadata(connection_data):
    engine = get_engine_for_connection(connection_data)
    inspector = inspect(engine)

    schemas = inspector.get_schema_names()
    metadata = {}

    SYSTEM_SCHEMAS = {'information_schema', 'performance_schema', 'sys', 'mysql', 'pg_catalog', 'pg_toast'}

    for schema in schemas:
        if schema in SYSTEM_SCHEMAS:
            continue
        tables = inspector.get_table_names(schema=schema)
        views = inspector.get_view_names(schema=schema)
        metadata[schema] = {"tables": tables, "views": views}

    return metadata


def get_table_details(connection_data, schema, table_name):
    engine = get_engine_for_connection(connection_data)
    inspector = inspect(engine)

    columns = inspector.get_columns(table_name, schema=schema)
    return [
        {
            "name": col["name"],
            "type": str(col["type"]),
            "nullable": col.get("nullable", True),
            "default": str(col.get("default")) if col.get("default") is not None else None
        } for col in columns
    ]


def get_table_preview(connection_data, schema, table_name, limit=100, filters=None):
    engine = get_engine_for_connection(connection_data)
    db_type = _get_attr(connection_data, "db_type")

    if db_type == "postgresql":
        query = text(f'SELECT * FROM "{schema}"."{table_name}" LIMIT :limit')
    else:
        query = text(f"SELECT * FROM `{schema}`.`{table_name}` LIMIT :limit")

    with engine.connect() as conn:
        result = conn.execute(query, {"limit": limit})
        columns = list(result.keys())
        data = [dict(zip(columns, row)) for row in result]

    return {"columns": columns, "data": data}
