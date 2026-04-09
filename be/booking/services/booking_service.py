from __future__ import annotations

import uuid
from collections import defaultdict
from datetime import date, datetime, time, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from address.models.address import Address
from booking.models.booking import Booking, BookingStatus
from booking.schemas.booking_schemas import (
    BookingListItem,
    BookingsListBody,
    PurchaseBody,
    TicketLineOut,
)
from event.models.event import Event
from payment.models.payment import Payment, PaymentStatus
from ticket.models.ticket import Ticket, TicketTier
from ticket.tier_pricing import ensure_ticket_line_price_for_event


def _combine_event_datetime(d: date, t: time) -> datetime:
    return datetime.combine(d, t, tzinfo=timezone.utc)


class BookingService:
    @staticmethod
    async def purchase(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        body: PurchaseBody,
    ) -> tuple[Booking, Payment]:
        ev = await db.get(Event, body.event_id)
        if ev is None:
            raise ValueError("Event not found")
        if ev.event_date < date.today():
            raise ValueError("Event is not upcoming")

        for line in body.tickets:
            ensure_ticket_line_price_for_event(ev, line.ticket_tier, line.price)

        total = sum(line.price * line.quantity for line in body.tickets)
        if total < 0:
            raise ValueError("Invalid ticket total")
        payment_status = (
            PaymentStatus.COMPLETED if total == 0 else PaymentStatus.PENDING_PAYMENT
        )

        if body.address_id is not None:
            addr = await db.get(Address, body.address_id)
            if addr is None or addr.user_id != user_id:
                raise ValueError("Address not found")
        else:
            addr_in = body.address
            if addr_in is None:
                raise ValueError("address is required when address_id is not sent")
            addr = Address(
                user_id=user_id,
                address_type=addr_in.address_type,
                first_name=addr_in.first_name,
                last_name=addr_in.last_name,
                mobile_number=addr_in.mobile_number,
                email=addr_in.email_id,
                address_line1=addr_in.address_line1,
                address_line2=addr_in.address_line2,
                landmark=addr_in.landmark,
                city=addr_in.city,
                state=addr_in.state,
                country=addr_in.country,
                pin_code=addr_in.pin_code,
            )
            db.add(addr)
            await db.flush()

        booking = Booking(
            user_id=user_id,
            event_id=ev.id,
            status=BookingStatus.UPCOMING,
            address_id=addr.id,
        )
        db.add(booking)
        await db.flush()

        payment = Payment(
            booking_id=booking.id,
            payment_method=body.payment_method,
            amount=total,
            status=payment_status,
        )
        db.add(payment)

        for line in body.tickets:
            for _ in range(line.quantity):
                db.add(
                    Ticket(
                        booking_id=booking.id,
                        ticket_tier=line.ticket_tier,
                        price=line.price,
                        seat=None,
                    )
                )

        await db.commit()
        await db.refresh(booking)
        await db.refresh(payment)
        return booking, payment

    @staticmethod
    async def list_bookings_for_user(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        body: BookingsListBody | None,
    ) -> list[BookingListItem]:
        stmt = (
            select(Booking)
            .where(Booking.user_id == user_id)
            .options(
                joinedload(Booking.event),
                joinedload(Booking.tickets),
            )
            .order_by(Booking.created_at.desc())
        )
        if body and body.status:
            try:
                st = BookingStatus(body.status.upper())
                stmt = stmt.where(Booking.status == st)
            except ValueError:
                pass

        result = await db.execute(stmt)
        bookings = list(result.scalars().unique().all())
        out: list[BookingListItem] = []
        for b in bookings:
            ev = b.event
            groups: dict[tuple[str, int], list[str]] = defaultdict(list)
            for t in b.tickets:
                key = (t.ticket_tier.value, t.price)
                groups[key].append(t.seat or "")

            ticket_out: list[TicketLineOut] = []
            for (tier, price), seats in groups.items():
                ticket_out.append(
                    TicketLineOut(
                        ticket_tier=tier,
                        price=price,
                        quantity=len(seats),
                        seats=seats,
                    )
                )

            out.append(
                BookingListItem(
                    id=b.id,
                    event_id=b.event_id,
                    booking_date=b.created_at,
                    title=ev.title,
                    language=ev.language,
                    date=_combine_event_datetime(ev.event_date, ev.event_time),
                    location=ev.location,
                    tickets=ticket_out,
                    event_image=ev.event_cover,
                    status=b.status.value,
                )
            )
        return out
