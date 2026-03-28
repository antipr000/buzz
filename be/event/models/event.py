from __future__ import annotations

import enum
import uuid
from datetime import date, time
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, Enum, Float, ForeignKey, Index, Integer, String, Time, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import BaseEntity

if TYPE_CHECKING:
    from booking.models.booking import Booking
    from profile.models.profile import Profile
    from saved_event.models.saved_event import SavedEvent

class EventCategory(str, enum.Enum):
    MUSIC = "Music"
    NIGHTLIFE = "Nightlife"
    TECH = "Tech"
    STARTUP = "Startup"
    GAMING = "Gaming"
    FOOD = "Food"
    SOCIAL = "Social"
    WELLNESS = "Wellness"
    FITNESS = "Fitness"
    FAMILY = "Family"
    KIDS = "Kids"
    ART = "Art"
    CULTURE = "Culture"


class Event(BaseEntity):
    __tablename__ = "events"
    __table_args__ = (Index("ix_events_date_id", "date", "id"),)

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[EventCategory] = mapped_column(
        Enum(EventCategory, native_enum=False, length=32),
        nullable=False,
    )
    event_date: Mapped[date] = mapped_column("date", Date, nullable=False)
    event_time: Mapped[time] = mapped_column("time", Time, nullable=False)
    location: Mapped[str] = mapped_column(String(512), nullable=False)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    event_cover: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    organizer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("profiles.user_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    language: Mapped[str | None] = mapped_column(String(64), nullable=True)

    organizer: Mapped[Profile] = relationship(
        back_populates="organized_events",
        lazy="raise",
    )
    bookings: Mapped[list[Booking]] = relationship(
        back_populates="event",
        lazy="raise",
    )
    saved_events: Mapped[list[SavedEvent]] = relationship(
        back_populates="event",
        lazy="raise",
    )

    def get_key(self) -> str:
        return "evt"
