"""Shared helpers for dev seed scripts."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from address.models.address import Address
from booking.models.booking import Booking


async def delete_orphan_addresses_for_user(session: AsyncSession, user_id: uuid.UUID) -> None:
    """Remove addresses for ``user_id`` not referenced by any booking (``address_id``)."""
    referenced_ids = select(Booking.address_id).where(Booking.address_id.is_not(None))
    await session.execute(
        delete(Address).where(Address.user_id == user_id, ~Address.id.in_(referenced_ids))
    )
    await session.flush()


async def delete_orphan_addresses_for_users(session: AsyncSession, *user_ids: uuid.UUID) -> None:
    seen: set[uuid.UUID] = set()
    for uid in user_ids:
        if uid in seen:
            continue
        seen.add(uid)
        await delete_orphan_addresses_for_user(session, uid)
