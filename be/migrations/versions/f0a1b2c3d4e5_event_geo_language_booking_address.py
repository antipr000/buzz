"""event geo, language, booking address_id

Revision ID: f0a1b2c3d4e5
Revises: e8f9a0b1c2d3
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "f0a1b2c3d4e5"
down_revision: Union[str, Sequence[str], None] = "e8f9a0b1c2d3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("events", sa.Column("latitude", sa.Float(), nullable=True))
    op.add_column("events", sa.Column("longitude", sa.Float(), nullable=True))
    op.add_column("events", sa.Column("language", sa.String(length=64), nullable=True))
    op.create_index("ix_events_date_id", "events", ["date", "id"], unique=False)

    op.add_column("bookings", sa.Column("address_id", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_bookings_address_id"), "bookings", ["address_id"], unique=False)
    op.create_foreign_key(
        "fk_bookings_address_id_addresses",
        "bookings",
        "addresses",
        ["address_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_bookings_address_id_addresses", "bookings", type_="foreignkey")
    op.drop_index(op.f("ix_bookings_address_id"), table_name="bookings")
    op.drop_column("bookings", "address_id")

    op.drop_index("ix_events_date_id", table_name="events")
    op.drop_column("events", "language")
    op.drop_column("events", "longitude")
    op.drop_column("events", "latitude")
