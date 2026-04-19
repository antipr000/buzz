from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import ConfigDict, Field

from core.schemas.schema_model import SchemaModel
from payouts.models.payout import PayoutAccountType


class PayoutCreateBody(SchemaModel):
    account_holder_name: str = Field(max_length=255)
    account_number: str = Field(max_length=64)
    ifsc_code: str = Field(max_length=11)
    account_type: PayoutAccountType
    bank_name: str | None = Field(None, max_length=128)
    is_primary: bool | None = None

    model_config = ConfigDict(extra="forbid")


class PayoutPatchBody(SchemaModel):
    account_holder_name: str | None = Field(None, max_length=255)
    account_number: str | None = Field(None, max_length=64)
    ifsc_code: str | None = Field(None, max_length=11)
    account_type: PayoutAccountType | None = None
    bank_name: str | None = Field(None, max_length=128)
    is_primary: bool | None = None

    model_config = ConfigDict(extra="forbid")


class PayoutOut(SchemaModel):
    id: str
    user_id: uuid.UUID
    account_holder_name: str
    bank_name: str | None
    account_number_last4: str
    ifsc_code: str
    account_type: str
    is_primary: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PayoutListResponse(SchemaModel):
    data: list[PayoutOut]
