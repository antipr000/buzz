from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from profile.models.profile import Profile
from profile.schemas.detail import ProfileMeResponse, ProfilePatchBody
from user.models.user import User

# Profile columns updated only when the corresponding key appears in `updates`.
_PROFILE_PATCH_KEYS = frozenset(
    {"birthday", "identify", "marital_status", "mobile_number", "profile_image"},
)


class ProfileMeService:
    @staticmethod
    async def get_me(db: AsyncSession, *, user_id: uuid.UUID) -> ProfileMeResponse:
        user = await db.get(User, user_id)
        if user is None:
            raise ValueError("User not found")
        profile = await db.get(Profile, user_id)
        return ProfileMeService._to_response(user, profile)

    @staticmethod
    async def patch_me(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        body: ProfilePatchBody,
    ) -> ProfileMeResponse:
        """Apply only fields that were explicitly set in the request body (exclude_unset)."""
        user = await db.get(User, user_id)
        if user is None:
            raise ValueError("User not found")

        # Keys present in JSON only — omitted fields are not in this dict and must not touch the DB.
        updates = body.model_dump(exclude_unset=True)
        if not updates:
            profile = await db.get(Profile, user_id)
            return ProfileMeService._to_response(user, profile)

        profile_keys = {k: v for k, v in updates.items() if k in _PROFILE_PATCH_KEYS}
        if profile_keys:
            profile = await db.get(Profile, user_id)
            if profile is None:
                # `public.profiles` is created with `public.users` by on_auth_user_created.sql.
                raise ValueError("Profile not found")
        else:
            profile = None

        if "full_name" in updates:
            fn = updates["full_name"]
            if fn is None or (isinstance(fn, str) and not fn.strip()):
                raise ValueError("full_name cannot be empty")
            user.full_name = fn.strip()

        if profile_keys:
            for key, value in profile_keys.items():
                setattr(profile, key, value)

        await db.commit()
        await db.refresh(user)
        profile = await db.get(Profile, user_id)
        return ProfileMeService._to_response(user, profile)

    @staticmethod
    def _to_response(user: User, profile: Profile | None) -> ProfileMeResponse:
        return ProfileMeResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            birthday=profile.birthday if profile else None,
            identify=profile.identify if profile else None,
            marital_status=profile.marital_status if profile else None,
            mobile_number=profile.mobile_number if profile else None,
            profile_image=profile.profile_image if profile else None,
        )
