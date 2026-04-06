from __future__ import annotations

from datetime import datetime

from pydantic import ConfigDict, Field

from core.schemas.schema_model import SchemaModel


class RegisterDeviceRequest(SchemaModel):
    """POST /devices/register — upsert row for this install; server sets last_used_at."""

    device_key: str = Field(..., min_length=1, max_length=255)
    device_name: str = Field(..., min_length=1, max_length=255)


class DeleteOthersRequest(SchemaModel):
    """DELETE /devices/others — must be the authenticated user's current device row."""

    device_key: str = Field(..., min_length=1, max_length=255)


class DeviceResponse(SchemaModel):
    """Single row for GET /devices."""

    id: str
    device_key: str
    device_name: str
    last_used_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
