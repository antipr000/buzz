/**
 * Matches `be/ticket/models/ticket.py` TicketTier string values (Standard, Premium, VIP).
 */
export const TICKET_TIER_VALUES = ["Standard", "Premium", "VIP"] as const;

export type TicketTierValue = (typeof TICKET_TIER_VALUES)[number];
