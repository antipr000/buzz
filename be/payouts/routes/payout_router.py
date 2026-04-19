from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.auth import get_current_user
from core.database import get_db
from payouts.schemas.payout_schemas import (
    PayoutCreateBody,
    PayoutListResponse,
    PayoutOut,
    PayoutPatchBody,
)
from payouts.services.payout_service import PayoutService
from user.models.user import User

payout_router = APIRouter(prefix="/user", tags=["Payouts"])


@payout_router.get("/payouts", response_model=PayoutListResponse)
async def list_payouts(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await PayoutService.list_for_user(db, user_id=user.id)
    return PayoutListResponse(data=data)


@payout_router.get("/payouts/{payout_id}", response_model=PayoutOut)
async def get_payout(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    payout_id: str = Path(..., min_length=1),
):
    try:
        return await PayoutService.get_for_user(db, user_id=user.id, payout_id=payout_id)
    except ValueError as e:
        if str(e) == "Payout not found":
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise


@payout_router.post(
    "/payouts",
    response_model=PayoutOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_payout(
    body: PayoutCreateBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await PayoutService.create(db, user_id=user.id, body=body)


@payout_router.patch("/payouts/{payout_id}", response_model=PayoutOut)
async def patch_payout(
    body: PayoutPatchBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    payout_id: str = Path(..., min_length=1),
):
    try:
        return await PayoutService.patch(db, user_id=user.id, payout_id=payout_id, body=body)
    except ValueError as e:
        if str(e) == "Payout not found":
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise


@payout_router.delete(
    "/payouts/{payout_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_payout(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    payout_id: str = Path(..., min_length=1),
):
    try:
        await PayoutService.delete_for_user(db, user_id=user.id, payout_id=payout_id)
    except ValueError as e:
        if str(e) == "Payout not found":
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise
