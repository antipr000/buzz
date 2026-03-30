"""Request/response models for events (snake_case JSON)."""

from __future__ import annotations

from datetime import date, time
from typing import Annotated

from pydantic import BeforeValidator, ConfigDict, Field

from core.schemas.schema_model import SchemaModel
from event.models.event import EventCategory


def category_api_value(cat: EventCategory) -> str:
    return cat.value.lower()


def _parse_event_category(v: object) -> EventCategory:
    if isinstance(v, EventCategory):
        return v
    if isinstance(v, str):
        s = v.strip().lower()
        for c in EventCategory:
            if c.value.lower() == s:
                return c
    raise ValueError("Invalid category")


class OrganizerOut(SchemaModel):
    name: str
    logo: str | None = None


class EventCard(SchemaModel):
    id: str
    category: str
    title: str
    description: str
    date: date
    time: time
    location: str
    price: int
    is_featured: bool
    is_popular: bool
    organizer: OrganizerOut
    event_cover: str | None
    participants: int
    is_saved: bool = False


class PaginationOut(SchemaModel):
    next_cursor: str | None
    has_more: bool


class DiscoverResponse(SchemaModel):
    user_location: str | None = None
    trending_events: list[EventCard]
    pagination: PaginationOut


class CreateEventBody(SchemaModel):
    event_cover: str | None = None
    title: str
    description: str
    category: Annotated[EventCategory, BeforeValidator(_parse_event_category)]
    date: date
    time: time
    location: str
    price: int
    latitude: float
    longitude: float
    language: str | None = None


class CreateEventResponse(SchemaModel):
    id: str


class SaveEventBody(SchemaModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    event_id: str = Field(min_length=1, max_length=255)


class SavedListResponse(SchemaModel):
    saved_events: list[EventCard]
    pagination: PaginationOut
