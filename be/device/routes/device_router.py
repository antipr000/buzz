from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import get_current_user_id
from core.database import get_db
from core.schemas.common import MessageResponse
from device.schemas.device_schemas import DeleteOthersRequest, DeviceResponse, RegisterDeviceRequest
from device.services.device_service import (
    delete_other_devices,
    get_device_for_user_key,
    list_devices_for_user,
    upsert_device,
)

device_router = APIRouter(prefix="/devices", tags=["Devices"])


@device_router.post("/register", response_model=DeviceResponse)
async def register_device(
    body: RegisterDeviceRequest,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    row = await upsert_device(
        db,
        user_id=user_id,
        device_key=body.device_key,
        device_name=body.device_name,
    )
    return DeviceResponse.model_validate(row)


@device_router.get("/", response_model=list[DeviceResponse])
async def list_devices(
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    rows = await list_devices_for_user(db, user_id=user_id)
    return [DeviceResponse.model_validate(r) for r in rows]


@device_router.delete("/others", response_model=MessageResponse)
async def delete_other_devices_route(
    body: DeleteOthersRequest,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    current = await get_device_for_user_key(db, user_id=user_id, device_key=body.device_key)
    if current is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="device_key does not match a registered device for this account",
        )
    n = await delete_other_devices(db, user_id=user_id, current_device_key=body.device_key)
    return MessageResponse(message=f"Removed {n} other device(s)" if n else "No other devices to remove")
