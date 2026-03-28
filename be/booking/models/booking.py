from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import BaseEntity

if TYPE_CHECKING:
    from address.models.address import Address
    from event.models.event import Event
    from payment.models.payment import Payment
    from ticket.models.ticket import Ticket
    from user.models.user import User


class BookingStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ATTENDED = "ATTENDED"
    CANCELLED = "CANCELLED"


class Booking(BaseEntity):
    __tablename__ = "bookings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("events.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, native_enum=False, length=32),
        nullable=False,
    )
    address_id: Mapped[str | None] = mapped_column(
        String(255),
        ForeignKey("addresses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    user: Mapped[User] = relationship(back_populates="bookings", lazy="raise")
    address: Mapped[Address | None] = relationship(
        back_populates="bookings",
        lazy="raise",
    )
    event: Mapped[Event] = relationship(back_populates="bookings", lazy="raise")
    tickets: Mapped[list[Ticket]] = relationship(
        back_populates="booking",
        lazy="raise",
    )
    payments: Mapped[list[Payment]] = relationship(
        back_populates="booking",
        lazy="raise",
    )

    def get_key(self) -> str:
        return "bkg"
