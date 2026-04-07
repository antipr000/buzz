"""Unit tests for pagination, pricing helpers, and schema parsing."""

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from ticket.tier_pricing import tier_line_price_ok
from common.pagination import (
    DiscoverCursor,
    EventListKeyset,
    decode_discover_cursor,
    decode_event_list_keyset,
    encode_discover_cursor,
    encode_event_list_keyset,
)
from core.schemas.schema_model import to_camel
from event.models.event import EventCategory
from event.schemas.event_schemas import CreateEventBody
from event.services.event_service import sanitize_discover_search_text
from ticket.models.ticket import TicketTier


def test_to_camel() -> None:
    assert to_camel("is_featured") == "isFeatured"
    assert to_camel("event_cover") == "eventCover"
    assert to_camel("booking_date") == "bookingDate"


def test_sanitize_discover_search_text() -> None:
    assert sanitize_discover_search_text("hello") == "hello"
    assert sanitize_discover_search_text("100%") == "100"
    assert sanitize_discover_search_text("a_b") == "ab"
    assert sanitize_discover_search_text("x\\y") == "xy"
    assert sanitize_discover_search_text("%%%") == ""
    assert sanitize_discover_search_text("jazz night") == "jazz night"
    assert sanitize_discover_search_text("café @ venue!") == "café venue"
    assert sanitize_discover_search_text("hello\tworld") == "hello world"
    assert sanitize_discover_search_text("hello\nworld") == "hello world"


def test_discover_cursor_roundtrip() -> None:
    c = DiscoverCursor(
        rank_tiny=3,
        created_at=datetime(2025, 1, 1, 12, 0, tzinfo=timezone.utc),
        event_id="evt_abc123",
    )
    token = encode_discover_cursor(c)
    d = decode_discover_cursor(token)
    assert d is not None
    assert d.rank_tiny == 3
    assert d.event_id == "evt_abc123"
    assert d.created_at.year == 2025


def test_event_list_keyset_roundtrip() -> None:
    c = EventListKeyset(
        created_at=datetime(2025, 2, 1, tzinfo=timezone.utc),
        event_id="evt_x",
    )
    t = encode_event_list_keyset(c)
    d = decode_event_list_keyset(t)
    assert d is not None
    assert d.event_id == "evt_x"
    assert d.created_at.year == 2025


def test_tier_price_ok() -> None:
    assert tier_line_price_ok(TicketTier.STANDARD, 100, 100) is True
    assert tier_line_price_ok(TicketTier.PREMIUM, 100, 150) is True
    assert tier_line_price_ok(TicketTier.VIP, 100, 200) is True
    assert tier_line_price_ok(TicketTier.STANDARD, 100, 99) is False


def test_create_event_body_category_lowercase() -> None:
    body = CreateEventBody.model_validate(
        {
            "title": "T",
            "description": "D",
            "category": "music",
            "date": "2026-06-01",
            "time": "18:00:00",
            "location": "Here",
            "price": 10,
            "latitude": 28.6,
            "longitude": 77.2,
        }
    )
    assert body.category == EventCategory.MUSIC


def test_create_event_body_invalid_category() -> None:
    with pytest.raises(ValidationError):
        CreateEventBody.model_validate(
            {
                "title": "T",
                "description": "D",
                "category": "not-a-real-category",
                "date": "2026-06-01",
                "time": "18:00:00",
                "location": "Here",
                "price": 10,
                "latitude": 1.0,
                "longitude": 1.0,
            }
        )
