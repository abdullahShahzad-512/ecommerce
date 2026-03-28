"""
database/category_repo.py
"""
from __future__ import annotations
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from database.models import Category, Product


class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> list:
        stmt = select(Category).order_by(Category.name)
        categories = (await self.db.execute(stmt)).scalars().all()

        count_stmt = (
            select(Product.category_id, func.count(Product.id).label("cnt"))
            .group_by(Product.category_id)
        )
        counts = {row.category_id: row.cnt for row in (await self.db.execute(count_stmt)).all()}

        return [
            {"id": c.slug, "name": c.name, "image": c.image_url or "", "count": counts.get(c.id, 0)}
            for c in categories
        ]

    async def get_by_slug(self, slug: str) -> Optional[dict]:
        stmt = select(Category).where(Category.slug == slug)
        cat = (await self.db.execute(stmt)).scalar_one_or_none()
        if not cat:
            return None
        return {"id": cat.slug, "name": cat.name, "image": cat.image_url or ""}

    async def create(self, name: str, slug: str, image_url: Optional[str] = None) -> dict:
        category = Category(name=name.strip(), slug=slug.strip(), image_url=image_url)
        self.db.add(category)
        await self.db.flush()
        await self.db.refresh(category)
        return {"id": category.slug, "name": category.name, "image": category.image_url or ""}