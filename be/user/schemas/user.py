from datetime import datetime
import uuid

from pydantic import ConfigDict, EmailStr

from core.schemas.schema_model import SchemaModel
from user.models.user import AccountStatus


class UserResponse(SchemaModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str
    status: AccountStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
