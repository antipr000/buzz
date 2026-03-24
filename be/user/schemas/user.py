from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional

# Base schema for shared fields
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True

# Schema for creating a new user
class UserCreate(UserBase):
    password: str


# Schema for reading user data (output)
class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    # Tell Pydantic to read data from SQLAlchemy objects
    model_config = ConfigDict(from_attributes=True)
