from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.database import BaseEntity


class Device(BaseEntity):
    __tablename__ = "devices"

    user_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    device_name: Mapped[str] = mapped_column(String(255), nullable=False)
    device_os: Mapped[str | None] = mapped_column(
        "os",
        String(128),
        nullable=True,
    )
    is_current_device: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    app_version: Mapped[str] = mapped_column(String(64), nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    last_used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    def get_key(self) -> str:
        return "dev"
