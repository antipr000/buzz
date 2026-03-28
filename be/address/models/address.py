from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import BaseEntity

if TYPE_CHECKING:
    from booking.models.booking import Booking
    from user.models.user import User



class AddressType(str, enum.Enum):
    HOME = "Home"
    WORK = "Work"
    OTHER = "Other"

# See if longitude and latitude are needed

class Address(BaseEntity):
    __tablename__ = "addresses"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    address_type: Mapped[AddressType] = mapped_column(
        "type",
        Enum(AddressType, native_enum=False, length=32),
        nullable=False,
    )
    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_name: Mapped[str] = mapped_column(String(128), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(64), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line1: Mapped[str] = mapped_column(String(255), nullable=False)
    address_line2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    landmark: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(128), nullable=False)
    state: Mapped[str] = mapped_column(String(128), nullable=False)
    country: Mapped[str] = mapped_column(String(128), nullable=False)
    pin_code: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped[User] = relationship(back_populates="addresses", lazy="raise")
    bookings: Mapped[list[Booking]] = relationship(
        back_populates="address",
        lazy="raise",
    )

    def get_key(self) -> str:
        return "adr"
