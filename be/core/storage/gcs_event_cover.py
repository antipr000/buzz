"""Upload event cover images to GCS (ADC: gcloud auth application-default login locally)."""

from __future__ import annotations

import uuid

from cuid2 import Cuid
from google.cloud import storage

from core.config import config

_ALLOWED_TYPES: dict[str, str] = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",  # non-standard but sent by some clients
    "image/png": ".png",
    "image/webp": ".webp",
}

_storage_client: storage.Client | None = None


def _get_storage_client() -> storage.Client:
    global _storage_client
    if _storage_client is None:
        project = config.google_cloud_project.strip()
        if not project:
            raise ValueError(
                "GOOGLE_CLOUD_PROJECT is not set."
            )
        _storage_client = storage.Client(project=project)
    return _storage_client


def _normalize_content_type(content_type: str) -> str:
    return content_type.split(";", maxsplit=1)[0].strip().lower()


def upload_event_cover_image(*, user_id: uuid.UUID, content_type: str, data: bytes) -> str:
    """
    Upload bytes to ``event-covers/{user_id}/{cuid}.{ext}``.

    Returns the public object URL (requires bucket public read for anonymous GET).

    Raises:
        ValueError: missing bucket config, empty body, oversize file, or disallowed content type.
    """
    bucket_name = config.gcs_event_covers_bucket.strip()
    if not bucket_name:
        raise ValueError("GCS event covers bucket is not configured")

    if not data:
        raise ValueError("Image file is empty")

    max_bytes = config.gcs_event_cover_max_bytes
    if len(data) > max_bytes:
        raise ValueError(f"Image exceeds maximum size of {max_bytes} bytes")

    normalized = _normalize_content_type(content_type)
    suffix = _ALLOWED_TYPES.get(normalized)
    if suffix is None:
        raise ValueError("Unsupported image type; use JPEG, PNG, or WebP")

    gcs_content_type = "image/jpeg" if normalized == "image/jpg" else normalized

    object_name = f"event-covers/{user_id}/{Cuid(length=16).generate()}{suffix}"

    client = _get_storage_client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)
    blob.upload_from_string(data, content_type=gcs_content_type)

    return f"https://storage.googleapis.com/{bucket_name}/{object_name}"
