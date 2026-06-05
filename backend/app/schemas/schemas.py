from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# Auth
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

class GoogleLogin(BaseModel):
    id_token: str

# Connections
class ConnectionBase(BaseModel):
    name: str
    db_type: str
    host: str
    port: int
    username: str
    database_name: str

class ConnectionCreate(ConnectionBase):
    password: str

class ConnectionUpdate(BaseModel):
    name: Optional[str] = None
    host: Optional[str] = None
    port: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    database_name: Optional[str] = None

class Connection(ConnectionBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

# Transfers
class TransferBase(BaseModel):
    source_connection_id: str
    destination_connection_id: str
    table_name: str
    source_schema: Optional[str] = "public"
    dest_schema: Optional[str] = "public"
    column_mapping: Optional[dict] = None

class TransferResponse(BaseModel):
    id: str
    status: str
    rows_transferred: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    execution_time: Optional[int] = None
    source_connection_id: str
    destination_connection_id: str
    source_connection_name: Optional[str] = None
    destination_connection_name: Optional[str] = None
    table_name: str

    class Config:
        from_attributes = True

# Dashboard
class DashboardStats(BaseModel):
    total_connections: int
    active_transfers: int
    total_rows_transferred: int
    recent_transfers: List[TransferResponse]
    failed_transfers_count: int
