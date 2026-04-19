"""Import every SQLAlchemy model so ``Base.metadata`` is complete.

Alembic's ``env.py`` imports this module for autogenerate. When you add a new
model, register it here or autogenerate will omit that table.
"""

from address.models.address import Address
from booking.models.booking import Booking
from device.models.device import Device
from event.models.event import Event
from payment.models.payment import Payment
from payouts.models.payout import Payout
from profile.models.profile import Profile
from saved_event.models.saved_event import SavedEvent
from ticket.models.ticket import Ticket
from user.models.user import User

__all__ = [
    "Address",
    "Booking",
    "Device",
    "Event",
    "Payment",
    "Payout",
    "Profile",
    "SavedEvent",
    "Ticket",
    "User",
]
