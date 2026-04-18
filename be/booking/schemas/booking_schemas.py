from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from address.schemas.validators import AddressTypeInput
from core.schemas.schema_model import SchemaModel
from payment.models.payment import PaymentMethod
from ticket.models.ticket import TicketTier


class AddressIn(SchemaModel):
    first_name: str
    last_name: str
    mobile_number: str
    email_id: str
    pin_code: int
    address_line1: str
    address_line2: str | None = None
    landmark: str | None = None
    city: str
    state: str
    country: str
    address_type: AddressTypeInput


class TicketLineIn(SchemaModel):
    ticket_tier: TicketTier
    price: int = Field(ge=0)
    quantity: int = Field(ge=1)


class PurchaseBody(SchemaModel):
    event_id: str
    tickets: list[TicketLineIn] = Field(min_length=1)
    address_id: str | None = None
    address: AddressIn | None = None
    payment_method: PaymentMethod
    currency: str = Field(
        default="INR",
        min_length=3,
        max_length=3,
        description=(
            "ISO 4217 code; must match Razorpay order and checkout. "
            "Only INR minor-unit rules are implemented server-side."
        ),
    )


class PurchaseResponse(SchemaModel):
    booking_id: str
    payment_id: str
    amount: int
    payment_status: str
    razorpay_order_id: str | None = None
    razorpay_key_id: str | None = None
    currency: str = "INR"


class VerifyRazorpayPaymentBody(SchemaModel):
    """POST /events/verify-razorpay-payment — client sends Checkout success payload."""

    booking_id: str = Field(min_length=1, max_length=255)
    razorpay_payment_id: str = Field(min_length=1, max_length=255)
    razorpay_order_id: str = Field(min_length=1, max_length=255)
    razorpay_signature: str = Field(min_length=1, max_length=2048)


class VerifyRazorpayPaymentResponse(SchemaModel):
    verified: bool = True


class TicketLineOut(SchemaModel):
    ticket_tier: str
    price: int
    quantity: int
    seats: list[str]


class BookingListItem(SchemaModel):
    id: str
    event_id: str
    booking_date: datetime
    title: str
    language: str | None
    date: datetime
    location: str
    tickets: list[TicketLineOut]
    event_image: str | None
    status: str


class BookingListResponse(SchemaModel):
    data: list[BookingListItem]


class BookingsListBody(SchemaModel):
    """Optional filters for POST /events/bookings."""

    status: str | None = None


class OrganizerVerifyBookingBody(SchemaModel):
    """POST /events/{event_id}/verify-booking — organizer check-in."""

    booking_id: str = Field(min_length=1, max_length=255)


class OrganizerVerifyBookingResponse(SchemaModel):
    outcome: Literal[
        "checked_in",
        "already_attended",
        "pending_payment",
        "payment_failed",
    ]
    booking: BookingListItem
