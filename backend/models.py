from pydantic import BaseModel
from typing import List, Optional

class Product(BaseModel):
    id: str
    name: str
    price: float
    original_price: float
    discount: int
    rating: float
    reviews: int
    category: str
    brand: str
    description: str
    images: List[str]
    colors: List[str]
    sizes: List[str]
    stock: int
    tags: List[str]
    featured: bool

class ProductList(BaseModel):
    products: List[Product]
    total: int
    page: int
    limit: int
    pages: int