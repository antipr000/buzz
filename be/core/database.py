from datetime import datetime, timezone

from cuid2 import Cuid
from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from core.config import config


def generate_model_id(prefix: str) -> str:
    """Generates a prefixed CUID2 ID (length 16 per user requirement)."""
    return f"{prefix}_{Cuid(length=16).generate()}"


engine = create_async_engine(
    url=config.async_db_url,
    connect_args=config.asyncpg_connect_args,
    echo=config.debug,
    pool_pre_ping=True,
    pool_size=config.db_pool_size,
    max_overflow=config.db_max_overflow,
    pool_recycle=config.db_pool_recycle,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Root declarative base (shared metadata)."""


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class TimestampedModel(Base, TimestampMixin):
    """Tables with created_at / updated_at but no default id (e.g. composite PK)."""

    __abstract__ = True


class BaseEntity(Base, TimestampMixin):
    """Default entity: prefixed id + timestamps."""

    __abstract__ = True

    def get_key(self) -> str:
        """Override in concrete models (e.g. return 'usr')."""
        return "base"

    id: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
        index=True,
        default=lambda: generate_model_id("base"),
    )

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

        if not self.id:
            self.id = generate_model_id(self.get_key())


BaseModel = BaseEntity


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
