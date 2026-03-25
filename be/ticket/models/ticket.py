from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import BaseEntity

if TYPE_CHECKING:
    from booking.models.booking import Booking


class TicketTier(str, enum.Enum):
    STANDARD = "Standard"
    PREMIUM = "Premium"
    VIP = "VIP"


class Ticket(BaseEntity):
    __tablename__ = "tickets"

    booking_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    ticket_tier: Mapped[TicketTier] = mapped_column(
        Enum(TicketTier, native_enum=False, length=32),
        nullable=False,
    )
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    seat: Mapped[str | None] = mapped_column(String(64), nullable=True)

    booking: Mapped[Booking] = relationship(back_populates="tickets", lazy="raise")

    def get_key(self) -> str:
        return "tkt"
