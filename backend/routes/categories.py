from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, CategoryRepository

router = APIRouter()


@router.get("/")
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Public categories list, backed by the database."""
    repo = CategoryRepository(db)
    categories = await repo.get_all()
    return {"categories": categories}


class CategoryCreate(BaseModel):
    name: str
    slug: str | None = None
    image: str | None = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Name is required")
        return v.strip()

    @field_validator("slug")
    @classmethod
    def slug_from_name(cls, v: str | None, info):
        # If slug not provided, derive from name
        if v is None:
            name = str(info.data.get("name", "")).strip().lower()
            return name.replace(" ", "-").replace("&", "and")
        return v.strip().lower()


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new category.

    NOTE: Auth is intentionally not enforced here to keep the
    demo admin panel simple; in a real app you'd protect this
    with require_admin.
    """
    repo = CategoryRepository(db)
    existing = await repo.get_by_slug(body.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")

    category = await repo.create(name=body.name, slug=body.slug, image_url=body.image)
    await db.commit()
    return {"category": category}