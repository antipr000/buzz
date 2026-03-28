from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import get_current_user
from core.database import get_db
from profile.schemas.stats import ProfileStatsResponse
from profile.services.profile_stats_service import ProfileStatsService
from user.models.user import User

profile_router = APIRouter(prefix="/user", tags=["Profile"])


@profile_router.get(
    "/profile/stats",
    response_model=ProfileStatsResponse,
    response_model_by_alias=True,
)
async def profile_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return await ProfileStatsService.get_profile_stats(db, user_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
