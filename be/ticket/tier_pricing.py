"""Single source of truth for per-tier prices derived from Event.price (MVP)."""

from __future__ import annotations

from ticket.models.ticket import TicketTier

_TIER_MULTIPLIER: dict[TicketTier, float] = {
    TicketTier.STANDARD: 1.0,
    TicketTier.PREMIUM: 1.5,
    TicketTier.VIP: 2.0,
}


def expected_tier_price(event_base_price: int, tier: TicketTier) -> int:
    """Matches purchase validation: int(base * multiplier)."""
    return int(event_base_price * _TIER_MULTIPLIER[tier])


def tier_line_price_ok(tier: TicketTier, event_price: int, line_price: int) -> bool:
    return line_price == expected_tier_price(event_price, tier)


def all_tier_prices(event_base_price: int) -> list[tuple[TicketTier, int]]:
    """Stable order: Standard, Premium, VIP (enum definition order)."""
    return [(t, expected_tier_price(event_base_price, t)) for t in TicketTier]
