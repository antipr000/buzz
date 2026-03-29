"""Event categories aligned with app icon set (10 values).

Revision ID: g1h2i3j4k5l6
Revises: f0a1b2c3d4e5
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "g1h2i3j4k5l6"
down_revision: Union[str, Sequence[str], None] = "f0a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    SQLAlchemy `Enum(..., native_enum=False)` persists Python Enum *member names*
    (e.g. STARTUP, MUSIC), not display values like "Startup".
    If your DB was filled differently, run manual SQL before/after this migration.
    """
    op.execute(sa.text("UPDATE events SET category = 'NETWORK' WHERE category = 'STARTUP'"))
    op.execute(sa.text("UPDATE events SET category = 'FOOD' WHERE category = 'SOCIAL'"))
    op.execute(sa.text("UPDATE events SET category = 'SPORTS' WHERE category = 'WELLNESS'"))
    op.execute(sa.text("UPDATE events SET category = 'WORKSHOP' WHERE category IN ('FAMILY', 'KIDS')"))
    op.execute(sa.text("UPDATE events SET category = 'ART' WHERE category = 'CULTURE'"))


def downgrade() -> None:
    """Partial reverse (loses SOCIAL/CULTURE vs FOOD/ART distinction)."""
    op.execute(sa.text("UPDATE events SET category = 'STARTUP' WHERE category = 'NETWORK'"))
    op.execute(sa.text("UPDATE events SET category = 'WELLNESS' WHERE category = 'SPORTS'"))
    op.execute(sa.text("UPDATE events SET category = 'FAMILY' WHERE category = 'WORKSHOP'"))
