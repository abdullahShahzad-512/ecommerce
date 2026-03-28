"""
database/product_repo.py — All DB queries for Products.
"""
from __future__ import annotations
from typing import Optional
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from database.models import Product, Category


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(
        self,
        category_slug: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        featured: Optional[bool] = None,
        sort: str = "default",
        page: int = 1,
        limit: int = 12,
    ) -> dict:
        stmt = select(Product).options(selectinload(Product.category_rel))
        conditions = []

        if category_slug:
            stmt = stmt.join(Product.category_rel)
            conditions.append(Category.slug == category_slug)

        if search:
            term = f"%{search.lower()}%"
            conditions.append(or_(
                func.lower(Product.name).like(term),
                func.lower(Product.description).like(term),
                func.lower(Product.brand).like(term),
            ))

        if min_price is not None:
            conditions.append(Product.price >= min_price)
        if max_price is not None:
            conditions.append(Product.price <= max_price)
        if featured is not None:
            conditions.append(Product.featured == featured)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await self.db.execute(count_stmt)).scalar_one()

        sort_map = {
            "price-asc":  Product.price.asc(),
            "price-desc": Product.price.desc(),
            "rating":     Product.rating.desc(),
            "discount":   Product.discount.desc(),
            "newest":     Product.created_at.desc(),
        }
        stmt = stmt.order_by(sort_map.get(sort, Product.id.asc()))
        stmt = stmt.offset((page - 1) * limit).limit(limit)

        products = (await self.db.execute(stmt)).scalars().all()
        return {
            "products": [self._to_dict(p) for p in products],
            "total": total,
            "page": page,
            "limit": limit,
            "pages": max(1, (total + limit - 1) // limit),
        }

    async def get_by_id(self, product_id: int) -> Optional[dict]:
        stmt = (
            select(Product)
            .options(selectinload(Product.category_rel))
            .where(Product.id == product_id)
        )
        product = (await self.db.execute(stmt)).scalar_one_or_none()
        if not product:
            return None

        related = []
        if product.category_id:
            rel_stmt = (
                select(Product)
                .where(and_(
                    Product.category_id == product.category_id,
                    Product.id != product.id,
                ))
                .limit(4)
            )
            related = [self._to_dict(p) for p in (await self.db.execute(rel_stmt)).scalars().all()]

        return {"product": self._to_dict(product), "related": related}

    async def search_suggestions(self, query: str, limit: int = 5) -> list:
        term = f"%{query.lower()}%"
        stmt = (
            select(Product.id, Product.name, Product.price, Product.images)
            .where(func.lower(Product.name).like(term))
            .limit(limit)
        )
        rows = (await self.db.execute(stmt)).all()
        return [
            {"id": r.id, "name": r.name, "price": float(r.price),
             "image": r.images[0] if r.images else ""}
            for r in rows
        ]

    async def create(self, data: dict) -> dict:
        product = Product(**data)
        self.db.add(product)
        await self.db.flush()
        await self.db.refresh(product)
        return self._to_dict(product)

    async def update(self, product_id: int, data: dict) -> Optional[dict]:
        stmt = select(Product).where(Product.id == product_id)
        product = (await self.db.execute(stmt)).scalar_one_or_none()
        if not product:
            return None
        for k, v in data.items():
            setattr(product, k, v)
        await self.db.flush()
        await self.db.refresh(product)
        return self._to_dict(product)

    async def delete(self, product_id: int) -> bool:
        stmt = select(Product).where(Product.id == product_id)
        product = (await self.db.execute(stmt)).scalar_one_or_none()
        if not product:
            return False
        await self.db.delete(product)
        return True

    @staticmethod
    def _to_dict(p: Product) -> dict:
        return {
            "id":             str(p.id),
            "name":           p.name,
            "slug":           p.slug,
            "price":          float(p.price),
            "original_price": float(p.original_price),
            "discount":       p.discount,
            "rating":         float(p.rating),
            "reviews":        p.reviews,
            "category":       p.category_rel.slug if p.category_rel else "",
            "brand":          p.brand,
            "description":    p.description,
            "images":         p.images or [],
            "colors":         p.colors or [],
            "sizes":          p.sizes or [],
            "tags":           p.tags or [],
            "stock":          p.stock,
            "featured":       p.featured,
        }