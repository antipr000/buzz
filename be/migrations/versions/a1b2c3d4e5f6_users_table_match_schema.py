"""users table columns match schema (email, password, full_name)

Revision ID: a1b2c3d4e5f6
Revises: ef8164f3ca06
Create Date: 2026-03-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "ef8164f3ca06"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("full_name", sa.String(), nullable=False, server_default=""),
    )
    op.add_column("users", sa.Column("password", sa.String(), nullable=True))
    op.execute(sa.text("UPDATE users SET password = hashed_password"))
    op.alter_column("users", "password", nullable=False)
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_column("users", "username")
    op.drop_column("users", "hashed_password")
    op.drop_column("users", "is_active")
    op.alter_column("users", "full_name", server_default=None)


def downgrade() -> None:
    op.add_column("users", sa.Column("username", sa.String(), nullable=True))
    op.add_column("users", sa.Column("hashed_password", sa.String(), nullable=True))
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=True))
    op.execute(sa.text("UPDATE users SET hashed_password = password"))
    op.execute(sa.text("UPDATE users SET username = id"))
    op.execute(sa.text("UPDATE users SET is_active = true"))
    op.alter_column("users", "username", nullable=False)
    op.alter_column("users", "hashed_password", nullable=False)
    op.alter_column("users", "is_active", nullable=False)
    op.drop_column("users", "password")
    op.drop_column("users", "full_name")
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)
