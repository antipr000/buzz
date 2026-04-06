from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from device.models.device import Device


async def upsert_device(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    device_key: str,
    device_name: str,
) -> Device:
    """Create or update the row for this install; refreshes last_used_at."""
    now = datetime.now(timezone.utc)
    result = await db.execute(select(Device).where(Device.device_key == device_key))
    row = result.scalar_one_or_none()
    if row is not None:
        row.user_id = user_id
        row.device_name = device_name
        row.last_used_at = now
    else:
        row = Device(
            user_id=user_id,
            device_key=device_key,
            device_name=device_name,
            last_used_at=now,
        )
        db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def get_device_for_user_key(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    device_key: str,
) -> Device | None:
    result = await db.execute(
        select(Device).where(Device.user_id == user_id, Device.device_key == device_key)
    )
    return result.scalar_one_or_none()


async def list_devices_for_user(db: AsyncSession, *, user_id: uuid.UUID) -> list[Device]:
    result = await db.execute(
        select(Device)
        .where(Device.user_id == user_id)
        .order_by(Device.last_used_at.desc().nulls_last(), Device.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_other_devices(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    current_device_key: str,
) -> int:
    """Remove all rows for this user except the device matching current_device_key. Returns deleted count."""
    result = await db.execute(
        delete(Device).where(
            Device.user_id == user_id,
            Device.device_key != current_device_key,
        )
    )
    await db.commit()
    return result.rowcount or 0
