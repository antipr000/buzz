from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from payment.models.payment import Payment, PaymentStatus


class PaymentService:
    @staticmethod
    async def confirm(
        db: AsyncSession,
        *,
        payment_id: str,
        success: bool,
    ) -> Payment:
        pay = await db.get(Payment, payment_id)
        if pay is None:
            raise ValueError("Payment not found")
        pay.status = PaymentStatus.COMPLETED if success else PaymentStatus.FAILED
        await db.commit()
        await db.refresh(pay)
        return pay

