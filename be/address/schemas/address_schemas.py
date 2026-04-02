from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import ConfigDict, EmailStr, Field

from address.schemas.validators import AddressTypeInput
from core.schemas.schema_model import SchemaModel

_IN_PIN = Field(ge=100_000, le=999_999, description="Six-digit Indian postal index number")


class AddressCreateBody(SchemaModel):
    first_name: str = Field(max_length=128)
    last_name: str = Field(max_length=128)
    mobile_number: str = Field(max_length=64)
    email_id: EmailStr
    pin_code: int = _IN_PIN
    address_line1: str = Field(max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    landmark: str | None = Field(None, max_length=255)
    city: str = Field(max_length=128)
    state: str = Field(max_length=128)
    country: str = Field(max_length=128)
    address_type: AddressTypeInput

    model_config = ConfigDict(extra="forbid")


class AddressPatchBody(SchemaModel):
    first_name: str | None = Field(None, max_length=128)
    last_name: str | None = Field(None, max_length=128)
    mobile_number: str | None = Field(None, max_length=64)
    email_id: EmailStr | None = None
    pin_code: int | None = Field(None, ge=100_000, le=999_999)
    address_line1: str | None = Field(None, max_length=255)
    address_line2: str | None = Field(None, max_length=255)
    landmark: str | None = Field(None, max_length=255)
    city: str | None = Field(None, max_length=128)
    state: str | None = Field(None, max_length=128)
    country: str | None = Field(None, max_length=128)
    address_type: AddressTypeInput | None = None

    model_config = ConfigDict(extra="forbid")
   # Add more validations later if needed

class AddressOut(SchemaModel):
    id: str
    user_id: uuid.UUID
    address_type: str
    first_name: str
    last_name: str
    mobile_number: str
    email_id: str
    pin_code: int
    address_line1: str
    address_line2: str | None
    landmark: str | None
    city: str
    state: str
    country: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AddressListResponse(SchemaModel):
    data: list[AddressOut]
