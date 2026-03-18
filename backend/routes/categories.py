from fastapi import APIRouter

router = APIRouter()

CATEGORIES = [
    {
        "id": "furniture",
        "name": "Furniture",
        "count": 1,
        "image": "/src/assets/images/backgrounds/hero-living.png"
    },
    {
        "id": "electronics",
        "name": "Electronics",
        "count": 3,
        "image": "/src/assets/images/backgrounds/hero-electronics.png"
    },
    {
        "id": "home-decor",
        "name": "Home Decor",
        "count": 2,
        "image": "/src/assets/images/backgrounds/promo-colors.png"
    },
    {
        "id": "lighting",
        "name": "Lighting",
        "count": 1,
        "image": "/src/assets/images/products/lamp.png"
    },
    {
        "id": "plants",
        "name": "Plants",
        "count": 1,
        "image": "/src/assets/images/products/plant.png"
    },
]

@router.get("/")
def get_categories():
    return {"categories": CATEGORIES}