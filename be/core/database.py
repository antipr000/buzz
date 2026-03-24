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
    # Base configuration for prefixed IDs
    def get_key(self) -> str:
        """Override this in your models (e.g., return 'user')"""
        return "base"

    id: Mapped[str] = mapped_column(
        String(255),
        primary_key=True,
        index=True,
        # Default for when ID is not provided in __init__ (manual inserts)
        default=lambda: generate_model_id("base")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
            
        if not self.id:
            self.id = generate_model_id(self.get_key())

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