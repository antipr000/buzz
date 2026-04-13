"""Supabase JWT verification (JWKS) and FastAPI dependencies."""

from __future__ import annotations

import uuid
from functools import lru_cache
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, PyJWKClientConnectionError, PyJWKClientError
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import config
from core.database import get_db
from user.models.user import AccountStatus, User
from user.services import user_service

security = HTTPBearer(auto_error=True)

# Small clock skew tolerance between issuers and API servers (seconds).
_JWT_LEEWAY_SECONDS = 60

# End-user session tokens use this role; reject anon / service_role JWTs if presented as Bearer.
_EXPECTED_JWT_ROLE = "authenticated"


@lru_cache(maxsize=1)
def _jwks_client_for_url(supabase_base_url: str) -> PyJWKClient:
    """One PyJWKClient per base URL — reuses PyJWT's JWKS cache across requests (no mutable globals)."""
    jwks_url = f"{supabase_base_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    return PyJWKClient(jwks_url)


def _require_https_or_local_dev(url_base: str) -> None:
    """Avoid JWKS fetch over plain HTTP to remote hosts (MITM). Allow localhost for Supabase CLI."""
    lower = url_base.lower()
    if lower.startswith("https://"):
        return
    if lower.startswith("http://127.0.0.1") or lower.startswith("http://localhost"):
        return
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="SUPABASE_URL must use https:// for remote hosts (or http://localhost / http://127.0.0.1 for local dev)",
    )


def decode_supabase_jwt(token: str) -> dict[str, Any]:
    """Verify Supabase user JWT using JWKS (https://supabase.com/docs/guides/auth/jwts)."""
    if not config.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="SUPABASE_URL not configured",
        )
    base = config.supabase_url.rstrip("/")
    _require_https_or_local_dev(base)

    try:
        signing_key = _jwks_client_for_url(base).get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256", "RS512"],
            audience="authenticated",
            issuer=config.supabase_jwt_issuer,
            leeway=_JWT_LEEWAY_SECONDS,
            options={
                "require": ["exp", "sub"],
                "verify_aud": True,
                "verify_iss": True,
            },
        )
    except PyJWKClientConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not reach JWKS endpoint",
        ) from e
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except PyJWKClientError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signing key",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    if payload.get("role") != _EXPECTED_JWT_ROLE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token role",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_jwt_payload(
    cred: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict[str, Any]:
    return decode_supabase_jwt(cred.credentials)


async def get_current_user_id(
    payload: Annotated[dict[str, Any], Depends(get_jwt_payload)],
) -> uuid.UUID:
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )
    try:
        return uuid.UUID(str(sub))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid subject id",
        ) from e


async def get_current_user(
    db: Annotated[AsyncSession, Depends(get_db)],
    user_id: Annotated[uuid.UUID, Depends(get_current_user_id)],
) -> User:
    """Load `public.users` by JWT `sub`. Rows are created by the Supabase `auth.users` trigger, not here."""
    user = await user_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No application user row for this account. "
                "Deploy the trigger in migrations/sql/on_auth_user_created.sql in the Supabase SQL Editor."
            ),
        )
    if user.status == AccountStatus.deactivated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )
    if user.status == AccountStatus.blocked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is blocked",
        )
    return user
