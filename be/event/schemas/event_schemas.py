"""Request/response models for events (camelCase JSON)."""

from __future__ import annotations

from datetime import date, time
from typing import Annotated

from pydantic import BeforeValidator, Field

from core.schemas.camel import CamelModel
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


class OrganizerOut(CamelModel):
    name: str
    logo: str | None = None


class EventCard(CamelModel):
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


class PaginationOut(CamelModel):
    next_cursor: str | None
    has_more: bool


class DiscoverResponse(CamelModel):
    user_location: str | None = Field(default=None, serialization_alias="userLocation")
    trending_events: list[EventCard] = Field(serialization_alias="trendingEvents")
    pagination: PaginationOut


class CreateEventBody(CamelModel):
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


class CreateEventResponse(CamelModel):
    id: str


class SaveEventBody(CamelModel):
    event_id: str


class SavedListResponse(CamelModel):
    saved_events: list[EventCard] = Field(serialization_alias="savedEvents")
    pagination: PaginationOut
