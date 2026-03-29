"""Shared API response shapes (camelCase JSON)."""

from __future__ import annotations

from core.schemas.schema_model import SchemaModel


class MessageResponse(SchemaModel):
    message: str


class HealthResponse(SchemaModel):
    status: str
