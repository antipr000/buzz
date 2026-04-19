from __future__ import annotations

import re
import uuid

from fastapi import HTTPException, status
from sqlalchemy import delete as sa_delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from payouts.models.payout import Payout
from payouts.schemas.payout_schemas import PayoutCreateBody, PayoutOut, PayoutPatchBody

_IFSC_RE = re.compile(r"^[A-Z]{4}0[A-Z0-9]{6}$")
_ACCOUNT_DIGITS_RE = re.compile(r"^\d{6,18}$")


def _normalize_ifsc(value: str) -> str:
    return value.strip().upper()


def _validate_holder(name: str) -> str:
    s = name.strip()
    if not s:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="account_holder_name is required",
        )
    return s


def _validate_bank_optional(value: str | None) -> str | None:
    if value is None:
        return None
    s = value.strip()
    return s if s else None


def _validate_account_number(value: str) -> str:
    s = "".join(c for c in value.strip() if c.isdigit())
    if not _ACCOUNT_DIGITS_RE.match(s):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="account_number must be 6–18 digits",
        )
    return s


def _validate_ifsc(value: str) -> str:
    u = _normalize_ifsc(value)
    if not _IFSC_RE.match(u):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="invalid IFSC format",
        )
    return u


def _validate_patch_holder(value: str) -> str:
    s = value.strip()
    if not s:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="account_holder_name cannot be empty",
        )
    return s


def _last4(account_number: str) -> str:
    digits = "".join(c for c in account_number if c.isdigit())
    if len(digits) >= 4:
        return digits[-4:]
    return digits


def _to_out(row: Payout) -> PayoutOut:
    return PayoutOut(
        id=row.id,
        user_id=row.user_id,
        account_holder_name=row.account_holder_name,
        bank_name=row.bank_name,
        account_number_last4=_last4(row.account_number),
        ifsc_code=row.ifsc_code,
        account_type=row.account_type.value,
        is_primary=row.is_primary,
        is_verified=row.is_verified,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


class PayoutService:
    @staticmethod
    async def _count_for_user(db: AsyncSession, *, user_id: uuid.UUID) -> int:
        result = await db.execute(
            select(func.count()).select_from(Payout).where(Payout.user_id == user_id)
        )
        return int(result.scalar_one())

    @staticmethod
    async def _clear_primary_for_user(db: AsyncSession, *, user_id: uuid.UUID) -> None:
        await db.execute(
            update(Payout).where(Payout.user_id == user_id).values(is_primary=False)
        )

    @staticmethod
    async def _promote_newest(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        exclude_payout_id: str | None,
    ) -> None:
        """Pick the most recently created remaining payout as primary."""
        q = select(Payout).where(Payout.user_id == user_id)
        if exclude_payout_id is not None:
            q = q.where(Payout.id != exclude_payout_id)
        q = q.order_by(Payout.created_at.desc()).limit(1)
        result = await db.execute(q)
        cand = result.scalar_one_or_none()
        if cand is None:
            return
        await PayoutService._clear_primary_for_user(db, user_id=user_id)
        cand.is_primary = True
        await db.flush()

    @staticmethod
    async def list_for_user(db: AsyncSession, *, user_id: uuid.UUID) -> list[PayoutOut]:
        result = await db.execute(
            select(Payout)
            .where(Payout.user_id == user_id)
            .order_by(Payout.is_primary.desc(), Payout.created_at.desc())
        )
        rows = result.scalars().all()
        return [_to_out(r) for r in rows]

    @staticmethod
    async def get_for_user(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        payout_id: str,
    ) -> PayoutOut:
        row = await db.get(Payout, payout_id)
        if row is None or row.user_id != user_id:
            raise ValueError("Payout not found")
        return _to_out(row)

    @staticmethod
    async def create(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        body: PayoutCreateBody,
    ) -> PayoutOut:
        holder = _validate_holder(body.account_holder_name)
        acct = _validate_account_number(body.account_number)
        ifsc = _validate_ifsc(body.ifsc_code)
        bank = _validate_bank_optional(body.bank_name)

        count = await PayoutService._count_for_user(db, user_id=user_id)
        if count == 0:
            want_primary = True
        else:
            want_primary = bool(body.is_primary)

        if want_primary:
            await PayoutService._clear_primary_for_user(db, user_id=user_id)

        row = Payout(
            user_id=user_id,
            account_holder_name=holder,
            bank_name=bank,
            account_number=acct,
            ifsc_code=ifsc,
            account_type=body.account_type,
            is_primary=want_primary,
            is_verified=False,
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
        return _to_out(row)

    @staticmethod
    async def patch(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        payout_id: str,
        body: PayoutPatchBody,
    ) -> PayoutOut:
        row = await db.get(Payout, payout_id)
        if row is None or row.user_id != user_id:
            raise ValueError("Payout not found")

        raw = body.model_dump(exclude_unset=True)
        if not raw:
            return _to_out(row)

        updates: dict = {}
        if "account_holder_name" in raw:
            v = raw["account_holder_name"]
            if v is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="account_holder_name cannot be null",
                )
            updates["account_holder_name"] = _validate_patch_holder(v)
        if "account_number" in raw:
            v = raw["account_number"]
            if v is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="account_number cannot be null",
                )
            updates["account_number"] = _validate_account_number(v)
        if "ifsc_code" in raw:
            v = raw["ifsc_code"]
            if v is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="ifsc_code cannot be null",
                )
            updates["ifsc_code"] = _validate_ifsc(v)
        if "bank_name" in raw:
            updates["bank_name"] = _validate_bank_optional(raw["bank_name"])
        if "account_type" in raw:
            v = raw["account_type"]
            if v is None:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="account_type cannot be null",
                )
            updates["account_type"] = v

        if "is_primary" in raw:
            if raw["is_primary"] is True:
                await PayoutService._clear_primary_for_user(db, user_id=user_id)
                row.is_primary = True
            elif raw["is_primary"] is False and row.is_primary:
                row.is_primary = False
                await db.flush()
                await PayoutService._promote_newest(
                    db,
                    user_id=user_id,
                    exclude_payout_id=row.id,
                )

        for key, value in updates.items():
            setattr(row, key, value)

        await db.commit()
        await db.refresh(row)
        return _to_out(row)

    @staticmethod
    async def delete_for_user(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        payout_id: str,
    ) -> None:
        row = await db.get(Payout, payout_id)
        if row is None or row.user_id != user_id:
            raise ValueError("Payout not found")

        was_primary = row.is_primary
        await db.execute(sa_delete(Payout).where(Payout.id == payout_id))
        await db.flush()

        if was_primary:
            await PayoutService._promote_newest(
                db,
                user_id=user_id,
                exclude_payout_id=None,
            )

        await db.commit()
