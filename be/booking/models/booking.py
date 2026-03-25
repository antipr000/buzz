import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.database import BaseEntity


class BookingStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ATTENDED = "ATTENDED"
    CANCELLED = "CANCELLED"


class Booking(BaseEntity):
    __tablename__ = "bookings"

    user_id: Mapped[str] = mapped_column(
        String(255),
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

    def get_key(self) -> str:
        return "bkg"
