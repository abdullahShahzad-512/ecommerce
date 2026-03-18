import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../api';
import { useCart } from '../CartContext';
import './ProductDetailPage.css';

function StarRating({ rating, reviews }) {
  return (
    <div className="detail-rating">
      <div className="stars">
        {[1, 2, 3, 4, 5].map(s => (
          <svg key={s} width="16" height="16" viewBox="0 0 24 24"
            fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2" style={{ color: '#F5A623' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        ))}
      </div>
      <span className="detail-rating__score">{rating}</span>
      <span className="detail-rating__count">({reviews} reviews)</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    setLoading(true);
    setError(false);
    setActiveImage(0);
    window.scrollTo(0, 0);

    api.getProduct(id)
      .then(d => {
        setData(d);
        setSelectedColor(d.product.colors[0] || '');
        setSelectedSize(d.product.sizes[0] || '');
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    dispatch({
      type: 'ADD_ITEM',
      item: {
        id: data.product.id,
        name: data.product.name,
        price: data.product.price,
        image: data.product.images[0],
        selectedColor,
        selectedSize,
      }
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const COLOR_MAP = {
    white: '#FFFFFF', black: '#1A1714', beige: '#F5E6D3', brown: '#8B5E3C',
    navy: '#1B2A4A', sand: '#C4A882', slate: '#6B7280', forest: '#2D5A27',
    camel: '#C19A6B', burgundy: '#800020', khaki: '#C3B091', olive: '#6B7645',
    charcoal: '#3A3A3A', red: '#D94535', silver: '#C0C0C0', 'midnight-blue': '#1F2B52',
    'matte-white': '#F5F5F0', terracotta: '#C4714B',
  };

  if (loading) return (
    <div className="container detail-loading page-enter">
      <div className="detail-skeleton">
        <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 8 }}>
          <div className="skeleton" style={{ height: 14, width: '40%' }} />
          <div className="skeleton" style={{ height: 28, width: '85%' }} />
          <div className="skeleton" style={{ height: 24, width: '30%' }} />
          <div className="skeleton" style={{ height: 14, width: '70%', marginTop: 16 }} />
          <div className="skeleton" style={{ height: 14, width: '60%' }} />
          <div className="skeleton" style={{ height: 14, width: '75%' }} />
        </div>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="container detail-error page-enter">
      <div className="empty-state">
        <div className="empty-state__icon">😕</div>
        <h3>Product not found</h3>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Back to Shop
        </button>
      </div>
    </div>
  );

  const { product, related } = data;

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container breadcrumb-bar__inner">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/products">Shop</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category}`}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container detail-page">
        {/* ---- Images ---- */}
        <div className="detail-images">
          <div className="detail-thumbnails">
            {product.images.map((img, i) => (
              <button
                key={i}
                className={`detail-thumb${activeImage === i ? ' active' : ''}`}
                onClick={() => setActiveImage(i)}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} />
              </button>
            ))}
          </div>

          <div className="detail-main-image">
            <img
              src={product.images[activeImage]}
              alt={product.name}
            />
            <div className="detail-badges">
              {product.tags.includes('new') && <span className="badge badge-new">New</span>}
              {product.discount > 0 && <span className="badge badge-accent">-{product.discount}%</span>}
              {product.tags.includes('bestseller') && <span className="badge badge-success">Bestseller</span>}
            </div>
          </div>
        </div>

        {/* ---- Info ---- */}
        <div className="detail-info">
          <div className="detail-meta">
            <span className="detail-brand">{product.brand}</span>
            <span className={`detail-stock ${product.stock < 10 ? 'low' : 'in'}`}>
              {product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
            </span>
          </div>

          <h1 className="detail-name heading-1">{product.name}</h1>

          <StarRating rating={product.rating} reviews={product.reviews} />

          <div className="detail-price">
            <span className="detail-price__current">${product.price.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="detail-price__original">${product.original_price.toFixed(2)}</span>
                <span className="badge badge-sale">Save {product.discount}%</span>
              </>
            )}
          </div>

          <p className="detail-desc">{product.description}</p>

          <hr className="divider" />

          {/* Color Selector */}
          <div className="detail-option-group">
            <label className="detail-option-label">
              Color: <strong>{selectedColor}</strong>
            </label>
            <div className="color-swatches">
              {product.colors.map(color => (
                <button
                  key={color}
                  className={`color-swatch${selectedColor === color ? ' active' : ''}`}
                  style={{ background: COLOR_MAP[color] || '#ccc' }}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  aria-label={`Color: ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes[0] !== 'one-size' && (
            <div className="detail-option-group">
              <label className="detail-option-label">
                Size: <strong>{selectedSize}</strong>
              </label>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-option${selectedSize === size ? ' active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add to Cart */}
          <div className="detail-actions">
            <div className="qty-selector">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >−</button>
              <span>{qty}</span>
              <button
                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                aria-label="Increase quantity"
              >+</button>
            </div>
            <button
              className={`btn btn-primary btn-lg detail-add-btn${added ? ' added' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Added to Cart!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
            <button className="btn btn-outline detail-wishlist-btn" aria-label="Add to wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>

          {/* Trust badges */}
          <div className="detail-trust">
            {[
              { icon: '🚚', text: 'Free shipping over $75' },
              { icon: '↩️', text: '30-day free returns' },
              { icon: '🔒', text: 'Secure checkout' },
            ].map(t => (
              <div key={t.text} className="detail-trust__item">
                <span>{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---- Tabs ---- */}
      <div className="container detail-tabs-section">
        <div className="detail-tabs">
          {['description', 'details', 'reviews'].map(t => (
            <button
              key={t}
              className={`detail-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'reviews' && ` (${product.reviews})`}
            </button>
          ))}
        </div>
        <div className="detail-tab-content">
          {tab === 'description' && (
            <p>{product.description}</p>
          )}
          {tab === 'details' && (
            <table className="detail-table">
              <tbody>
                <tr><td>Brand</td><td>{product.brand}</td></tr>
                <tr><td>Category</td><td>{product.category}</td></tr>
                <tr><td>Available Colors</td><td>{product.colors.join(', ')}</td></tr>
                <tr><td>Available Sizes</td><td>{product.sizes.join(', ')}</td></tr>
                <tr><td>Stock</td><td>{product.stock} units</td></tr>
                <tr><td>Rating</td><td>{product.rating}/5 from {product.reviews} reviews</td></tr>
              </tbody>
            </table>
          )}
          {tab === 'reviews' && (
            <div className="detail-reviews-placeholder">
              <div className="reviews-summary">
                <span className="reviews-score">{product.rating}</span>
                <div>
                  <StarRating rating={product.rating} reviews={product.reviews} />
                  <p>Based on {product.reviews} reviews</p>
                </div>
              </div>
              <p style={{ color: 'var(--color-ink-3)', fontStyle: 'italic' }}>
                Review details would load from the backend in the full implementation.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Related Products ---- */}
      {related?.length > 0 && (
        <section className="section container">
          <div className="section__header">
            <div>
              <span className="label section__eyebrow">You Might Like</span>
              <h2 className="display-2">Related Products</h2>
            </div>
          </div>
          <div className="products-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
