from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/cart",
    tags=["cart"]
)

class CartItem(BaseModel):
    product_id: str
    quantity: int
    color: str = ""
    size: str = ""

class CartRequest(BaseModel):
    items: List[CartItem]

@router.post("/calculate")
def calculate_cart(cart: CartRequest):
    """Calculate cart totals - in production, this would validate against the DB"""
    return {
        "item_count": sum(item.quantity for item in cart.items),
        "subtotal": 0,  # Frontend calculates with product data
        "shipping": 9.99,
        "free_shipping_threshold": 75.00,
        "message": "Cart calculated successfully"
    }