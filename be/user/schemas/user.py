from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    first_name: str
    last_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
