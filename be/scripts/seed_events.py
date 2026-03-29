"""
Dev seed: events marked with title prefix [seed] (see seed_constants).

Requires the same DB_* / .env as the FastAPI app.

Delete-on-rerun: removes prior [seed] events (and their bookings) then inserts fresh rows.

Run (from repo root or `be/`):
  uv run python be/scripts/seed_events.py
  uv run python scripts/seed_events.py   # if cwd is `be/`

Env:
  SEED_ORGANIZER_USER_ID — optional UUID; defaults to DEFAULT_SEED_USER_ID in seed_constants.
"""

from __future__ import annotations

import asyncio
import calendar
import os
import sys
import uuid
from datetime import date, time, timedelta
from pathlib import Path

_BE_ROOT = Path(__file__).resolve().parents[1]
if str(_BE_ROOT) not in sys.path:
    sys.path.insert(0, str(_BE_ROOT))
os.chdir(_BE_ROOT)

from sqlalchemy import delete, select

import models  # noqa: F401 — register ORM mappers
from booking.models.booking import Booking
from core.database import AsyncSessionLocal
from event.models.event import Event, EventCategory
from profile.models.profile import Profile
from scripts.seed_constants import (
    DEFAULT_SEED_USER_ID,
    SEED_EVENT_COVER_URL,
    SEED_EVENT_TITLE_PREFIX,
    SEED_LAT,
    SEED_LNG,
)
from scripts.seed_utils import delete_orphan_addresses_for_users
from user.models.user import User


def _organizer_id() -> uuid.UUID:
    raw = os.environ.get("SEED_ORGANIZER_USER_ID", DEFAULT_SEED_USER_ID).strip()
    return uuid.UUID(raw)


def _buyer_id_for_cleanup() -> uuid.UUID:
    raw = os.environ.get("SEED_BUYER_USER_ID", DEFAULT_SEED_USER_ID).strip()
    return uuid.UUID(raw)


def _add_calendar_months(d: date, months: int) -> date:
    """Same day-of-month when possible; clamp to last day of month (e.g. Jan 31 → Feb 28)."""
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


async def _remove_existing_seed_events(session) -> None:
    prefix = f"{SEED_EVENT_TITLE_PREFIX}%"
    ev_result = await session.execute(select(Event.id).where(Event.title.like(prefix)))
    event_ids = [row[0] for row in ev_result.all()]
    if not event_ids:
        return
    await session.execute(delete(Booking).where(Booking.event_id.in_(event_ids)))
    await session.execute(delete(Event).where(Event.id.in_(event_ids)))
    await session.flush()


