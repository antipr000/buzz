from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from address.models.address import Address
from address.schemas.address_schemas import AddressCreateBody, AddressOut, AddressPatchBody


def _to_out(row: Address) -> AddressOut:
    return AddressOut(
        id=row.id,
        user_id=row.user_id,
        address_type=row.address_type.value,
        first_name=row.first_name,
        last_name=row.last_name,
        mobile_number=row.mobile_number,
        email_id=row.email,
        pin_code=row.pin_code,
        address_line1=row.address_line1,
        address_line2=row.address_line2,
        landmark=row.landmark,
        city=row.city,
        state=row.state,
        country=row.country,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


class AddressService:
    @staticmethod
    async def list_for_user(db: AsyncSession, *, user_id: uuid.UUID) -> list[AddressOut]:
        result = await db.execute(
            select(Address)
            .where(Address.user_id == user_id)
            .order_by(Address.created_at.desc())
        )
        rows = result.scalars().all()
        return [_to_out(a) for a in rows]

    @staticmethod
    async def get_for_user(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        address_id: str,
    ) -> AddressOut:
        row = await db.get(Address, address_id)
        if row is None or row.user_id != user_id:
            raise ValueError("Address not found")
        return _to_out(row)

    @staticmethod
    async def create(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        body: AddressCreateBody,
    ) -> AddressOut:
        row = Address(
            user_id=user_id,
            address_type=body.address_type,
            first_name=body.first_name.strip(),
            last_name=body.last_name.strip(),
            mobile_number=body.mobile_number.strip(),
            email=str(body.email_id).strip(),
            address_line1=body.address_line1.strip(),
            address_line2=body.address_line2.strip() if body.address_line2 else None,
            landmark=body.landmark.strip() if body.landmark else None,
            city=body.city.strip(),
            state=body.state.strip(),
            country=body.country.strip(),
            pin_code=body.pin_code,
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
        address_id: str,
        body: AddressPatchBody,
    ) -> AddressOut:
        row = await db.get(Address, address_id)
        if row is None or row.user_id != user_id:
            raise ValueError("Address not found")

        updates = body.model_dump(exclude_unset=True)
        if not updates:
            return _to_out(row)

        if "email_id" in updates:
            row.email = str(updates.pop("email_id")).strip()

        for key, value in updates.items():
            if key == "address_type":
                setattr(row, key, value)
                continue
            if isinstance(value, str):
                stripped = value.strip()
                if key in ("address_line2", "landmark") and not stripped:
                    setattr(row, key, None)
                else:
                    setattr(row, key, stripped)
            else:
                setattr(row, key, value)

        await db.commit()
        await db.refresh(row)
        return _to_out(row)

    @staticmethod
    async def delete_for_user(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        address_id: str,
    ) -> None:
        row = await db.get(Address, address_id)
        if row is None or row.user_id != user_id:
            raise ValueError("Address not found")
        await db.delete(row)
        await db.commit()
