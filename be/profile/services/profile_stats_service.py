from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from booking.models.booking import Booking, BookingStatus
from event.models.event import Event
from profile.models.profile import Profile
from profile.schemas.stats import ProfileStatsResponse, StatsOut, UserBriefOut
from saved_event.models.saved_event import SavedEvent
from user.models.user import User


class ProfileStatsService:
    @staticmethod
    async def get_profile_stats(db: AsyncSession, *, user_id: uuid.UUID) -> ProfileStatsResponse:
        user = await db.get(User, user_id)
        if user is None:
            raise ValueError("User not found")
        profile = await db.get(Profile, user_id)

        attended_q = select(func.count()).select_from(Booking).where(
            Booking.user_id == user_id,
            Booking.status == BookingStatus.ATTENDED,
        )
        saved_q = select(func.count()).select_from(SavedEvent).where(SavedEvent.user_id == user_id)
        created_q = select(func.count()).select_from(Event).where(Event.organizer_id == user_id)

        attended = int((await db.execute(attended_q)).scalar_one())
        saved = int((await db.execute(saved_q)).scalar_one())
        created = int((await db.execute(created_q)).scalar_one())

        return ProfileStatsResponse(
            user=UserBriefOut(
                id=user.id,
                name=user.full_name,
                email=user.email,
                profile_image=profile.profile_image if profile else None,
            ),
            stats=StatsOut(
                events_attended=attended,
                saved_events=saved,
                events_created=created,
            ),
        )
