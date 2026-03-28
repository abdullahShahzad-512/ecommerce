"""
routes/products.py
Dynamic product endpoints — all data from PostgreSQL.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, ProductRepository

router = APIRouter()


def get_repo(db: AsyncSession = Depends(get_db)) -> ProductRepository:
    return ProductRepository(db)


# ── GET /api/products  ── list / search / filter ──────────────────────────────
@router.get("/")
async def get_products(
    category:  Optional[str]   = Query(None, description="Category slug"),
    search:    Optional[str]   = Query(None, description="Search term"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort:      str             = Query("default", enum=["default","price-asc","price-desc","rating","discount","newest"]),
    featured:  Optional[bool]  = Query(None),
    page:      int             = Query(1, ge=1),
    limit:     int             = Query(12, ge=1, le=48),
    repo: ProductRepository    = Depends(get_repo),
):
    return await repo.get_all(
        category_slug=category,
        search=search,
        min_price=min_price,
        max_price=max_price,
        featured=featured,
        sort=sort,
        page=page,
        limit=limit,
    )


# ── GET /api/products/search/suggestions  ── live search ─────────────────────
@router.get("/search/suggestions")
async def search_suggestions(
    q:    str = Query(..., min_length=2),
    repo: ProductRepository = Depends(get_repo),
):
    suggestions = await repo.search_suggestions(q)
    return {"suggestions": suggestions}


# ── GET /api/products/{id}  ── single product + related ──────────────────────
@router.get("/{product_id}")
async def get_product(
    product_id: int,
    repo: ProductRepository = Depends(get_repo),
):
    data = await repo.get_by_id(product_id)
    if not data:
        raise HTTPException(status_code=404, detail="Product not found")
    return data