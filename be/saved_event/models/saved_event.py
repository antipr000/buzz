from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.database import TimestampedModel


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
