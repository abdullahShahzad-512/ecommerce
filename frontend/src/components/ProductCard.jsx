import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../CartContext';
import './ProductCard.css';

const COLOR_MAP = {
  white: '#FFFFFF', black: '#1A1714', beige: '#F5E6D3', brown: '#8B5E3C',
  navy: '#1B2A4A', sand: '#C4A882', slate: '#6B7280', forest: '#2D5A27',
  camel: '#C19A6B', burgundy: '#800020', khaki: '#C3B091', olive: '#6B7645',
  charcoal: '#3A3A3A', red: '#D94535', silver: '#C0C0C0', tan: '#C19A6B',
  'midnight-blue': '#1F2B52', 'matte-white': '#F5F5F0', terracotta: '#C4714B',
  'taupe-pot': '#8B7355', 'white-pot': '#F0EDE8', 'one-size': '#E5E0D8',
};

function StarRating({ rating }) {
  return (
    <div className="stars" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* Resolve image src — local /src/assets paths need the Vite base */
function resolveImg(src) {
  if (!src) return '';
  /* already absolute URL */
  if (src.startsWith('http')) return src;
  /* local asset path served by Vite dev server */
  return src;
}

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: resolveImg(product.images[0]),
        selectedColor: product.colors[0],
        selectedSize: product.sizes[0],
      }
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    setWishlisted(w => !w);
  };

  const img1 = resolveImg(product.images[0]);
  const img2 = product.images[1] ? resolveImg(product.images[1]) : null;

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__image-wrap">
        <img src={img1} alt={product.name} className="product-card__image" loading="lazy" />
        {img2 && (
          <img src={img2} alt={product.name}
            className="product-card__image product-card__image--hover" loading="lazy" />
        )}

        {/* Badges */}
        <div className="product-card__badges">
          {product.tags.includes('new') && <span className="badge badge-new">New</span>}
          {product.discount > 0 && <span className="badge badge-accent">-{product.discount}%</span>}
          {product.tags.includes('bestseller') && <span className="badge badge-success">Bestseller</span>}
        </div>

        {/* Wishlist */}
        <button
          className={`product-card__wishlist${wishlisted ? ' wishlisted' : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Quick Add */}
        <button
          className={`product-card__quick-add${addedFeedback ? ' added' : ''}`}
          onClick={handleAddToCart}
        >
          {addedFeedback ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Quick Add
            </>
          )}
        </button>
      </div>

      <div className="product-card__info">
        <div className="product-card__meta">
          <span className="product-card__brand">{product.brand}</span>
          <div className="product-card__rating">
            <StarRating rating={product.rating} />
            <span className="product-card__reviews">({product.reviews})</span>
          </div>
        </div>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price-row">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="product-card__original">${product.original_price.toFixed(2)}</span>
          )}
        </div>
        {product.colors.length > 1 && (
          <div className="product-card__colors">
            {product.colors.slice(0, 5).map(color => (
              <span key={color} className="product-card__swatch"
                style={{ background: COLOR_MAP[color] || '#ccc' }} title={color} />
            ))}
            {product.colors.length > 5 && (
              <span className="product-card__swatch-more">+{product.colors.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}