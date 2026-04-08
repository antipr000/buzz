"""Event discovery and creation."""

from __future__ import annotations

import uuid
from datetime import date
from typing import Any

from sqlalchemy import Integer, cast, func, literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from booking.models.booking import Booking
from common.pagination import (
    DiscoverCursor,
    EventListKeyset,
    decode_discover_cursor,
    decode_event_list_keyset,
    encode_discover_cursor,
    encode_event_list_keyset,
)
from event.models.event import Event, EventCategory
from event.schemas.event_schemas import (
    CreateEventBody,
    EventCard,
    EventDetailOut,
    OrganizerOut,
    PatchEventBody,
    TicketTierPriceOut,
    category_api_value,
)
from ticket.tier_pricing import all_tier_prices
from profile.models.profile import Profile
from saved_event.models.saved_event import SavedEvent
from ticket.models.ticket import Ticket


class EventPatchForbidden(Exception):
    """Current user is not the event organizer."""


def _ensure_create_event_date_not_past(event_day: date, *, today: date | None = None) -> None:
    """Raise ValueError(event_date_past) if event_day is before the reference calendar day."""
    ref = today if today is not None else date.today()
    if event_day < ref:
        raise ValueError("event_date_past")


def _rank_tiny_expr():
    return cast(Event.is_featured, Integer) * 2 + cast(Event.is_popular, Integer)


def sanitize_discover_search_text(user_fragment: str) -> str:
    """Keep letters, digits (Unicode), and spaces. Tabs/newlines become spaces; runs collapse."""
    normalized = (
        user_fragment.replace("\r\n", " ")
        .replace("\n", " ")
        .replace("\r", " ")
        .replace("\t", " ")
    )
    kept = "".join(c for c in normalized if c.isalnum() or c == " ")
    return " ".join(kept.split())


def _discover_text_search_predicate(q: str | None) -> Any | None:
    """Return OR(title, description, location) ILIKE predicate, or None if no search."""
    if q is None:
        return None
    raw = q.strip()
    if not raw:
        return None
    needle = sanitize_discover_search_text(raw)
    if not needle:
        return None
    pattern = f"%{needle}%"
    return or_(
        Event.title.ilike(pattern),
        Event.description.ilike(pattern),
        Event.location.ilike(pattern),
    )


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


async def _saved_event_ids_for_user(
    db: AsyncSession, user_id: uuid.UUID, event_ids: list[str]
) -> set[str]:
    if not event_ids:
        return set()
    stmt = select(SavedEvent.event_id).where(
        SavedEvent.user_id == user_id,
        SavedEvent.event_id.in_(event_ids),
    )
    rows = (await db.execute(stmt)).scalars().all()
    return set(rows)


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


def _to_event_card(event: Event, participants: int, *, is_saved: bool) -> EventCard:
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
        is_saved=is_saved,
        latitude=event.latitude,
        longitude=event.longitude,
    )


class EventService:
    MAX_LIMIT = 50

    @staticmethod
    async def discover(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        lat: float,
        lng: float,
        radius_km: int,
        category: str | None,
        cursor_token: str | None,
        limit: int,
        q: str | None = None,
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
        text_pred = _discover_text_search_predicate(q)
        if text_pred is not None:
            filters.append(text_pred)
        if category and category.strip().lower() not in ("all", ""):
            cat_lower = category.strip().lower()
            try:
                ec = next(c for c in EventCategory if c.value.lower() == cat_lower)
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
        saved_ids = await _saved_event_ids_for_user(db, user_id, ids)
        cards = [
            _to_event_card(e, counts.get(e.id, 0), is_saved=e.id in saved_ids)
            for e in events
        ]

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
    async def get_by_id(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        event_id: str,
    ) -> EventDetailOut | None:
        """Return a single event with tier prices, or None if not found."""
        stmt = (
            select(Event)
            .options(joinedload(Event.organizer).joinedload(Profile.user))
            .where(Event.id == event_id)
        )
        result = await db.execute(stmt)
        event = result.scalars().unique().one_or_none()
        if event is None:
            return None
        counts = await _participant_counts(db, [event_id])
        saved_ids = await _saved_event_ids_for_user(db, user_id, [event_id])
        card = _to_event_card(
            event, counts.get(event_id, 0), is_saved=event_id in saved_ids
        )
        tiers = [
            TicketTierPriceOut(tier=t.value, price=p)
            for t, p in all_tier_prices(event.price)
        ]
        return EventDetailOut(
            **card.model_dump(),
            ticket_tiers=tiers,
            is_organizer=(event.organizer_id == user_id),
        )

    @staticmethod
    async def list_created_by_organizer(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        cursor_token: str | None,
        limit: int,
    ) -> tuple[list[EventCard], str | None, bool]:
        """Events created by the user (organizer), newest first, keyset paginated."""
        lim = min(max(limit, 1), EventService.MAX_LIMIT)

        base_filters: list[Any] = [Event.organizer_id == user_id]

        cur = decode_event_list_keyset(cursor_token) if cursor_token else None
        if cur:
            ca = cur.created_at
            eid = cur.event_id
            base_filters.append(
                or_(
                    Event.created_at < ca,
                    (Event.created_at == ca) & (Event.id < eid),
                )
            )

        stmt = (
            select(Event)
            .options(joinedload(Event.organizer).joinedload(Profile.user))
            .where(*base_filters)
            .order_by(Event.created_at.desc(), Event.id.desc())
            .limit(lim + 1)
        )

        events = list((await db.execute(stmt)).scalars().unique().all())
        has_more = len(events) > lim
        if has_more:
            events = events[:lim]

        ids = [e.id for e in events]
        counts = await _participant_counts(db, ids)
        saved_ids = await _saved_event_ids_for_user(db, user_id, ids)
        cards = [
            _to_event_card(e, counts.get(e.id, 0), is_saved=e.id in saved_ids)
            for e in events
        ]

        next_cursor: str | None = None
        if has_more and events:
            last = events[-1]
            next_cursor = encode_event_list_keyset(
                EventListKeyset(created_at=last.created_at, event_id=last.id)
            )

        return cards, next_cursor, has_more

    @staticmethod
    async def patch_owned(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        event_id: str,
        body: PatchEventBody,
    ) -> EventDetailOut | None:
        """Apply partial update; None if event missing; EventPatchForbidden if not organizer."""
        stmt = (
            select(Event)
            .options(joinedload(Event.organizer).joinedload(Profile.user))
            .where(Event.id == event_id)
        )
        result = await db.execute(stmt)
        event = result.scalars().unique().one_or_none()
        if event is None:
            return None
        if event.organizer_id != user_id:
            raise EventPatchForbidden()

        if event.event_date <= date.today():  # date.today() based on server's timezone
            raise ValueError("event_not_editable_past")

        raw = body.model_dump(exclude_unset=True)
        if not raw:
            raise ValueError("no_fields")

        if "title" in raw:
            t = (raw["title"] or "").strip()
            if not t:
                raise ValueError("title_empty")
            event.title = t
        if "description" in raw:
            d = (raw["description"] or "").strip()
            if not d:
                raise ValueError("description_empty")
            event.description = d
        if "event_cover" in raw:
            c = raw["event_cover"]
            url = None if c is None else c.strip()
            if not url:
                raise ValueError("event_cover_invalid")
            event.event_cover = url

        await db.commit()
        return await EventService.get_by_id(db, user_id=user_id, event_id=event_id)

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

        _ensure_create_event_date_not_past(body.date)

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
