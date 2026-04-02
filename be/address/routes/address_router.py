from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.ext.asyncio import AsyncSession

from address.schemas.address_schemas import (
    AddressCreateBody,
    AddressListResponse,
    AddressOut,
    AddressPatchBody,
)
from address.services.address_service import AddressService
from core.auth import get_current_user
from core.database import get_db
from user.models.user import User

address_router = APIRouter(prefix="/user", tags=["Addresses"])


@address_router.get("/addresses", response_model=AddressListResponse)
async def list_addresses(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await AddressService.list_for_user(db, user_id=user.id)
    return AddressListResponse(data=data)


@address_router.get("/addresses/{address_id}", response_model=AddressOut)
async def get_address(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    address_id: str = Path(..., min_length=1),
):
    try:
        return await AddressService.get_for_user(db, user_id=user.id, address_id=address_id)
    except ValueError as e:
        if str(e) == "Address not found":
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise


@address_router.post("/addresses", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
async def create_address(
    body: AddressCreateBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return await AddressService.create(db, user_id=user.id, body=body)


@address_router.patch(
    "/addresses/{address_id}",
    response_model=AddressOut,
)
async def patch_address(
    body: AddressPatchBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    address_id: str = Path(..., min_length=1),
):
    try:
        return await AddressService.patch(db, user_id=user.id, address_id=address_id, body=body)
    except ValueError as e:
        if str(e) == "Address not found":
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise
