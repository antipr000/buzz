from __future__ import annotations

from fastapi import APIRouter, Body, Depends, HTTPException, Query, Response, status
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
from event.schemas.event_schemas import (
    CreateEventBody,
    CreateEventResponse,
    DiscoverResponse,
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
    radius: int = Query(30, ge=1, le=500, description="Search radius in km"),
    category: str | None = Query(None, description="Category filter or All"),
    cursor: str | None = Query(None, description="Pagination cursor"),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    cards, next_cursor, has_more, user_location = await EventService.discover(
        db,
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
