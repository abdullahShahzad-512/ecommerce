"""
routes/admin.py — /api/admin/* — Admin-only actions (add/edit/delete products)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db, ProductRepository, CategoryRepository, UserRepository
from database.models import User, Category
from auth.dependencies import require_admin

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name:           str
    price:          float
    original_price: Optional[float] = None
    brand:          str
    description:    str
    category_slug:  str
    stock:          int = 0
    featured:       bool = False
    colors:         List[str] = []
    sizes:          List[str] = ["one-size"]
    tags:           List[str] = []
    images:         List[str] = []

    @field_validator("price", "stock")
    @classmethod
    def must_be_positive(cls, v):
        if v < 0:
            raise ValueError("Must be a positive number")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class ProductUpdate(BaseModel):
    name:           Optional[str]   = None
    price:          Optional[float] = None
    original_price: Optional[float] = None
    brand:          Optional[str]   = None
    description:    Optional[str]   = None
    category_slug:  Optional[str]   = None
    stock:          Optional[int]   = None
    featured:       Optional[bool]  = None
    colors:         Optional[List[str]] = None
    sizes:          Optional[List[str]] = None
    tags:           Optional[List[str]] = None
    images:         Optional[List[str]] = None


# ── Product CRUD ──────────────────────────────────────────────────────────────

@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(
    body: ProductCreate,
    db:   AsyncSession   = Depends(get_db),
    _:    User           = Depends(require_admin),
):
    # resolve category
    cat_result = await db.execute(
        select(Category).where(Category.slug == body.category_slug)
    )
    category = cat_result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=400, detail=f"Category '{body.category_slug}' not found")

    # auto-calc discount
    orig = body.original_price or body.price
    discount = round(max(0, (orig - body.price) / orig * 100)) if orig > body.price else 0

    # build slug
    slug = body.name.lower().replace(" ", "-").replace("&", "and")
    # ensure uniqueness
    existing = await db.execute(
        select(Category).where(Category.slug == slug)  # using products table slug check below
    )
    from database.models import Product
    slug_check = await db.execute(
        select(Product).where(Product.slug == slug)
    )
    if slug_check.scalar_one_or_none():
        slug = f"{slug}-{category.id}"

    repo = ProductRepository(db)
    product = await repo.create({
        "name":           body.name,
        "slug":           slug,
        "price":          body.price,
        "original_price": orig,
        "discount":       discount,
        "brand":          body.brand,
        "description":    body.description,
        "category_id":    category.id,
        "stock":          body.stock,
        "featured":       body.featured,
        "colors":         body.colors or ["default"],
        "sizes":          body.sizes,
        "tags":           body.tags,
        "images":         body.images,
        "rating":         0.0,
        "reviews":        0,
    })
    await db.commit()
    return {"message": "Product created", "product": product}


@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    body:       ProductUpdate,
    db:         AsyncSession = Depends(get_db),
    _:          User         = Depends(require_admin),
):
    update_data = body.model_dump(exclude_none=True)

    # resolve category if provided
    if "category_slug" in update_data:
        cat_result = await db.execute(
            select(Category).where(Category.slug == update_data.pop("category_slug"))
        )
        category = cat_result.scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
        update_data["category_id"] = category.id

    # recalculate discount if price changed
    if "price" in update_data or "original_price" in update_data:
        repo = ProductRepository(db)
        existing = await repo.get_by_id(product_id)
        if existing:
            price = update_data.get("price", existing["product"]["price"])
            orig  = update_data.get("original_price", existing["product"]["original_price"])
            update_data["discount"] = round(max(0, (orig - price) / orig * 100)) if orig > price else 0

    repo = ProductRepository(db)
    product = await repo.update(product_id, update_data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.commit()
    return {"message": "Product updated", "product": product}


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db:         AsyncSession = Depends(get_db),
    _:          User         = Depends(require_admin),
):
    repo = ProductRepository(db)
    deleted = await repo.delete(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.commit()


# ── User management ───────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _:  User         = Depends(require_admin),
):
    from sqlalchemy import select
    from database.models import User as UserModel
    result = await db.execute(select(UserModel).order_by(UserModel.created_at.desc()))
    users = result.scalars().all()
    return {"users": [UserRepository.to_dict(u) for u in users]}


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role:    str,
    db:      AsyncSession = Depends(get_db),
    admin:   User         = Depends(require_admin),
):
    if role not in ("customer", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'customer' or 'admin'")
    # prevent logged-in admin from demoting themselves and losing access
    if admin.id == user_id and role != "admin":
        raise HTTPException(status_code=400, detail="You cannot change your own role to customer.")
    repo = UserRepository(db)
    user = await repo.update_role(user_id, role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await db.commit()
    return {"message": f"Role updated to {role}", "user": UserRepository.to_dict(user)}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db:      AsyncSession = Depends(get_db),
    admin:   User         = Depends(require_admin),
):
    # prevent self-delete to avoid locking out the admin session
    if admin.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")

    repo = UserRepository(db)
    deleted = await repo.delete(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    await db.commit()
