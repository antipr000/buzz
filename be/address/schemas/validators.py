"""Shared address-type parsing for booking and user-address APIs."""

from __future__ import annotations

from typing import Annotated

from pydantic import BeforeValidator

from address.models.address import AddressType


def parse_address_type(v: object) -> AddressType:
    if isinstance(v, AddressType):
        return v
    if isinstance(v, str):
        m = {"home": AddressType.HOME, "work": AddressType.WORK, "other": AddressType.OTHER}
        return m.get(v.strip().lower(), AddressType.OTHER)
    raise ValueError("Invalid address type")


AddressTypeInput = Annotated[AddressType, BeforeValidator(parse_address_type)]
