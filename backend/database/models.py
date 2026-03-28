"""
database/models.py
SQLAlchemy ORM table definitions.
"""
from __future__ import annotations
import enum
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    String, Text, Numeric, Integer, Boolean,
    ForeignKey, JSON, DateTime, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database.connection import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id:              Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    email:           Mapped[str]      = mapped_column(String(320), unique=True, nullable=False, index=True)
    username:        Mapped[str]      = mapped_column(String(64), unique=True, nullable=False, index=True)
    full_name:       Mapped[str]      = mapped_column(String(120), nullable=False)
    hashed_password: Mapped[str]      = mapped_column(String(255), nullable=False)
    role:            Mapped[UserRole] = mapped_column(String(20), default=UserRole.customer.value, nullable=False)
    is_active:       Mapped[bool]     = mapped_column(Boolean, default=True, nullable=False)
    created_at:      Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:      Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class Category(Base):
    __tablename__ = "categories"

    id:          Mapped[int]           = mapped_column(Integer, primary_key=True, autoincrement=True)
    slug:        Mapped[str]           = mapped_column(String(80),  unique=True, nullable=False)
    name:        Mapped[str]           = mapped_column(String(120), nullable=False)
    image_url:   Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at:  Mapped[datetime]      = mapped_column(DateTime(timezone=True), server_default=func.now())

    # relationships
    products: Mapped[List["Product"]] = relationship("Product", back_populates="category_rel")

    def __repr__(self) -> str:
        return f"<Category {self.slug}>"


class Product(Base):
    __tablename__ = "products"

    id:             Mapped[int]            = mapped_column(Integer, primary_key=True, autoincrement=True)
    name:           Mapped[str]            = mapped_column(String(200), nullable=False)
    slug:           Mapped[str]            = mapped_column(String(220), unique=True, nullable=False)
    price:          Mapped[float]          = mapped_column(Numeric(10, 2), nullable=False)
    original_price: Mapped[float]          = mapped_column(Numeric(10, 2), nullable=False)
    discount:       Mapped[int]            = mapped_column(Integer, default=0)
    rating:         Mapped[float]          = mapped_column(Numeric(3, 1), default=0.0)
    reviews:        Mapped[int]            = mapped_column(Integer, default=0)
    brand:          Mapped[str]            = mapped_column(String(120), nullable=False)
    description:    Mapped[str]            = mapped_column(Text, nullable=False)
    stock:          Mapped[int]            = mapped_column(Integer, default=0)
    featured:       Mapped[bool]           = mapped_column(Boolean, default=False)

    # Stored as JSON arrays for cross-database compatibility.
    images:  Mapped[List[str]] = mapped_column(JSON, default=list)
    colors:  Mapped[List[str]] = mapped_column(JSON, default=list)
    sizes:   Mapped[List[str]] = mapped_column(JSON, default=list)
    tags:    Mapped[List[str]] = mapped_column(JSON, default=list)

    # FK to categories
    category_id:  Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    category_rel: Mapped[Optional["Category"]] = relationship("Category", back_populates="products")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def __repr__(self) -> str:
        return f"<Product {self.name} ${self.price}>"