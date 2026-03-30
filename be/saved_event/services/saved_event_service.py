from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from common.pagination import SavedCursor, decode_saved_cursor, encode_saved_cursor
from event.models.event import Event
from event.schemas.event_schemas import EventCard, OrganizerOut, category_api_value
from event.services.event_service import _participant_counts
from profile.models.profile import Profile
from saved_event.models.saved_event import SavedEvent


def _to_card(event: Event, participants: int) -> EventCard:
    org = event.organizer
    user = org.user
    return EventCard(
        id=event.id,
        category=category_api_value(event.category),
        title=event.title,
        description=event.description,
        date=event.event_date,
        time=event.event_time,
        location=event.location,
        price=event.price,
        is_featured=event.is_featured,
        is_popular=event.is_popular,
        organizer=OrganizerOut(name=user.full_name, logo=org.profile_image),
        event_cover=event.event_cover,
        participants=participants,
        is_saved=True,
    )


class SavedEventService:
    MAX_LIMIT = 50

    @staticmethod
    async def list_saved(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        cursor_token: str | None,
        limit: int,
    ) -> tuple[list[EventCard], str | None, bool]:
        lim = min(max(limit, 1), SavedEventService.MAX_LIMIT)

        base_filters: list[Any] = [SavedEvent.user_id == user_id]

        cur = decode_saved_cursor(cursor_token) if cursor_token else None
        if cur:
            ca = cur.created_at
            eid = cur.event_id
            base_filters.append(
                or_(
                    SavedEvent.created_at < ca,
                    (SavedEvent.created_at == ca) & (SavedEvent.event_id < eid),
                )
            )

        stmt = (
            select(SavedEvent)
            .options(joinedload(SavedEvent.event).joinedload(Event.organizer).joinedload(Profile.user))
            .where(*base_filters)
            .order_by(SavedEvent.created_at.desc(), SavedEvent.event_id.desc())
            .limit(lim + 1)
        )

        rows = list((await db.execute(stmt)).scalars().unique().all())
        has_more = len(rows) > lim
        if has_more:
            rows = rows[:lim]

        events = [r.event for r in rows]
        ids = [e.id for e in events]
        counts = await _participant_counts(db, ids)
        cards = [_to_card(e, counts.get(e.id, 0)) for e in events]

        next_cursor: str | None = None
        if has_more and rows:
            last = rows[-1]
            next_cursor = encode_saved_cursor(
                SavedCursor(created_at=last.created_at, event_id=last.event_id)
            )

        return cards, next_cursor, has_more

    @staticmethod
    async def save(db: AsyncSession, *, user_id: uuid.UUID, event_id: str) -> bool:
        ev = await db.get(Event, event_id)
        if ev is None:
            raise ValueError("Event not found")
        row = await db.get(SavedEvent, (user_id, event_id))
        if row is not None:
            return False
        db.add(SavedEvent(user_id=user_id, event_id=event_id))
        await db.commit()
        return True

    @staticmethod
    async def unsave(db: AsyncSession, *, user_id: uuid.UUID, event_id: str) -> None:
        row = await db.get(SavedEvent, (user_id, event_id))
        if row is None:
            return
        await db.delete(row)
        await db.commit()
