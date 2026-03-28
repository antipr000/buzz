from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from booking.models.booking import Booking
from core.auth import get_current_user
from core.database import get_db
from payment.models.payment import Payment
from payment.schemas.confirm import PaymentConfirmBody, WebhookBody
from payment.services.payment_service import PaymentService
from user.models.user import User

payment_router = APIRouter(tags=["Payments"])


@payment_router.post("/payments/{payment_id}/confirm")
async def confirm_payment(
    payment_id: str,
    body: PaymentConfirmBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    pay = await db.get(Payment, payment_id)
    if pay is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    booking = await db.get(Booking, pay.booking_id)
    if booking is None or booking.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not allowed to confirm this payment")
    try:
        updated = await PaymentService.confirm(
            db, payment_id=payment_id, success=body.success
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return {
        "paymentId": updated.id,
        "status": updated.status.value,
    }


@payment_router.post("/payments/webhook")
async def payment_webhook(
    body: WebhookBody,
    db: AsyncSession = Depends(get_db),
):
    """Stub webhook — verify PSP signature in production."""
    if not body.payment_id:
        raise HTTPException(status_code=400, detail="paymentId required")
    try:
        updated = await PaymentService.process_webhook_stub(
            db, payment_id=body.payment_id, success=body.success
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    if updated is None:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"paymentId": updated.id, "status": updated.status.value}
