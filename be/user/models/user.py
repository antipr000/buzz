from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

from core.database import BaseEntity


class User(BaseEntity):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)

    def get_key(self) -> str:
        return "usr"
