from __future__ import annotations

import asyncio
from typing import Annotated

from fastapi import APIRouter, Body, Depends, File, HTTPException, Path, Query, Response, UploadFile, status
from google.api_core import exceptions as google_api_exceptions
from sqlalchemy.ext.asyncio import AsyncSession

from booking.schemas.booking_schemas import (
    BookingListResponse,
    BookingsListBody,
    PurchaseBody,
    PurchaseResponse,
)
from booking.services.booking_service import BookingService
from core.auth import get_current_user
from core.database import get_db
from core.storage.gcs_event_cover import upload_event_cover_image
from event.schemas.event_schemas import (
    CreateEventBody,
    CreateEventResponse,
    DiscoverResponse,
    EventCoverUploadResponse,
    PaginationOut,
    SaveEventBody,
    SavedListResponse,
)
from event.services.event_service import EventService
from saved_event.services.saved_event_service import SavedEventService
from user.models.user import User

event_router = APIRouter(prefix="/events", tags=["Events"])


@event_router.get("/discover", response_model=DiscoverResponse)
async def discover_events(
    lat: float = Query(..., description="User latitude"),
    lng: float = Query(..., description="User longitude"),
    radius: int = Query(30, ge=1, le=2000, description="Search radius in km"),
    category: str | None = Query(None, description="Category filter or All"),
    cursor: str | None = Query(None, description="Pagination cursor"),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cards, next_cursor, has_more, user_location = await EventService.discover(
        db,
        user_id=user.id,
        lat=lat,
        lng=lng,
        radius_km=radius,
        category=category,
        cursor_token=cursor,
        limit=limit,
    )

    return DiscoverResponse(
        user_location=user_location,
        trending_events=cards,
        pagination=PaginationOut(next_cursor=next_cursor, has_more=has_more),
    )


@event_router.post("/create", response_model=CreateEventResponse)
async def create_event(
    body: CreateEventBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        ev = await EventService.create(db, user_id=user.id, body=body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return CreateEventResponse(id=ev.id)


@event_router.post("/cover", response_model=EventCoverUploadResponse)
async def upload_event_cover(
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
            upload_event_cover_image,
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
    return EventCoverUploadResponse(public_url=public_url)


@event_router.post("/purchase", response_model=PurchaseResponse)
async def purchase_tickets(
    body: PurchaseBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        booking, payment = await BookingService.purchase(db, user_id=user.id, body=body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return PurchaseResponse(
        booking_id=booking.id,
        payment_id=payment.id,
        amount=payment.amount,
        payment_status=payment.status.value,
    )


@event_router.get("/saved", response_model=SavedListResponse)
async def list_saved_events(
    cursor: str | None = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cards, next_cursor, has_more = await SavedEventService.list_saved(
        db, user_id=user.id, cursor_token=cursor, limit=limit
    )
    return SavedListResponse(
        saved_events=cards,
        pagination=PaginationOut(next_cursor=next_cursor, has_more=has_more),
    )


@event_router.post("/save", status_code=status.HTTP_204_NO_CONTENT)
async def save_event(
    body: SaveEventBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        await SavedEventService.save(db, user_id=user.id, event_id=body.event_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@event_router.delete(
    "/saved/{event_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def unsave_event(
    event_id: Annotated[str, Path(min_length=1, max_length=255)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    await SavedEventService.unsave(db, user_id=user.id, event_id=event_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@event_router.post("/bookings", response_model=BookingListResponse)
async def list_my_bookings(
    body: BookingsListBody | None = Body(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = await BookingService.list_bookings_for_user(
        db, user_id=user.id, body=body
    )
    return BookingListResponse(data=data)
