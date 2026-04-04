from __future__ import annotations

import uuid
from datetime import date

from pydantic import ConfigDict, EmailStr, Field

from core.schemas.schema_model import SchemaModel
from profile.models.profile import MaritalStatus, ProfileIdentify


class ProfileMeResponse(SchemaModel):
    """Merged user + profile for the authenticated account."""

    id: uuid.UUID
    email: EmailStr
    full_name: str
    birthday: date | None = None
    identify: ProfileIdentify | None = None
    marital_status: MaritalStatus | None = None
    mobile_number: str | None = None
    profile_image: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ProfileAvatarUploadResponse(SchemaModel):
    public_url: str


class ProfilePatchBody(SchemaModel):
    """Partial update: only keys present in the JSON body are applied. Omitted keys leave DB unchanged."""

    full_name: str | None = None
    birthday: date | None = None
    identify: ProfileIdentify | None = None
    marital_status: MaritalStatus | None = None
    mobile_number: str | None = Field(None, max_length=64)
    profile_image: str | None = Field(None, max_length=512)

    model_config = ConfigDict(extra="forbid")
