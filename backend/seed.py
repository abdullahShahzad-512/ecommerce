"""
seed.py
Run once to populate the database with sample categories and products.

Usage:
    cd backend
    python seed.py
"""
import asyncio
import sys
from sqlalchemy import text
from database.connection import engine, AsyncSessionLocal
from database.models import Base, Category, Product, User
from auth.utils import hash_password


# ── Sample data ──────────────────────────────────────────────────────────────

CATEGORIES = [
    {"slug": "furniture",   "name": "Furniture",   "image_url": "/src/assets/images/backgrounds/hero-living.png"},
    {"slug": "electronics", "name": "Electronics", "image_url": "/src/assets/images/backgrounds/hero-electronics.png"},
    {"slug": "home-decor",  "name": "Home Décor",  "image_url": "/src/assets/images/backgrounds/promo-colors.png"},
    {"slug": "lighting",    "name": "Lighting",    "image_url": "/src/assets/images/products/lamp.png"},
    {"slug": "plants",      "name": "Plants",      "image_url": "/src/assets/images/products/plant.png"},
]

PRODUCTS = [
    {
        "name":           "Luxury Accent Chair",
        "price":          289.99,
        "original_price": 380.00,
        "discount":       24,
        "rating":         4.7,
        "reviews":        93,
        "category_slug":  "furniture",
        "brand":          "ComfortCraft",
        "description":    "A beautifully upholstered accent chair with solid wood legs and premium fabric. Adds an elegant touch to any living room or bedroom. Available in three colours.",
        "images":  ["/src/assets/images/products/chair.png",
                    "/src/assets/images/backgrounds/hero-living.png"],
        "colors":  ["beige", "charcoal", "navy"],
        "sizes":   ["one-size"],
        "tags":    ["featured", "trending"],
        "stock":   14,
        "featured": True,
    },
    {
        "name":           "Handcrafted Terracotta Pot",
        "price":          34.99,
        "original_price": 34.99,
        "discount":       0,
        "rating":         4.5,
        "reviews":        211,
        "category_slug":  "home-decor",
        "brand":          "EarthForm",
        "description":    "Traditional hand-thrown terracotta pot with lid. Perfect for dry storage, kitchen herbs, or as a decorative piece on any shelf.",
        "images":  ["/src/assets/images/products/pot.png"],
        "colors":  ["terracotta"],
        "sizes":   ["small", "medium", "large"],
        "tags":    ["new"],
        "stock":   60,
        "featured": True,
    },
    {
        "name":           "Textured Ceramic Table Lamp",
        "price":          119.99,
        "original_price": 150.00,
        "discount":       20,
        "rating":         4.6,
        "reviews":        78,
        "category_slug":  "lighting",
        "brand":          "LuxGlow",
        "description":    "Stunning textured ceramic base table lamp with a linen drum shade. Warm ambient light ideal for bedside or living room tables.",
        "images":  ["/src/assets/images/products/lamp.png"],
        "colors":  ["sand", "charcoal", "white"],
        "sizes":   ["one-size"],
        "tags":    ["bestseller"],
        "stock":   22,
        "featured": True,
    },
    {
        "name":           "Leather Magazine Rack",
        "price":          74.99,
        "original_price": 95.00,
        "discount":       21,
        "rating":         4.4,
        "reviews":        55,
        "category_slug":  "home-decor",
        "brand":          "Maison Carry",
        "description":    "Minimalist magazine and book rack in tan leather with brass wire frame. Freestanding, holds up to 8 magazines or books elegantly.",
        "images":  ["/src/assets/images/products/magazine-rack.png"],
        "colors":  ["tan", "black"],
        "sizes":   ["one-size"],
        "tags":    ["trending"],
        "stock":   30,
        "featured": True,
    },
    {
        "name":           "Tassimo Coffee Machine",
        "price":          149.99,
        "original_price": 199.99,
        "discount":       25,
        "rating":         4.8,
        "reviews":        334,
        "category_slug":  "electronics",
        "brand":          "Bosch",
        "description":    "Compact pod coffee machine with Intellibrew technology. Makes espresso, cappuccino, latte and more at the touch of a button. Easy to clean.",
        "images":  ["/src/assets/images/products/coffee-machine.png"],
        "colors":  ["white", "black"],
        "sizes":   ["one-size"],
        "tags":    ["bestseller", "trending"],
        "stock":   45,
        "featured": True,
    },
    {
        "name":           "Cold Press Juicer",
        "price":          199.99,
        "original_price": 249.99,
        "discount":       20,
        "rating":         4.6,
        "reviews":        128,
        "category_slug":  "electronics",
        "brand":          "NutriPress",
        "description":    "Slow masticating juicer that extracts maximum nutrients. Quiet motor, reverse function, easy to clean — includes pulp container.",
        "images":  ["/src/assets/images/products/juicer.png"],
        "colors":  ["silver", "white"],
        "sizes":   ["one-size"],
        "tags":    ["new"],
        "stock":   27,
        "featured": True,
    },
    {
        "name":           "Indoor Dracaena Plant",
        "price":          49.99,
        "original_price": 49.99,
        "discount":       0,
        "rating":         4.3,
        "reviews":        87,
        "category_slug":  "plants",
        "brand":          "GreenLife",
        "description":    "Low-maintenance Dracaena Marginata in a premium taupe square planter. Height approx 90 cm. Air purifying and perfect for any interior.",
        "images":  ["/src/assets/images/products/plant.png"],
        "colors":  ["taupe-pot", "white-pot"],
        "sizes":   ["one-size"],
        "tags":    ["new", "trending"],
        "stock":   18,
        "featured": True,
    },
    {
        "name":           "Pro Wireless Headphones",
        "price":          299.99,
        "original_price": 379.99,
        "discount":       21,
        "rating":         4.9,
        "reviews":        512,
        "category_slug":  "electronics",
        "brand":          "SonicPure",
        "description":    "Industry-leading active noise cancellation, 30-hour battery life and premium memory foam ear cushions. Works wired or wireless.",
        "images":  ["/src/assets/images/backgrounds/hero-banner.png"],
        "colors":  ["black", "silver"],
        "sizes":   ["one-size"],
        "tags":    ["bestseller"],
        "stock":   33,
        "featured": True,
    },
]

