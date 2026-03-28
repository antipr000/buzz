"""Event discovery and creation."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from sqlalchemy import Integer, cast, func, literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from booking.models.booking import Booking
from common.pagination import DiscoverCursor, decode_discover_cursor, encode_discover_cursor
from event.models.event import Event, EventCategory
from event.schemas.event_schemas import (
    CreateEventBody,
    EventCard,
    OrganizerOut,
    category_api_value,
)
from profile.models.profile import Profile
from ticket.models.ticket import Ticket


def _rank_tiny_expr():
    return cast(Event.is_featured, Integer) * 2 + cast(Event.is_popular, Integer)


def _haversine_km(lat: float, lng: float):
    """SQL expression for distance in km from (lat, lng) to Event.latitude/longitude."""
    rlat = func.radians(literal(lat))
    elat = func.radians(Event.latitude)
    dlon = func.radians(Event.longitude - literal(lng))
    dlat = func.radians(Event.latitude - literal(lat))
    a = func.pow(func.sin(dlat / 2), 2) + func.cos(rlat) * func.cos(elat) * func.pow(
        func.sin(dlon / 2), 2
    )
    c = 2 * func.asin(func.sqrt(a))
    return literal(6371.0) * c


async def _participant_counts(db: AsyncSession, event_ids: list[str]) -> dict[str, int]:
    if not event_ids:
        return {}
    stmt = (
        select(Booking.event_id, func.count(Ticket.id))
        .join(Ticket, Ticket.booking_id == Booking.id)
        .where(Booking.event_id.in_(event_ids))
        .group_by(Booking.event_id)
    )
    rows = (await db.execute(stmt)).all()
    return {eid: int(cnt) for eid, cnt in rows}


def _to_event_card(event: Event, participants: int) -> EventCard:
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
    )


class EventService:
    MAX_LIMIT = 50

    @staticmethod
    async def discover(
        db: AsyncSession,
        *,
        lat: float,
        lng: float,
        radius_km: int,
        category: str | None,
        cursor_token: str | None,
        limit: int,
    ) -> tuple[list[EventCard], str | None, bool, str | None]:
        """Return trending events within radius, paginated."""
        lim = min(max(limit, 1), EventService.MAX_LIMIT)
        today = date.today()
        rank_col = _rank_tiny_expr()
        dist = _haversine_km(lat, lng)

        filters: list[Any] = [
            Event.latitude.is_not(None),
            Event.longitude.is_not(None),
            dist <= literal(float(radius_km)),
            Event.event_date >= today,
        ]
        if category and category.strip().lower() not in ("all", ""):
            cat_key = category.strip().title()
            try:
                ec = next(c for c in EventCategory if c.value == cat_key)
                filters.append(Event.category == ec)
            except StopIteration:
                pass

        cur = decode_discover_cursor(cursor_token) if cursor_token else None
        if cur:
            rk = cur.rank_tiny
            ca = cur.created_at
            eid = cur.event_id
            filters.append(
                or_(
                    rank_col < rk,
                    (rank_col == rk) & (Event.created_at < ca),
                    (rank_col == rk) & (Event.created_at == ca) & (Event.id < eid),
                )
            )

        stmt = (
            select(Event)
            .options(joinedload(Event.organizer).joinedload(Profile.user))
            .where(*filters)
            .order_by(rank_col.desc(), Event.created_at.desc(), Event.id.desc())
            .limit(lim + 1)
        )

        result = await db.execute(stmt)
        events = list(result.scalars().unique().all())
        has_more = len(events) > lim
        if has_more:
            events = events[:lim]

        ids = [e.id for e in events]
        counts = await _participant_counts(db, ids)
        cards = [_to_event_card(e, counts.get(e.id, 0)) for e in events]

        next_cursor: str | None = None
        if has_more and events:
            last = events[-1]
            rk = int(last.is_featured) * 2 + int(last.is_popular)
            next_cursor = encode_discover_cursor(
                DiscoverCursor(
                    rank_tiny=rk,
                    created_at=last.created_at,
                    event_id=last.id,
                )
            )

        user_location = f"{lat:.4f},{lng:.4f}"
        return cards, next_cursor, has_more, user_location

    @staticmethod
    async def create(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        body: CreateEventBody,
    ) -> Event:
        p = await db.get(Profile, user_id)
        if p is None:
            raise ValueError("Profile required to create events")

        ev = Event(
            title=body.title,
            description=body.description,
            category=body.category,
            event_date=body.date,
            event_time=body.time,
            location=body.location,
            price=body.price,
            event_cover=body.event_cover,
            organizer_id=user_id,
            latitude=body.latitude,
            longitude=body.longitude,
            language=body.language,
        )
        db.add(ev)
        await db.commit()
        await db.refresh(ev)
        return ev
