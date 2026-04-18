"""Razorpay REST client wrapper (sync SDK run in a thread pool for async FastAPI)."""

from __future__ import annotations

import asyncio
import secrets
from typing import Any

import razorpay

from core.config import config


def razorpay_credentials_configured() -> bool:
    return bool(config.razorpay_key_id.strip() and config.razorpay_key_secret.strip())


def _client() -> razorpay.Client:
    if not razorpay_credentials_configured():
        raise ValueError("razorpay_not_configured")
    return razorpay.Client(auth=(config.razorpay_key_id, config.razorpay_key_secret))


def _receipt_value(receipt: str | None) -> str:
    """Razorpay requires `receipt` (max 40 chars). If omitted, use a unique token."""
    if receipt and receipt.strip():
        return receipt.strip()[:40]
    return secrets.token_hex(10)


def _order_create_sync(
    *,
    amount_paise: int,
    currency: str,
    receipt: str | None,
    notes: dict[str, str] | None,
) -> dict[str, Any]:
    """Create a Razorpay order (amount in smallest currency unit, e.g. paise for INR)."""
    body: dict[str, Any] = {
        "amount": amount_paise,
        "currency": currency,
        "receipt": _receipt_value(receipt),
    }
    if notes:
        body["notes"] = notes
    return _client().order.create(body)


async def create_order(
    *,
    amount_paise: int,
    currency: str,
    receipt: str | None = None,
    notes: dict[str, str] | None = None,
) -> dict[str, Any]:
    """Create order. Pass `receipt` (e.g. truncated payment id) when you have it; else a random receipt is used."""
    return await asyncio.to_thread(
        _order_create_sync,
        amount_paise=amount_paise,
        currency=currency,
        receipt=receipt,
        notes=notes,
    )


def _verify_payment_signature_sync(
    *,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> None:
    params = {
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": razorpay_payment_id,
        "razorpay_signature": razorpay_signature,
    }
    _client().utility.verify_payment_signature(params)


async def verify_payment_signature(
    *,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> None:
    await asyncio.to_thread(
        _verify_payment_signature_sync,
        razorpay_order_id=razorpay_order_id,
        razorpay_payment_id=razorpay_payment_id,
        razorpay_signature=razorpay_signature,
    )
