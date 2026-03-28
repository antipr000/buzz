"""Pydantic base with camelCase JSON aliases."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


def to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p[:1].upper() + p[1:] if p else "" for p in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=to_camel,
    )
