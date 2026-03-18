from fastapi import APIRouter, HTTPException
from typing import Optional

router = APIRouter()

PRODUCTS_DB = [
    {
        "id": "1",
        "name": "Luxury Accent Chair",
        "price": 289.99,
        "original_price": 380.00,
        "discount": 24,
        "rating": 4.7,
        "reviews": 93,
        "category": "furniture",
        "brand": "ComfortCraft",
        "description": "A beautifully upholstered accent chair with solid wood legs and premium fabric. Adds an elegant touch to any living room or bedroom. Available in three colours.",
        "images": [
            "/src/assets/images/products/chair.png",
            "/src/assets/images/backgrounds/hero-living.png"
        ],
        "colors": ["beige", "charcoal", "navy"],
        "sizes": ["one-size"],
        "stock": 14,
        "tags": ["featured", "trending"],
        "featured": True
    },
    {
        "id": "2",
        "name": "Handcrafted Terracotta Pot",
        "price": 34.99,
        "original_price": 34.99,
        "discount": 0,
        "rating": 4.5,
        "reviews": 211,
        "category": "home-decor",
        "brand": "EarthForm",
        "description": "Traditional hand-thrown terracotta pot with lid. Perfect for dry storage, kitchen herbs or as a decorative piece on any shelf.",
        "images": [
            "/src/assets/images/products/pot.png"
        ],
        "colors": ["terracotta"],
        "sizes": ["small", "medium", "large"],
        "stock": 60,
        "tags": ["new"],
        "featured": True
    },
    {
        "id": "3",
        "name": "Textured Ceramic Table Lamp",
        "price": 119.99,
        "original_price": 150.00,
        "discount": 20,
        "rating": 4.6,
        "reviews": 78,
        "category": "lighting",
        "brand": "LuxGlow",
        "description": "Stunning textured ceramic base table lamp with a linen drum shade. Warm ambient light ideal for bedside or living room tables.",
        "images": [
            "/src/assets/images/products/lamp.png"
        ],
        "colors": ["sand", "charcoal", "white"],
        "sizes": ["one-size"],
        "stock": 22,
        "tags": ["bestseller"],
        "featured": True
    },
    {
        "id": "4",
        "name": "Leather Magazine Rack",
        "price": 74.99,
        "original_price": 95.00,
        "discount": 21,
        "rating": 4.4,
        "reviews": 55,
        "category": "home-decor",
        "brand": "Maison Carry",
        "description": "Minimalist magazine and book rack in tan leather with brass wire frame. Freestanding, holds up to 8 magazines or books elegantly.",
        "images": [
            "/src/assets/images/products/magazine-rack.png"
        ],
        "colors": ["tan", "black"],
        "sizes": ["one-size"],
        "stock": 30,
        "tags": ["trending"],
        "featured": True
    },
    {
        "id": "5",
        "name": "Tassimo Coffee Machine",
        "price": 149.99,
        "original_price": 199.99,
        "discount": 25,
        "rating": 4.8,
        "reviews": 334,
        "category": "electronics",
        "brand": "Bosch",
        "description": "Compact pod coffee machine with Intellibrew technology. Makes espresso, cappuccino, latte and more at the touch of a button. Easy clean.",
        "images": [
            "/src/assets/images/products/coffee-machine.png"
        ],
        "colors": ["white", "black"],
        "sizes": ["one-size"],
        "stock": 45,
        "tags": ["bestseller", "trending"],
        "featured": True
    },
    {
        "id": "6",
        "name": "Cold Press Juicer",
        "price": 199.99,
        "original_price": 249.99,
        "discount": 20,
        "rating": 4.6,
        "reviews": 128,
        "category": "electronics",
        "brand": "NutriPress",
        "description": "Slow masticating juicer that extracts maximum nutrients. Quiet motor, reverse function, easy to clean — includes pulp container.",
        "images": [
            "/src/assets/images/products/juicer.png"
        ],
        "colors": ["silver", "white"],
        "sizes": ["one-size"],
        "stock": 27,
        "tags": ["new"],
        "featured": True
    },
    {
        "id": "7",
        "name": "Indoor Dracaena Plant",
        "price": 49.99,
        "original_price": 49.99,
        "discount": 0,
        "rating": 4.3,
        "reviews": 87,
        "category": "plants",
        "brand": "GreenLife",
        "description": "Low-maintenance Dracaena Marginata in a premium taupe square planter. Height approx 90cm. Air purifying and perfect for any interior.",
        "images": [
            "/src/assets/images/products/plant.png"
        ],
        "colors": ["taupe-pot", "white-pot"],
        "sizes": ["one-size"],
        "stock": 18,
        "tags": ["new", "trending"],
        "featured": True
    },
    {
        "id": "8",
        "name": "Pro Wireless Headphones",
        "price": 299.99,
        "original_price": 379.99,
        "discount": 21,
        "rating": 4.9,
        "reviews": 512,
        "category": "electronics",
        "brand": "SonicPure",
        "description": "Industry-leading active noise cancellation, 30-hour battery life and premium memory foam ear cushions. Works wired or wireless.",
        "images": [
            "/src/assets/images/backgrounds/hero-banner.png"
        ],
        "colors": ["black", "silver"],
        "sizes": ["one-size"],
        "stock": 33,
        "tags": ["bestseller"],
        "featured": True
    }
]


@router.get("/")
def get_products(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "default",
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 8
):
    products = list(PRODUCTS_DB)

    if category:
        products = [p for p in products if p["category"] == category]
    if min_price is not None:
        products = [p for p in products if p["price"] >= min_price]
    if max_price is not None:
        products = [p for p in products if p["price"] <= max_price]
    if featured is not None:
        products = [p for p in products if p["featured"] == featured]
    if search:
        s = search.lower()
        products = [p for p in products if s in p["name"].lower() or s in p["description"].lower()]

    if sort == "price-asc":
        products.sort(key=lambda x: x["price"])
    elif sort == "price-desc":
        products.sort(key=lambda x: x["price"], reverse=True)
    elif sort == "rating":
        products.sort(key=lambda x: x["rating"], reverse=True)
    elif sort == "discount":
        products.sort(key=lambda x: x["discount"], reverse=True)

    total = len(products)
    start = (page - 1) * limit
    paginated = products[start:start + limit]

    return {
        "products": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit
    }


@router.get("/{product_id}")
def get_product(product_id: str):
    product = next((p for p in PRODUCTS_DB if p["id"] == product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    related = [p for p in PRODUCTS_DB if p["category"] == product["category"] and p["id"] != product_id][:4]
    return {"product": product, "related": related}