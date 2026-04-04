from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from google.api_core import exceptions as google_api_exceptions
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import get_current_user
from core.database import get_db
from core.storage.gcs_profile_avatar import upload_profile_avatar_image
from profile.schemas.detail import (
    ProfileAvatarUploadResponse,
    ProfileMeResponse,
    ProfilePatchBody,
)
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


@profile_router.post("/profile/avatar", response_model=ProfileAvatarUploadResponse)
async def upload_profile_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    content_type = (file.content_type or "").strip()
    if not content_type:
        raise HTTPException(
            status_code=400,
            detail="Missing Content-Type on the file part; send an image type (e.g. image/jpeg).",
        )
    data = await file.read()
    try:
        public_url = await asyncio.to_thread(
            upload_profile_avatar_image,
            user_id=user.id,
            content_type=content_type,
            data=data,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except google_api_exceptions.GoogleAPIError as e:
        raise HTTPException(
            status_code=503,
            detail="Could not store image. Try again later.",
        ) from e
    return ProfileAvatarUploadResponse(public_url=public_url)


@profile_router.get("/profile/stats", response_model=ProfileStatsResponse)
async def profile_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return await ProfileStatsService.get_profile_stats(db, user_id=user.id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
