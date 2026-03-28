"""Initial migration — create categories and products tables

Revision ID: 0001_initial
Revises:
Create Date: 2025-03-24
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── categories ────────────────────────────────────────────────────────────
    op.create_table(
        "categories",
        sa.Column("id",         sa.Integer(),     nullable=False, autoincrement=True),
        sa.Column("slug",       sa.String(80),    nullable=False),
        sa.Column("name",       sa.String(120),   nullable=False),
        sa.Column("image_url",  sa.Text(),        nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"])

    # ── products ─────────────────────────────────────────────────────────────
    op.create_table(
        "products",
        sa.Column("id",             sa.Integer(),               nullable=False, autoincrement=True),
        sa.Column("name",           sa.String(200),             nullable=False),
        sa.Column("slug",           sa.String(220),             nullable=False),
        sa.Column("price",          sa.Numeric(10, 2),          nullable=False),
        sa.Column("original_price", sa.Numeric(10, 2),          nullable=False),
        sa.Column("discount",       sa.Integer(),               nullable=False, server_default="0"),
        sa.Column("rating",         sa.Numeric(3, 1),           nullable=False, server_default="0.0"),
        sa.Column("reviews",        sa.Integer(),               nullable=False, server_default="0"),
        sa.Column("brand",          sa.String(120),             nullable=False),
        sa.Column("description",    sa.Text(),                  nullable=False),
        sa.Column("stock",          sa.Integer(),               nullable=False, server_default="0"),
        sa.Column("featured",       sa.Boolean(),               nullable=False, server_default="false"),
        sa.Column("images",         postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("colors",         postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("sizes",          postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("tags",           postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("category_id",    sa.Integer(),               nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_products_slug",        "products", ["slug"])
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_products_featured",    "products", ["featured"])
    op.create_index("ix_products_price",       "products", ["price"])


def downgrade() -> None:
    op.drop_table("products")
    op.drop_table("categories")