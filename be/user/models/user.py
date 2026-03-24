from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean
from core.database import Base

class User(Base):
    __tablename__ = "users"
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    def get_key(self) -> str:
        return "usr"
