import enum
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from core.database import TimestampedModel


class ProfileIdentify(str, enum.Enum):
    MAN = "Man"
    WOMAN = "Woman"
    OTHER = "Other"


class MaritalStatus(str, enum.Enum):
    SINGLE = "Single"
    MARRIED = "Married"


class Profile(TimestampedModel):
    __tablename__ = "profiles"

    user_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    birthday: Mapped[date | None] = mapped_column(Date, nullable=True)
    identify: Mapped[ProfileIdentify | None] = mapped_column(
        Enum(ProfileIdentify, native_enum=False, length=32),
        nullable=True,
    )
    marital_status: Mapped[MaritalStatus | None] = mapped_column(
        Enum(MaritalStatus, native_enum=False, length=32),
        nullable=True,
    )
    mobile_number: Mapped[str | None] = mapped_column(String(64), nullable=True)
    profile_image: Mapped[str | None] = mapped_column(String(512), nullable=True)
