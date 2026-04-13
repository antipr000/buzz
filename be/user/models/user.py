from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, String, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base, TimestampMixin

if TYPE_CHECKING:
    from address.models.address import Address
    from booking.models.booking import Booking
    from device.models.device import Device
    from profile.models.profile import Profile
    from saved_event.models.saved_event import SavedEvent


class AccountStatus(str, enum.Enum):
    active = "active"
    deleted = "deleted"
    blocked = "blocked"


class User(Base, TimestampMixin):
    """App user row; `id` matches Supabase `auth.users.id` (JWT `sub`)."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, native_enum=False, length=32),
        nullable=False,
        server_default=text("'active'"),
    )

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
