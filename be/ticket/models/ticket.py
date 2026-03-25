import enum

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from core.database import BaseEntity


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

    def get_key(self) -> str:
        return "tkt"
