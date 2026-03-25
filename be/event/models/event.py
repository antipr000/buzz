import enum
from datetime import date, time

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column

from core.database import BaseEntity

# See if longitude and latitude are needed
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


# See if longitude and latitude are needed


class Event(BaseEntity):
    __tablename__ = "events"

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
    organizer_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("profiles.user_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    def get_key(self) -> str:
        return "evt"
