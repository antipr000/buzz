import uuid

from pydantic import EmailStr

from core.schemas.schema_model import SchemaModel


class UserBriefOut(SchemaModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    profile_image: str | None = None


class StatsOut(SchemaModel):
    events_attended: int
    saved_events: int
    events_created: int


class ProfileStatsResponse(SchemaModel):
    user: UserBriefOut
    stats: StatsOut
