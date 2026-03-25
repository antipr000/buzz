from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import BaseEntity

if TYPE_CHECKING:
    from address.models.address import Address
    from booking.models.booking import Booking
    from device.models.device import Device
    from profile.models.profile import Profile
    from saved_event.models.saved_event import SavedEvent


class User(BaseEntity):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)

    profile: Mapped[Profile | None] = relationship(
        back_populates="user",
        uselist=False,
        lazy="raise",
    )
    addresses: Mapped[list[Address]] = relationship(
        back_populates="user",
        lazy="raise",
    )
    bookings: Mapped[list[Booking]] = relationship(
        back_populates="user",
        lazy="raise",
    )
    devices: Mapped[list[Device]] = relationship(
        back_populates="user",
        lazy="raise",
    )
    saved_events: Mapped[list[SavedEvent]] = relationship(
        back_populates="user",
        lazy="raise",
    )

    def get_key(self) -> str:
        return "usr"
