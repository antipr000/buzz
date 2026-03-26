import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import get_current_user, get_current_user_id
from core.database import get_db
from user.models.user import User
from user.schemas.user import UserResponse
import user.services.user_service as user_service

user_router = APIRouter(prefix="/users", tags=["Users"])


@user_router.get("/me", response_model=UserResponse)
async def read_me(current: User = Depends(get_current_user)):
    """Current user from JWT `sub`; `public.users` is created by the Supabase `auth.users` trigger."""
    return current


@user_router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _viewer: uuid.UUID = Depends(get_current_user_id),
):
    """Fetch a user by id (requires authentication)."""
    # TODO: See if we need to add authorization logic to check if the user is the same as the current user
    user = await user_service.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@user_router.delete("/{user_id}")
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_id: uuid.UUID = Depends(get_current_user_id),
):
    if user_id != current_id:
        raise HTTPException(status_code=403, detail="Can only delete your own account")
    user = await user_service.get_user_by_id(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await user_service.delete_user(db, user=user)
    return {"message": "User deleted successfully"}
