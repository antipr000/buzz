from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import TimestampedModel

if TYPE_CHECKING:
    from event.models.event import Event
    from user.models.user import User


class SavedEvent(TimestampedModel):
    __tablename__ = "saved_events"

    user_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    event_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("events.id", ondelete="CASCADE"),
        primary_key=True,
    )

    user: Mapped[User] = relationship(back_populates="saved_events", lazy="raise")
    event: Mapped[Event] = relationship(back_populates="saved_events", lazy="raise")
