from datetime import datetime, timezone
from cuid2 import Cuid
from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from core.config import config

# Helper to generate a prefixed CUID2
def generate_model_id(prefix: str) -> str:
    """Generates a prefixed CUID2 ID (length 16 per user requirement)."""
    return f"{prefix}_{Cuid(length=16).generate()}"

# Create the async engine
# Note: Requires 'asyncpg' driver
engine = create_async_engine(
    url=config.async_db_url,
    echo=config.debug,
)

# Create an async session factory
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


# Backwards-compatible alias for code that imports ``Base`` as the id-bearing model base.
BaseModel = BaseEntity

# Dependency to get an async database session for each request
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Helper to initialize the database (useful for scripts or startup)
# async def init_db():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#         print("Database initialized and tables created if they did not exist.")