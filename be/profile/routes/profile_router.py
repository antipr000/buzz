from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import get_current_user
from core.database import get_db
from profile.schemas.detail import ProfileMeResponse, ProfilePatchBody
from profile.schemas.stats import ProfileStatsResponse
from profile.services.profile_me_service import ProfileMeService
from profile.services.profile_stats_service import ProfileStatsService
from user.models.user import User

profile_router = APIRouter(prefix="/user", tags=["Profile"])


@profile_router.get("/profile", response_model=ProfileMeResponse)
async def get_profile_me(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return await ProfileMeService.get_me(db, user_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e


@profile_router.patch("/profile", response_model=ProfileMeResponse)
async def patch_profile_me(
    body: ProfilePatchBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return await ProfileMeService.patch_me(db, user_id=user.id, body=body)
    except ValueError as e:
        msg = str(e)
        if msg in ("User not found", "Profile not found"):
            raise HTTPException(status_code=404, detail=msg) from e
        raise HTTPException(status_code=422, detail=msg) from e


@profile_router.get("/profile/stats", response_model=ProfileStatsResponse)
async def profile_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return await ProfileStatsService.get_profile_stats(db, user_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