async def main() -> None:
    organizer_id = _organizer_id()
    buyer_cleanup_id = _buyer_id_for_cleanup()

    async with AsyncSessionLocal() as session:
        user = await session.get(User, organizer_id)
        if user is None:
            raise SystemExit(
                f"No public.users row for {organizer_id}. "
                "Create the user (e.g. sign up / trigger) before seeding."
            )
        profile = await session.get(Profile, organizer_id)
        if profile is None:
            raise SystemExit(
                f"No profiles row for {organizer_id}. "
                "Profile is required for organizer_id on events."
            )

        await _remove_existing_seed_events(session)
        await delete_orphan_addresses_for_users(session, organizer_id, buyer_cleanup_id)

        today = date.today()
        base_event_date = _add_calendar_months(today, 1)
        cover = SEED_EVENT_COVER_URL
        lat0, lng0 = SEED_LAT, SEED_LNG

        # One row per EventCategory (matches app `common/category` icons).
        specs: list[tuple[str, str, EventCategory, int, date, time, str, float, float, bool, bool]] = [
            (
                f"{SEED_EVENT_TITLE_PREFIX} Indie Night Mumbai",
                "Live indie sets and DJ afterparty. Seed data.",
                EventCategory.MUSIC,
                499,
                base_event_date + timedelta(days=7),
                time(19, 30),
                "Phoenix Palladium, Lower Parel, Mumbai",
                lat0 + 0.01,
                lng0 + 0.01,
                True,
                True,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Contemporary Art Walk",
                "Curator-led tour of new installations. Seed data.",
                EventCategory.ART,
                0,
                base_event_date + timedelta(days=3),
                time(11, 0),
                "Kala Ghoda, Fort, Mumbai",
                lat0 + 0.008,
                lng0 - 0.006,
                False,
                True,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Monsoon Food Walk",
                "Street food crawl. Seed data.",
                EventCategory.FOOD,
                350,
                base_event_date,
                time(16, 30),
                "Juhu Beach Road, Mumbai",
                lat0 + 0.02,
                lng0 - 0.02,
                False,
                False,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Sunrise HIIT on the Pier",
                "Outdoor bootcamp, mats provided. Seed data.",
                EventCategory.FITNESS,
                199,
                base_event_date + timedelta(days=5),
                time(6, 30),
                "Bandra Bandstand, Mumbai",
                lat0 - 0.012,
                lng0 + 0.007,
                True,
                False,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Tech Meetup — Async Python",
                "Talks on FastAPI and SQLAlchemy 2. Seed data.",
                EventCategory.TECH,
                0,
                base_event_date + timedelta(days=14),
                time(18, 0),
                "WeWork, BKC, Mumbai",
                lat0 - 0.008,
                lng0 + 0.012,
                True,
                False,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Weekend LAN & boardgames",
                "Casual tournaments and pizza. Seed data.",
                EventCategory.GAMING,
                250,
                base_event_date + timedelta(days=10),
                time(15, 0),
                "Andheri West community hall, Mumbai",
                lat0 + 0.004,
                lng0 + 0.015,
                False,
                True,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Monsoon cricket league — finals",
                "Local league finals, stands open. Seed data.",
                EventCategory.SPORTS,
                150,
                base_event_date + timedelta(days=18),
                time(16, 0),
                "Shivaji Park Maidan, Mumbai",
                lat0 - 0.015,
                lng0 - 0.004,
                False,
                False,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Rooftop house & techno",
                "Late-night DJ set, 21+. Seed data.",
                EventCategory.NIGHTLIFE,
                899,
                base_event_date + timedelta(days=12),
                time(22, 0),
                "Lower Parel rooftop, Mumbai",
                lat0 + 0.011,
                lng0 + 0.003,
                True,
                True,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Ceramic glazing workshop",
                "Two-hour hands-on session, materials included. Seed data.",
                EventCategory.WORKSHOP,
                1200,
                base_event_date + timedelta(days=9),
                time(14, 0),
                "Khar studio space, Mumbai",
                lat0 - 0.006,
                lng0 - 0.011,
                False,
                False,
            ),
            (
                f"{SEED_EVENT_TITLE_PREFIX} Network & founders evening",
                "Founders and investors. Seed data.",
                EventCategory.NETWORK,
                1200,
                base_event_date + timedelta(days=21),
                time(17, 0),
                "Nehru Centre, Worli, Mumbai",
                lat0 + 0.005,
                lng0 - 0.009,
                False,
                True,
            ),
        ]

        created_ids: list[str] = []
        for (
            title,
            description,
            category,
            price,
            ev_date,
            ev_time,
            location,
            lat,
            lng,
            featured,
            popular,
        ) in specs:
            ev = Event(
                title=title,
                description=description,
                category=category,
                event_date=ev_date,
                event_time=ev_time,
                location=location,
                price=price,
                event_cover=cover,
                is_featured=featured,
                is_popular=popular,
                organizer_id=organizer_id,
                latitude=lat,
                longitude=lng,
                language="en",
            )
            session.add(ev)
            await session.flush()
            created_ids.append(ev.id)

        await session.commit()

    print(f"Seeded {len(created_ids)} events for organizer {organizer_id}:")
    for eid in created_ids:
        print(f"  - {eid}")
    print(
        f"Discover: use lat={SEED_LAT}, lng={SEED_LNG} and a generous radius_km "
        "(events are offset slightly around this point)."
    )


if __name__ == "__main__":
    asyncio.run(main())
