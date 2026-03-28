import uuid

from pydantic import EmailStr, Field

from core.schemas.camel import CamelModel


class UserBriefOut(CamelModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    profile_image: str | None = Field(default=None, serialization_alias="profileImage")


class StatsOut(CamelModel):
    events_attended: int = Field(serialization_alias="eventsAttended")
    saved_events: int = Field(serialization_alias="savedEvents")
    events_created: int = Field(serialization_alias="eventsCreated")


class ProfileStatsResponse(CamelModel):
    user: UserBriefOut
    stats: StatsOut
