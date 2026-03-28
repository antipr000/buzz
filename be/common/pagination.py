"""Opaque cursor helpers for keyset pagination."""

from __future__ import annotations

import base64
import json
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class DiscoverCursor:
    """Keyset for discover: ORDER BY rank_tiny DESC, created_at DESC, id DESC."""

    rank_tiny: int  # is_featured*2 + is_popular (0..3)
    created_at: datetime
    event_id: str


def encode_discover_cursor(c: DiscoverCursor) -> str:
    payload = {
        "rk": c.rank_tiny,
        "ca": c.created_at.astimezone(timezone.utc).isoformat(),
        "id": c.event_id,
    }
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def decode_discover_cursor(token: str) -> DiscoverCursor | None:
    if not token:
        return None
    pad = "=" * (-len(token) % 4)
    try:
        raw = base64.urlsafe_b64decode(token + pad)
        payload = json.loads(raw.decode("utf-8"))
        rk = int(payload["rk"])
        ca = payload["ca"]
        eid = payload["id"]
        dt = datetime.fromisoformat(ca.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return DiscoverCursor(rank_tiny=rk, created_at=dt, event_id=eid)
    except (KeyError, ValueError, json.JSONDecodeError):
        return None


@dataclass
class SavedCursor:
    created_at: datetime
    event_id: str


def encode_saved_cursor(c: SavedCursor) -> str:
    payload = {
        "ca": c.created_at.astimezone(timezone.utc).isoformat(),
        "eid": c.event_id,
    }
    raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")


def decode_saved_cursor(token: str) -> SavedCursor | None:
    if not token:
        return None
    pad = "=" * (-len(token) % 4)
    try:
        raw = base64.urlsafe_b64decode(token + pad)
        payload = json.loads(raw.decode("utf-8"))
        dt = datetime.fromisoformat(payload["ca"].replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return SavedCursor(created_at=dt, event_id=payload["eid"])
    except (KeyError, ValueError, json.JSONDecodeError):
        return None
