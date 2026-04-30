from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from razorpay.errors import SignatureVerificationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from booking.models.booking import Booking
from booking.services.booking_service import BookingService
from core.auth import get_current_user
from core.config import config
from core.database import get_db
from payment.models.payment import Payment
from payment.razorpay_client import verify_webhook_signature
from payment.schemas.confirm import (
    PaymentConfirmBody,
    PaymentOutcomeResponse,
)
from payment.services.payment_email_service import PaymentEmailService
from payment.services.payment_service import PaymentService
from user.models.user import User

logger = logging.getLogger(__name__)

payment_router = APIRouter(tags=["Payments"])

# Only order.paid — same capture moment as payment.captured; one event avoids double handling.
_HANDLED_EVENTS = frozenset({"order.paid"})


@payment_router.post(
    "/payments/{payment_id}/confirm",
    response_model=PaymentOutcomeResponse,
)
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
    return PaymentOutcomeResponse(
        payment_id=updated.id,
        status=updated.status.value,
    )


@payment_router.post("/payments/webhook")
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Razorpay webhook handler for order.paid only (subscribe to that event in the Dashboard).

    Signature is verified using HMAC-SHA256 on the raw request body per Razorpay docs:
    https://razorpay.com/docs/webhooks/validate-test/
    """
    raw_body = await request.body()

    signature = request.headers.get("X-Razorpay-Signature")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing X-Razorpay-Signature header")

    webhook_secret = config.payment_webhook_secret.strip()
    if webhook_secret:
        try:
            await verify_webhook_signature(
                raw_body=raw_body,
                signature=signature,
                secret=webhook_secret,
            )
        except SignatureVerificationError:
            logger.warning("Razorpay webhook signature verification failed")
            raise HTTPException(status_code=403, detail="Invalid webhook signature")

    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event = payload.get("event", "")

    # Return 200 for events we don't handle so Razorpay doesn't retry them forever.
    # (Razorpay often sends payment.authorized / payment.captured before order.paid; we only update DB on order.paid.)
    if event not in _HANDLED_EVENTS:
        logger.info(
            "Razorpay webhook: ignored event=%s (only order.paid updates DB; 200 so Razorpay does not retry)",
            event,
        )
        return {"status": "ignored", "event": event}

    try:
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id = payment_entity["order_id"]
        payment_id = payment_entity["id"]
    except (KeyError, TypeError) as exc:
        logger.error("Unexpected Razorpay webhook payload structure for event %s: %s", event, exc)
        raise HTTPException(status_code=400, detail="Unexpected payload structure")

    try:
        completed_now = await BookingService.complete_payment_by_order_id(
            db,
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
        )
    except ValueError as exc:
        msg = str(exc)
        if msg == "webhook_payment_not_found":
            # Could be a payment that belongs to another system; log and return 200
            # so Razorpay doesn't retry endlessly.
            logger.warning("Webhook: no payment found for order_id=%s", order_id)
            return {"status": "ignored", "reason": "payment_not_found"}
        if msg == "webhook_payment_already_completed_different_id":
            logger.error(
                "Webhook: payment for order_id=%s already completed with a different payment_id",
                order_id,
            )
            return {"status": "ignored", "reason": "already_completed_different_id"}
        raise HTTPException(status_code=500, detail=msg) from exc
    # we can  add a flag in table to avoid duplicate  email send
    if completed_now:
        try:
            stmt = (
                select(User.email, User.full_name, Payment.booking_id, Payment.amount)
                .join(Booking, Booking.user_id == User.id)
                .join(Payment, Payment.booking_id == Booking.id)
                .where(Payment.razorpay_order_id == order_id.strip())
            )
            result = await db.execute(stmt)
            row = result.first()
            if row is None:
                logger.warning(
                    "Webhook email skipped: payment context not found for order_id=%s",
                    order_id,
                )
            else:
                await PaymentEmailService.send_payment_confirmation(
                    to_email=row.email,
                    to_name=row.full_name,
                    payment_id=payment_id,
                    order_id=order_id,
                    booking_id=row.booking_id,
                    amount=row.amount,
                )
        except Exception:
            logger.exception(
                "Webhook email send failed for order_id=%s payment_id=%s",
                order_id,
                payment_id,
            )

    # Completion / idempotent skip is logged in BookingService.complete_payment_by_order_id
    return {"status": "ok", "event": event}
