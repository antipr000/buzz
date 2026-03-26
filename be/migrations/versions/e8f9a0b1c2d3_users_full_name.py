"""users: full_name replaces first_name and last_name

Revision ID: e8f9a0b1c2d3
Revises: d4e5f6a7b8c9
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e8f9a0b1c2d3"
down_revision: Union[str, Sequence[str], None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("full_name", sa.String(), nullable=True))
    op.execute(
        """
        UPDATE users SET full_name = COALESCE(
            NULLIF(
                TRIM(
                    CONCAT_WS(
                        ' ',
                        NULLIF(TRIM(first_name), ''),
                        NULLIF(TRIM(last_name), '')
                    )
                ),
                ''
            ),
            'User'
        )
        """
    )
    op.alter_column("users", "full_name", existing_type=sa.String(), nullable=False)
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column("first_name", sa.String(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("last_name", sa.String(), nullable=True),
    )
    op.execute(
        """
        UPDATE users SET
            first_name = COALESCE(
                NULLIF(split_part(trim(COALESCE(full_name, '')), ' ', 1), ''),
                'User'
            ),
            last_name = CASE
                WHEN strpos(trim(COALESCE(full_name, '')), ' ') > 0 THEN
                    trim(substring(trim(full_name) from strpos(trim(full_name), ' ') + 1))
                ELSE ''
            END
        """
    )
    op.alter_column("users", "first_name", existing_type=sa.String(), nullable=False)
    op.alter_column("users", "last_name", existing_type=sa.String(), nullable=False)
    op.drop_column("users", "full_name")
