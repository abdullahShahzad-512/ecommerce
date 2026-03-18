import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../api';
import './ProductsPage.css';

const CATEGORIES = [
  { id: '', label: 'All Products' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'bags', label: 'Bags' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'home', label: 'Home & Living' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Biggest Discount' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'default';
  const search = searchParams.get('search') || '';
  const featured = searchParams.get('featured') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [priceRange, setPriceRange] = useState({ min: minPrice, max: maxPrice });

  const fetchProducts = useCallback(() => {
    setLoading(true);
    api.getProducts({
      category: category || undefined,
      sort: sort !== 'default' ? sort : undefined,
      search: search || undefined,
      featured: featured === 'true' ? true : undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      page,
      limit: 12,
    })
      .then(data => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, search, featured, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const applyPriceFilter = () => {
    const next = new URLSearchParams(searchParams);
    if (priceRange.min) next.set('min_price', priceRange.min);
    else next.delete('min_price');
    if (priceRange.max) next.set('max_price', priceRange.max);
    else next.delete('max_price');
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSearchParams({});
  };

  const activeFiltersCount = [category, sort !== 'default' ? sort : '', minPrice, maxPrice, featured].filter(Boolean).length;

  const SidebarContent = () => (
    <aside className="filters-sidebar">
      <div className="filters-header">
        <h3>Filters</h3>
        {activeFiltersCount > 0 && (
          <button className="filters-clear" onClick={clearFilters}>
            Clear all ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Category */}
      <div className="filter-group">
        <h4 className="filter-group__title">Category</h4>
        <ul className="filter-list">
          {CATEGORIES.map(cat => (
            <li key={cat.id}>
              <button
                className={`filter-option${category === cat.id ? ' active' : ''}`}
                onClick={() => updateParam('category', cat.id)}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <h4 className="filter-group__title">Price Range</h4>
        <div className="price-inputs">
          <div className="price-input-wrap">
            <span>$</span>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={e => setPriceRange(p => ({ ...p, min: e.target.value }))}
            />
          </div>
          <span className="price-dash">—</span>
          <div className="price-input-wrap">
            <span>$</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={e => setPriceRange(p => ({ ...p, max: e.target.value }))}
            />
          </div>
        </div>
        <button className="btn btn-outline btn-sm btn-full" onClick={applyPriceFilter}>
          Apply
        </button>
      </div>

      {/* Featured */}
      <div className="filter-group">
        <h4 className="filter-group__title">Collection</h4>
        <ul className="filter-list">
          <li>
            <button
              className={`filter-option${!featured ? ' active' : ''}`}
              onClick={() => updateParam('featured', '')}
            >All</button>
          </li>
          <li>
            <button
              className={`filter-option${featured === 'true' ? ' active' : ''}`}
              onClick={() => updateParam('featured', 'true')}
            >Featured Only</button>
          </li>
        </ul>
      </div>

      {/* Quick Price Presets */}
      <div className="filter-group">
        <h4 className="filter-group__title">Quick Price</h4>
        <div className="price-presets">
          {[['0','50','Under $50'], ['50','100','$50–$100'], ['100','200','$100–$200'], ['200','','Over $200']].map(([min, max, label]) => (
            <button
              key={label}
              className={`price-preset${minPrice === min && maxPrice === max ? ' active' : ''}`}
              onClick={() => {
                setPriceRange({ min, max });
                const next = new URLSearchParams(searchParams);
                if (min) next.set('min_price', min); else next.delete('min_price');
                if (max) next.set('max_price', max); else next.delete('max_price');
                next.delete('page');
                setSearchParams(next);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="products-page page-enter">
      {/* Breadcrumb */}
      <div className="breadcrumb-bar">
        <div className="container breadcrumb-bar__inner">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{category ? CATEGORIES.find(c => c.id === category)?.label : 'All Products'}</span>
            {search && <><span>/</span><span>"{search}"</span></>}
          </nav>
          <span className="products-count">{total} {total === 1 ? 'product' : 'products'}</span>
        </div>
      </div>

      <div className="container products-page__body">
        {/* Mobile filter toggle */}
        <div className="mobile-filter-bar">
          <button className="btn btn-outline btn-sm" onClick={() => setFiltersOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <select
            className="sort-select"
            value={sort}
            onChange={e => updateParam('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Mobile Drawer */}
        {filtersOpen && (
          <>
            <div className="filters-backdrop" onClick={() => setFiltersOpen(false)} />
            <div className="filters-drawer">
              <div className="filters-drawer__header">
                <h3>Filters</h3>
                <button onClick={() => setFiltersOpen(false)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="filters-drawer__body">
                <SidebarContent />
              </div>
              <div className="filters-drawer__footer">
                <button className="btn btn-primary btn-full" onClick={() => setFiltersOpen(false)}>
                  View {total} Results
                </button>
              </div>
            </div>
          </>
        )}

        {/* Desktop Sidebar */}
        <div className="sidebar-desktop">
          <SidebarContent />
        </div>

        {/* Products Area */}
        <div className="products-area">
          {/* Desktop Sort + Header */}
          <div className="products-area__header">
            <div>
              {search && (
                <p className="search-results-label">
                  Search results for <strong>"{search}"</strong>
                </p>
              )}
            </div>
            <div className="sort-row">
              <label htmlFor="sort-select" className="sort-label">Sort by:</label>
              <select
                id="sort-select"
                className="sort-select"
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="products-grid products-grid--3">
              {Array(12).fill(0).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ aspectRatio: '4/5', borderRadius: 12 }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    <div className="skeleton" style={{ height: 14, width: '80%' }} />
                    <div className="skeleton" style={{ height: 16, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="products-grid products-grid--3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => updateParam('page', String(page - 1))}
              >← Prev</button>
              <span className="pagination__info">Page {page}</span>
              <button
                className="btn btn-outline btn-sm"
                disabled={products.length < 12}
                onClick={() => updateParam('page', String(page + 1))}
              >Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
