from __future__ import annotations

import logging

import httpx

from core.config import config

logger = logging.getLogger(__name__)

_BREVO_SEND_EMAIL_URL = "https://api.brevo.com/v3/smtp/email"


class PaymentEmailService:
    @staticmethod
    async def send_payment_confirmation(
        *,
        to_email: str,
        to_name: str,
        payment_id: str,
        order_id: str,
        booking_id: str,
        amount: int,
        currency: str = "INR",
    ) -> None:
        api_key = config.brevo_api_key.strip()
        template_id = config.brevo_payment_confirm_template_id
        if not api_key or template_id <= 0:
            logger.warning(
                "Brevo payment email skipped: missing api key or template id "
                "(order_id=%s payment_id=%s)",
                order_id,
                payment_id,
            )
            return

        payload: dict = {
            "to": [{"email": to_email, "name": to_name}],
            "templateId": template_id,
            "params": {
                "user_name": to_name,
                "payment_id": payment_id,
                "order_id": order_id,
                "booking_id": booking_id,
                "amount": amount,
                "currency": currency,
            },
        }

        # Optional override; if absent, Brevo template sender is used.
        sender_email = config.brevo_sender_email.strip()
        if sender_email:
            payload["sender"] = {
                "email": sender_email,
                "name": config.brevo_sender_name.strip() or "Buzz",
            }

        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": api_key,
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                _BREVO_SEND_EMAIL_URL,
                json=payload,
                headers=headers,
            )
        if response.status_code >= 400:
            raise RuntimeError(
                f"brevo_send_failed status={response.status_code} body={response.text}"
            )
