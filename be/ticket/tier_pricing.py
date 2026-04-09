"""Two pricing modes: single flat price, or three explicit tiers in `Event.tier_details`."""

from __future__ import annotations

from event.models.event import Event
from ticket.models.ticket import TicketTier


def tier_line_price_ok_for_event(event: Event, tier: TicketTier, line_price: int) -> bool:
    if event.tier_details is None:
        return tier is TicketTier.STANDARD and line_price == event.price
    row = event.tier_details.get(tier.value, {})
    return isinstance(row, dict) and int(row.get("price", -1)) == line_price


def ensure_ticket_line_price_for_event(
    event: Event, tier: TicketTier, line_price: int
) -> None:
    """Raise ValueError if this tier/price is not allowed for the event (purchase validation)."""
    if tier_line_price_ok_for_event(event, tier, line_price):
        return
    if event.tier_details is None and tier is not TicketTier.STANDARD:
        raise ValueError("purchase_tier_not_available")
    raise ValueError("purchase_price_mismatch")
