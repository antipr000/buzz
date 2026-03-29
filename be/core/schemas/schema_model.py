"""Shared Pydantic base (`SchemaModel`) and small string helpers."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


def to_camel(name: str) -> str:
    parts = name.split("_")
    return parts[0] + "".join(p[:1].upper() + p[1:] if p else "" for p in parts[1:])


class SchemaModel(BaseModel):
    """Base for request/response models; serialized JSON keys are snake_case."""

    model_config = ConfigDict(populate_by_name=True)