DEMO_USERS = [

    {
        "email": "superadmin@shopr.com",
        "username": "superadmin",
        "full_name": "Super Admin",
        "password": "superadmin1234",
        "role": "admin",
    },
    {
        "email": "user@shopr.com",
        "username": "user",
        "full_name": "Demo Customer",
        "password": "user1234",
        "role": "customer",
    },
]


# ── Seeder ───────────────────────────────────────────────────────────────────

async def seed_users(db):
    print("👤  Seeding users …")
    for u_data in DEMO_USERS:
        existing = await db.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": u_data["email"]},
        )
        if existing.fetchone():
            print(f"   ↩  User '{u_data['email']}' already exists — skipped")
            continue

        user = User(
            email=u_data["email"],
            username=u_data["username"],
            full_name=u_data["full_name"],
            hashed_password=hash_password(u_data["password"]),
            role=u_data["role"],
            is_active=True,
        )
        db.add(user)
        await db.flush()
        print(f"   ✅  User '{user.email}' inserted (id={user.id})")


async def seed(seed_only_users: bool = False):
    print("⏳  Creating tables …")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        if seed_only_users:
            await seed_users(db)
            await db.commit()
            print("\n✨  User seeding complete!")
            await engine.dispose()
            return

        # ── Categories ──
        print("🌱  Seeding categories …")
        cat_map: dict[str, int] = {}
        for cat_data in CATEGORIES:
            existing = await db.execute(
                text("SELECT id FROM categories WHERE slug = :slug"),
                {"slug": cat_data["slug"]}
            )
            row = existing.fetchone()
            if row:
                cat_map[cat_data["slug"]] = row[0]
                print(f"   ↩  Category '{cat_data['slug']}' already exists — skipped")
                continue

            cat = Category(**cat_data)
            db.add(cat)
            await db.flush()
            cat_map[cat_data["slug"]] = cat.id
            print(f"   ✅  Category '{cat_data['slug']}' inserted (id={cat.id})")

        # ── Products ──
        print("🛍   Seeding products …")
        for p_data in PRODUCTS:
            slug = p_data["name"].lower().replace(" ", "-").replace("&", "and")

            existing = await db.execute(
                text("SELECT id FROM products WHERE slug = :slug"),
                {"slug": slug}
            )
            if existing.fetchone():
                print(f"   ↩  Product '{p_data['name']}' already exists — skipped")
                continue

            category_slug = p_data.pop("category_slug")
            product = Product(
                **p_data,
                slug=slug,
                category_id=cat_map.get(category_slug),
            )
            db.add(product)
            await db.flush()
            print(f"   ✅  Product '{product.name}' inserted (id={product.id})")

        await seed_users(db)
        await db.commit()

    print("\n✨  Seeding complete!")
    await engine.dispose()


if __name__ == "__main__":
    users_only = len(sys.argv) > 1 and sys.argv[1].lower() == "users"
    asyncio.run(seed(seed_only_users=users_only))