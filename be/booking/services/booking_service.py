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
    OrganizerVerifyBookingResponse,
    PurchaseBody,
    TicketLineOut,
)
from event.models.event import Event
from payment.models.payment import Payment, PaymentMethod, PaymentStatus
from ticket.models.ticket import Ticket, TicketTier
from ticket.tier_pricing import ensure_ticket_line_price_for_event


def _combine_event_datetime(d: date, t: time) -> datetime:
    return datetime.combine(d, t, tzinfo=timezone.utc)


def _validate_payment_method_for_total(payment_method: PaymentMethod, total: int) -> None:
    if total > 0 and payment_method == PaymentMethod.FREE:
        raise ValueError("paid_checkout_cannot_use_free_payment_method")


def _booking_to_list_item(b: Booking) -> BookingListItem:
    """Build `BookingListItem` from a loaded `Booking` (event + tickets eager-loaded)."""
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

    return BookingListItem(
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
        _validate_payment_method_for_total(body.payment_method, total)
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
        return [_booking_to_list_item(b) for b in bookings]

    @staticmethod
    async def verify_booking_for_organizer(
        db: AsyncSession,
        *,
        organizer_user_id: uuid.UUID,
        event_id: str,
        booking_id: str,
    ) -> OrganizerVerifyBookingResponse:
        raw = booking_id.strip()
        if not raw:
            raise ValueError("booking_not_found")

        ev = await db.get(Event, event_id)
        if ev is None:
            raise ValueError("event_not_found")
        if ev.organizer_id != organizer_user_id:
            raise ValueError("not_event_organizer")

        stmt = (
            select(Booking)
            .where(Booking.id == raw)
            .options(
                joinedload(Booking.event),
                joinedload(Booking.tickets),
                joinedload(Booking.payments),
            )
        )
        result = await db.execute(stmt)
        booking = result.unique().scalar_one_or_none()
        if booking is None:
            raise ValueError("booking_not_found")
        if booking.event_id != event_id:
            raise ValueError("booking_wrong_event")

        if booking.status == BookingStatus.CANCELLED:
            raise ValueError("booking_cancelled")
        if booking.status == BookingStatus.ATTENDED:
            return OrganizerVerifyBookingResponse(
                outcome="already_attended",
                booking=_booking_to_list_item(booking),
            )

        if not booking.payments:
            raise ValueError("booking_invalid_state")

        payment = booking.payments[0] # currently assuming one payment,might need to update later.

        if payment.amount > 0:
            if payment.status == PaymentStatus.PENDING_PAYMENT:
                return OrganizerVerifyBookingResponse(
                    outcome="pending_payment",
                    booking=_booking_to_list_item(booking),
                )
            if payment.status == PaymentStatus.FAILED:
                return OrganizerVerifyBookingResponse(
                    outcome="payment_failed",
                    booking=_booking_to_list_item(booking),
                )
            if payment.status != PaymentStatus.COMPLETED:
                raise ValueError("payment_not_completed")

        booking.status = BookingStatus.ATTENDED
        await db.flush()
        item = _booking_to_list_item(booking)
        await db.commit()
        return OrganizerVerifyBookingResponse(outcome="checked_in", booking=item)
