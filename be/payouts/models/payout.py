from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, Index, String, Uuid, false, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import BaseEntity

if TYPE_CHECKING:
    from user.models.user import User


class PayoutAccountType(str, enum.Enum):
    SAVINGS = "SAVINGS"
    CURRENT = "CURRENT"


class Payout(BaseEntity):
    """Saved bank account for organizer payouts."""

    __tablename__ = "payouts"
    __table_args__ = (
        Index(
            "uq_payouts_user_one_primary",
            "user_id",
            unique=True,
            postgresql_where=text("is_primary IS TRUE"),
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    account_holder_name: Mapped[str] = mapped_column(String(255), nullable=False)
    bank_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    account_number: Mapped[str] = mapped_column(String(64), nullable=False)
    ifsc_code: Mapped[str] = mapped_column(String(11), nullable=False)
    account_type: Mapped[PayoutAccountType] = mapped_column(
        Enum(PayoutAccountType, native_enum=False, length=16),
        nullable=False,
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )

    user: Mapped[User] = relationship(back_populates="payouts", lazy="raise")

    def get_key(self) -> str:
        return "pay"
