"""Unit tests for pagination, pricing helpers, and schema parsing."""

from datetime import date, datetime, timezone
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from ticket.tier_pricing import (
    ensure_ticket_line_price_for_event,
    tier_line_price_ok_for_event,
)
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
from event.services.event_service import (
    _ensure_create_event_date_not_past,
    _ensure_tiered_price_matches_body,
    normalized_tier_details_for_create,
    sanitize_discover_search_text,
    ticket_tiers_for_event_detail,
)
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


def test_tier_line_price_ok_for_event_single_price() -> None:
    ev = SimpleNamespace(price=100, tier_details=None)
    assert tier_line_price_ok_for_event(ev, TicketTier.STANDARD, 100) is True
    assert tier_line_price_ok_for_event(ev, TicketTier.STANDARD, 99) is False
    assert tier_line_price_ok_for_event(ev, TicketTier.PREMIUM, 100) is False


def test_tier_line_price_ok_for_event_tiered() -> None:
    ev = SimpleNamespace(
        price=100,
        tier_details={
            "Standard": {"price": 100, "amenities": []},
            "Premium": {"price": 150, "amenities": ["x"]},
            "VIP": {"price": 200, "amenities": []},
        },
    )
    assert tier_line_price_ok_for_event(ev, TicketTier.STANDARD, 100) is True
    assert tier_line_price_ok_for_event(ev, TicketTier.PREMIUM, 150) is True
    assert tier_line_price_ok_for_event(ev, TicketTier.VIP, 200) is True
    assert tier_line_price_ok_for_event(ev, TicketTier.VIP, 199) is False


def test_ensure_ticket_line_single_price_rejects_non_standard() -> None:
    ev = SimpleNamespace(price=100, tier_details=None)
    ensure_ticket_line_price_for_event(ev, TicketTier.STANDARD, 100)
    with pytest.raises(ValueError, match="purchase_tier_not_available"):
        ensure_ticket_line_price_for_event(ev, TicketTier.PREMIUM, 100)


def test_ensure_ticket_line_single_price_rejects_wrong_amount() -> None:
    ev = SimpleNamespace(price=100, tier_details=None)
    with pytest.raises(ValueError, match="purchase_price_mismatch"):
        ensure_ticket_line_price_for_event(ev, TicketTier.STANDARD, 99)


def test_ensure_ticket_line_tiered_rejects_wrong_amount() -> None:
    ev = SimpleNamespace(
        price=100,
        tier_details={
            "Standard": {"price": 100, "amenities": []},
            "Premium": {"price": 150, "amenities": []},
            "VIP": {"price": 200, "amenities": []},
        },
    )
    ensure_ticket_line_price_for_event(ev, TicketTier.PREMIUM, 150)
    with pytest.raises(ValueError, match="purchase_price_mismatch"):
        ensure_ticket_line_price_for_event(ev, TicketTier.PREMIUM, 149)


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


def test_ensure_create_event_date_past_raises() -> None:
    ref = date(2026, 6, 15)
    with pytest.raises(ValueError, match="event_date_past"):
        _ensure_create_event_date_not_past(date(2026, 6, 14), today=ref)


def test_ensure_create_event_date_today_ok() -> None:
    ref = date(2026, 6, 15)
    _ensure_create_event_date_not_past(date(2026, 6, 15), today=ref)


def test_ensure_create_event_date_future_ok() -> None:
    ref = date(2026, 6, 15)
    _ensure_create_event_date_not_past(date(2026, 6, 16), today=ref)


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


def test_create_event_body_tier_details_ok() -> None:
    body = CreateEventBody.model_validate(
        {
            "title": "T",
            "description": "D",
            "category": "music",
            "date": "2026-06-01",
            "time": "18:00:00",
            "location": "Here",
            "price": 100,
            "latitude": 28.6,
            "longitude": 77.2,
            "tier_details": {
                "Standard": {"price": 100, "amenities": ["  a  ", "", "b"]},
                "Premium": {"price": 150, "amenities": []},
                "VIP": {"price": 200, "amenities": ["x"]},
            },
        }
    )
    assert body.tier_details is not None
    assert body.tier_details["Standard"].amenities == ["  a  ", "", "b"]
    blob = normalized_tier_details_for_create(body)
    assert blob is not None
    assert blob["Standard"]["amenities"] == ["  a  ", "", "b"]
    assert blob["Premium"]["amenities"] == []


def test_create_tiered_price_must_match_standard() -> None:
    body = CreateEventBody.model_validate(
        {
            "title": "T",
            "description": "D",
            "category": "music",
            "date": "2026-06-01",
            "time": "18:00:00",
            "location": "Here",
            "price": 999,
            "latitude": 28.6,
            "longitude": 77.2,
            "tier_details": {
                "Standard": {"price": 100, "amenities": []},
                "Premium": {"price": 150, "amenities": []},
                "VIP": {"price": 200, "amenities": []},
            },
        }
    )
    tier_blob = normalized_tier_details_for_create(body)
    assert tier_blob is not None
    with pytest.raises(ValueError, match="price_must_match_standard_tier"):
        _ensure_tiered_price_matches_body(body, tier_blob)

    body_ok = body.model_copy(update={"price": 100})
    _ensure_tiered_price_matches_body(body_ok, tier_blob)


def test_ticket_tiers_for_event_detail_single_price_no_amenities() -> None:
    ev = SimpleNamespace(price=50, tier_details=None)
    tiers = ticket_tiers_for_event_detail(ev)
    assert len(tiers) == 1
    assert tiers[0].tier == TicketTier.STANDARD.value
    assert tiers[0].price == 50
    assert tiers[0].amenities == []


def test_ticket_tiers_for_event_detail_tiered_amenities() -> None:
    ev = SimpleNamespace(
        price=100,
        tier_details={
            "Standard": {"price": 100, "amenities": ["Entry", "Standing zone"]},
            "Premium": {"price": 150, "amenities": ["Seat", "Drink"]},
            "VIP": {"price": 500, "amenities": ["Backstage"]},
        },
    )
    tiers = ticket_tiers_for_event_detail(ev)
    assert [t.tier for t in tiers] == ["Standard", "Premium", "VIP"]
    assert tiers[0].price == 100 and tiers[0].amenities == ["Entry", "Standing zone"]
    assert tiers[1].price == 150 and tiers[1].amenities == ["Seat", "Drink"]
    assert tiers[2].price == 500 and tiers[2].amenities == ["Backstage"]


def test_tier_details_wrong_keys_raises_in_service() -> None:
    body = CreateEventBody.model_validate(
        {
            "title": "T",
            "description": "D",
            "category": "music",
            "date": "2026-06-01",
            "time": "18:00:00",
            "location": "Here",
            "price": 100,
            "latitude": 28.6,
            "longitude": 77.2,
            "tier_details": {
                "Standard": {"price": 100, "amenities": []},
                "Premium": {"price": 150, "amenities": []},
            },
        }
    )
    with pytest.raises(ValueError, match="tier_details must contain exactly"):
        normalized_tier_details_for_create(body)
