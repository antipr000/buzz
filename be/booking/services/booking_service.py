from __future__ import annotations

import logging
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
    VerifyRazorpayPaymentBody,
)
from event.models.event import Event
from payment.models.payment import Payment, PaymentMethod, PaymentStatus
from payment.razorpay_client import (
    create_order,
    razorpay_credentials_configured,
    verify_payment_signature,
)
from razorpay.errors import SignatureVerificationError
from ticket.models.ticket import Ticket
from ticket.tier_pricing import ensure_ticket_line_price_for_event

logger = logging.getLogger(__name__)


def _combine_event_datetime(d: date, t: time) -> datetime:
    return datetime.combine(d, t, tzinfo=timezone.utc)


def _validate_payment_method_for_total(payment_method: PaymentMethod, total: int) -> None:
    if total > 0 and payment_method == PaymentMethod.FREE:
        raise ValueError("paid_checkout_cannot_use_free_payment_method")


def _needs_razorpay_order(total: int, payment_method: PaymentMethod) -> bool:
    """Online gateway: paid amount and not cash-on-delivery."""
    if total <= 0:
        return False
    if payment_method == PaymentMethod.CASH_ON_DELIVERY:
        return False
    return True


def _normalize_currency(currency: str) -> str:
    """Strip/uppercase ISO code; empty → INR (caller should send valid 3-letter codes)."""
    raw = (currency or "").strip()
    return raw.upper() if raw else "INR"


def _amount_minor_units_for_razorpay(total: int, currency: str) -> int:
    """Razorpay `amount` in smallest currency unit (e.g. paise for INR)."""
    c = _normalize_currency(currency)
    if c == "INR":
        return total * 100
    raise ValueError("unsupported_checkout_currency")


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
    ) -> tuple[Booking, Payment, str]:
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

        checkout_currency = _normalize_currency(body.currency)

        if _needs_razorpay_order(total, body.payment_method):
            if not razorpay_credentials_configured():
                await db.rollback()
                raise ValueError("razorpay_not_configured")
            try:
                amount_minor = _amount_minor_units_for_razorpay(total, checkout_currency)
            except ValueError:
                await db.rollback()
                raise
            try:
                order = await create_order(
                    amount_paise=amount_minor,
                    currency=checkout_currency,
                    receipt=payment.id[:40],
                    notes={"booking_id": booking.id},
                )
            except Exception as exc:
                await db.rollback()
                raise ValueError("razorpay_order_failed") from exc
            payment.razorpay_order_id = order["id"]

        await db.commit()
        await db.refresh(booking)
        await db.refresh(payment)
        return booking, payment, checkout_currency

    @staticmethod
    async def verify_razorpay_payment(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        body: VerifyRazorpayPaymentBody,
    ) -> None:
        raw_bid = body.booking_id.strip()
        stmt = (
            select(Booking)
            .where(Booking.id == raw_bid)
            .options(joinedload(Booking.payments))
        )
        result = await db.execute(stmt)
        booking = result.unique().scalar_one_or_none()
        if booking is None:
            raise ValueError("booking_not_found")
        if booking.user_id != user_id:
            raise ValueError("verify_forbidden")

        if not booking.payments:
            raise ValueError("payment_not_found")

        payment = booking.payments[0]

        if payment.razorpay_order_id is None:
            raise ValueError("razorpay_order_not_expected")

        if payment.razorpay_order_id != body.razorpay_order_id.strip():
            raise ValueError("razorpay_order_mismatch")

        if payment.status == PaymentStatus.COMPLETED:
            if payment.razorpay_payment_id == body.razorpay_payment_id.strip():
                logger.info(
                    "Razorpay verify: idempotent OK (already COMPLETED; webhook often arrives first) "
                    "booking_id=%s db_payment_id=%s",
                    booking.id,
                    payment.id,
                )
                return
            raise ValueError("payment_already_completed")

        if payment.status != PaymentStatus.PENDING_PAYMENT:
            raise ValueError("payment_not_pending")

        try:
            await verify_payment_signature(
                razorpay_order_id=body.razorpay_order_id.strip(),
                razorpay_payment_id=body.razorpay_payment_id.strip(),
                razorpay_signature=body.razorpay_signature.strip(),
            )
        except SignatureVerificationError as exc:
            raise ValueError("razorpay_signature_invalid") from exc

        payment.status = PaymentStatus.COMPLETED
        payment.razorpay_payment_id = body.razorpay_payment_id.strip()
        await db.commit()

    @staticmethod
    async def complete_payment_by_order_id(
        db: AsyncSession,
        *,
        razorpay_order_id: str,
        razorpay_payment_id: str,
    ) -> None:
        """Mark a payment as completed using the Razorpay order_id from a webhook payload.

        Idempotent: silently returns if already COMPLETED with the same payment_id.
        Raises ValueError if no matching payment is found or the state is unexpected.
        """
        stmt = select(Payment).where(Payment.razorpay_order_id == razorpay_order_id.strip())
        result = await db.execute(stmt)
        payment = result.scalar_one_or_none()

        if payment is None:
            raise ValueError("webhook_payment_not_found")

        if payment.status == PaymentStatus.COMPLETED:
            if payment.razorpay_payment_id == razorpay_payment_id.strip():
                logger.info(
                    "Razorpay webhook: idempotent skip (already COMPLETED) "
                    "booking_id=%s db_payment_id=%s razorpay_order_id=%s razorpay_payment_id=%s",
                    payment.booking_id,
                    payment.id,
                    razorpay_order_id.strip(),
                    razorpay_payment_id.strip(),
                )
                return
            raise ValueError("webhook_payment_already_completed_different_id")

        payment.status = PaymentStatus.COMPLETED
        payment.razorpay_payment_id = razorpay_payment_id.strip()
        await db.commit()
       

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
