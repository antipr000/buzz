from __future__ import annotations

import asyncio
from typing import Annotated

from fastapi import APIRouter, Body, Depends, File, HTTPException, Path, Query, Response, UploadFile, status
from google.api_core import exceptions as google_api_exceptions
from sqlalchemy.ext.asyncio import AsyncSession

from booking.schemas.booking_schemas import (
    BookingListResponse,
    BookingsListBody,
    OrganizerVerifyBookingBody,
    OrganizerVerifyBookingResponse,
    PurchaseBody,
    PurchaseResponse,
    VerifyRazorpayPaymentBody,
    VerifyRazorpayPaymentResponse,
)
from booking.services.booking_service import BookingService
from core.auth import get_current_user
from core.config import config
from core.database import get_db
from core.storage.gcs_event_cover import upload_event_cover_image
from event.schemas.event_schemas import (
    CreateEventBody,
    CreateEventResponse,
    CreatedListResponse,
    DiscoverResponse,
    EventCoverUploadResponse,
    EventDetailOut,
    PaginationOut,
    PatchEventBody,
    SaveEventBody,
    SavedListResponse,
)
from event.services.event_service import EventPatchForbidden, EventService
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
    q: str | None = Query(
        None,
        max_length=120,
        description="Optional text search (title, description, location)",
    ),
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
        q=q,
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
        msg = str(e)
        if msg == "event_date_past":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event date must be today or later.",
            ) from e
        if msg == "price_must_match_standard_tier":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="When tier_details is set, price must equal the Standard tier price.",
            ) from e
        if msg == "amenities_with_tier_details":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Do not send top-level amenities when tier_details is set; use per-tier amenities.",
            ) from e
        if msg == "single_price_amenities_required":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Single-price events require at least one non-empty amenity.",
            ) from e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        ) from e
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
        booking, payment, checkout_currency = await BookingService.purchase(
            db, user_id=user.id, body=body
        )
    except ValueError as e:
        msg = str(e)
        if msg == "purchase_tier_not_available":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This event only offers Standard tickets.",
            ) from e
        if msg == "purchase_price_mismatch":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ticket price does not match this event's tier prices.",
            ) from e
        if msg == "paid_checkout_cannot_use_free_payment_method":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment method 'free' is only for zero-total bookings.",
            ) from e
        if msg == "razorpay_not_configured":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Online payments are not configured. Try again later.",
            ) from e
        if msg == "razorpay_order_failed":
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Could not start payment with Razorpay. Try again.",
            ) from e
        if msg == "unsupported_checkout_currency":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This currency is not supported for online checkout yet. Use INR or contact support.",
            ) from e
        raise HTTPException(status_code=400, detail=msg) from e
    key = config.razorpay_key_id.strip() or None
    return PurchaseResponse(
        booking_id=booking.id,
        payment_id=payment.id,
        amount=payment.amount,
        payment_status=payment.status.value,
        razorpay_order_id=payment.razorpay_order_id,
        razorpay_key_id=key if payment.razorpay_order_id else None,
        currency=checkout_currency,
    )


@event_router.post(
    "/verify-razorpay-payment",
    response_model=VerifyRazorpayPaymentResponse,
)
async def verify_razorpay_payment(
    body: VerifyRazorpayPaymentBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        await BookingService.verify_razorpay_payment(
            db, user_id=user.id, body=body
        )
    except ValueError as e:
        msg = str(e)
        if msg == "booking_not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found.",
            ) from e
        if msg == "verify_forbidden":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to verify this booking.",
            ) from e
        if msg in ("payment_not_found", "razorpay_order_not_expected"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment state for verification.",
            ) from e
        if msg == "razorpay_order_mismatch":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Order id does not match this booking.",
            ) from e
        if msg == "payment_already_completed":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Payment already recorded with different details.",
            ) from e
        if msg == "payment_not_pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment is not pending verification.",
            ) from e
        if msg == "razorpay_signature_invalid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment signature verification failed.",
            ) from e
        raise HTTPException(status_code=400, detail=msg) from e
    return VerifyRazorpayPaymentResponse()


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


@event_router.get("/created", response_model=CreatedListResponse)
async def list_created_events(
    cursor: str | None = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cards, next_cursor, has_more = await EventService.list_created_by_organizer(
        db, user_id=user.id, cursor_token=cursor, limit=limit
    )
    return CreatedListResponse(
        created_events=cards,
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


@event_router.post(
    "/{event_id}/verify-booking",
    response_model=OrganizerVerifyBookingResponse,
)
async def verify_booking_for_event(
    event_id: Annotated[str, Path(min_length=1, max_length=255)],
    body: OrganizerVerifyBookingBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return await BookingService.verify_booking_for_organizer(
            db,
            organizer_user_id=user.id,
            event_id=event_id,
            booking_id=body.booking_id,
        )
    except ValueError as e:
        msg = str(e)
        if msg == "event_not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found",
            ) from e
        if msg == "not_event_organizer":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not the organizer for this event",
            ) from e
        if msg == "booking_not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found",
            ) from e
        if msg == "booking_wrong_event":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This ticket is for a different event",
            ) from e
        if msg == "booking_cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This booking was cancelled",
            ) from e
        if msg == "booking_invalid_state":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This booking has no payment on file",
            ) from e
        if msg == "payment_not_completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payment is not completed for this booking",
            ) from e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
        ) from e


@event_router.patch("/{event_id}", response_model=EventDetailOut)
async def patch_event(
    event_id: Annotated[str, Path(min_length=1, max_length=255)],
    body: PatchEventBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        out = await EventService.patch_owned(
            db, user_id=user.id, event_id=event_id, body=body
        )
    except EventPatchForbidden:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to edit this event",
        ) from None
    except ValueError as e:
        msg = str(e)
        if msg == "no_fields":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provide at least one of: title, description, event_cover",
            ) from e
        if msg in ("title_empty", "description_empty"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title and description cannot be empty",
            ) from e
        if msg == "event_cover_invalid":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="event_cover must be a non-empty URL, or omit the field",
            ) from e
        if msg == "event_not_editable_past":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update an event on or after its scheduled date",
            ) from e
        raise
    if out is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    return out


@event_router.get("/{event_id}", response_model=EventDetailOut)
async def get_event(
    event_id: Annotated[str, Path(min_length=1, max_length=255)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    card = await EventService.get_by_id(db, user_id=user.id, event_id=event_id)
    if card is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return card
