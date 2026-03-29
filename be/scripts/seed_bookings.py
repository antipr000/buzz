"""
Dev seed: one purchase (booking + address + payment + tickets) on a [seed] event.

Run after `seed_events.py`. Re-run deletes this buyer's existing bookings on [seed] events, then creates a new purchase.

Run (from repo root or `be/`):
  uv run python be/scripts/seed_bookings.py
  uv run python scripts/seed_bookings.py   # if cwd is `be/`

Env:
  SEED_BUYER_USER_ID — optional UUID; defaults to DEFAULT_SEED_USER_ID in seed_constants.
"""

from __future__ import annotations

import asyncio
import os
import sys
import uuid
from datetime import date
from pathlib import Path

_BE_ROOT = Path(__file__).resolve().parents[1]
if str(_BE_ROOT) not in sys.path:
    sys.path.insert(0, str(_BE_ROOT))
os.chdir(_BE_ROOT)

from sqlalchemy import delete, select

import models  # noqa: F401 — register ORM mappers
from booking.models.booking import Booking
from booking.schemas.booking_schemas import AddressIn, PurchaseBody, TicketLineIn
from booking.services.booking_service import BookingService
from core.database import AsyncSessionLocal
from event.models.event import Event
from payment.models.payment import PaymentMethod
from scripts.seed_constants import DEFAULT_SEED_USER_ID, SEED_EVENT_TITLE_PREFIX
from scripts.seed_utils import delete_orphan_addresses_for_user
from ticket.models.ticket import TicketTier
from user.models.user import User


def _buyer_id() -> uuid.UUID:
    raw = os.environ.get("SEED_BUYER_USER_ID", DEFAULT_SEED_USER_ID).strip()
    return uuid.UUID(raw)


async def _delete_buyer_seed_bookings(session, buyer_id: uuid.UUID) -> None:
    prefix = f"{SEED_EVENT_TITLE_PREFIX}%"
    ev_subq = select(Event.id).where(Event.title.like(prefix))
    await session.execute(delete(Booking).where(Booking.user_id == buyer_id, Booking.event_id.in_(ev_subq)))
    await session.flush()


async def main() -> None:
    buyer_id = _buyer_id()

    async with AsyncSessionLocal() as session:
        user = await session.get(User, buyer_id)
        if user is None:
            raise SystemExit(
                f"No public.users row for {buyer_id}. "
                "Create the user before seeding bookings."
            )

        await _delete_buyer_seed_bookings(session, buyer_id)
        await delete_orphan_addresses_for_user(session, buyer_id)
        await session.commit()

    async with AsyncSessionLocal() as session:
        prefix = f"{SEED_EVENT_TITLE_PREFIX}%"
        stmt = (
            select(Event)
            .where(
                Event.title.like(prefix),
                Event.event_date >= date.today(),
                Event.price > 0,
            )
            .order_by(Event.event_date)
            .limit(1)
        )
        result = await session.execute(stmt)
        event = result.scalar_one_or_none()

    if event is None:
        raise SystemExit(
            "No upcoming [seed] event with price > 0. Run scripts/seed_events.py first."
        )

    price = event.price
    std = price
    prem = int(price * 1.5)

    body = PurchaseBody(
        event_id=event.id,
        tickets=[
            TicketLineIn(ticket_tier=TicketTier.STANDARD, price=std, quantity=1),
            TicketLineIn(ticket_tier=TicketTier.PREMIUM, price=prem, quantity=1),
        ],
        address=AddressIn(
            first_name="Seed",
            last_name="Buyer",
            mobile_number="+919876543210",
            email_id="seed.buyer@example.com",
            pin_code=400001,
            address_line1="Fort",
            address_line2=None,
            landmark=None,
            city="Mumbai",
            state="Maharashtra",
            country="India",
            address_type="home",
        ),
        payment_method=PaymentMethod.UPI,
    )

    async with AsyncSessionLocal() as session:
        booking, payment = await BookingService.purchase(db=session, user_id=buyer_id, body=body)

    print(f"Seeded booking for buyer {buyer_id} on event {event.id} ({event.title!r}):")
    print(f"  booking_id={booking.id}")
    print(f"  payment_id={payment.id} amount={payment.amount} status={payment.status.value}")


if __name__ == "__main__":
    asyncio.run(main())
