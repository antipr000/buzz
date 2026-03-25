from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from user.models.user import User
from user.schemas.user import UserCreate

async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    """Creates a new user in the database."""
    new_user = User(
        email=user_in.email,
        password=user_in.password,
        full_name=user_in.full_name,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Fetches a single user by their ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Fetches a single user by their email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def list_users(db: AsyncSession) -> List[User]:
    """Returns a list of all users in the database."""
    result = await db.execute(select(User))
    return result.scalars().all()

async def delete_user(db: AsyncSession, user: User) -> None:
    """Deletes a user from the database."""
    await db.delete(user)
    await db.commit()
