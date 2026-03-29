from __future__ import annotations

from datetime import datetime
from typing import Annotated

from pydantic import BeforeValidator, Field

from address.models.address import AddressType
from core.schemas.schema_model import SchemaModel
from payment.models.payment import PaymentMethod
from ticket.models.ticket import TicketTier


def _parse_address_type(v: object) -> AddressType:
    if isinstance(v, AddressType):
        return v
    if isinstance(v, str):
        m = {"home": AddressType.HOME, "work": AddressType.WORK, "other": AddressType.OTHER}
        return m.get(v.strip().lower(), AddressType.OTHER)
    raise ValueError("Invalid address type")


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
    address_type: Annotated[AddressType, BeforeValidator(_parse_address_type)]


class TicketLineIn(SchemaModel):
    ticket_tier: TicketTier
    price: int
    quantity: int = Field(ge=1)


class PurchaseBody(SchemaModel):
    event_id: str
    tickets: list[TicketLineIn]
    address: AddressIn
    payment_method: PaymentMethod


class PurchaseResponse(SchemaModel):
    booking_id: str
    payment_id: str
    amount: int
    payment_status: str


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
