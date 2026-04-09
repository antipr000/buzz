from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import BaseEntity

if TYPE_CHECKING:
    from booking.models.booking import Booking


class PaymentStatus(str, enum.Enum):
    PENDING_PAYMENT = "PENDING_PAYMENT"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class PaymentMethod(str, enum.Enum):
    """`free` is only valid when the ticket total is ₹0 (see `BookingService.purchase`)."""

    FREE = "free"
    UPI = "upi"
    CREDIT_DEBIT_CARD = "credit_debit_card"
    PAY_LATER = "pay_later"
    WALLETS = "wallets"
    EMI = "emi"
    NET_BANKING = "net_banking"
    CASH_ON_DELIVERY = "cash_on_delivery"


class Payment(BaseEntity):
    __tablename__ = "payments"

    booking_id: Mapped[str] = mapped_column(
        String(255),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, native_enum=False, length=32),
        nullable=False,
    )
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, native_enum=False, length=32),
        nullable=False,
    )

    booking: Mapped[Booking] = relationship(back_populates="payments", lazy="raise")

    def get_key(self) -> str:
        return "pay"
