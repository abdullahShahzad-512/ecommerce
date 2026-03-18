import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../api';
import './HomePage.css';

import heroBanner     from '../assets/images/backgrounds/hero-banner.png';
import heroLiving     from '../assets/images/backgrounds/hero-living.png';
import heroElec       from '../assets/images/backgrounds/hero-electronics.png';
import promoBoxes     from '../assets/images/backgrounds/promo-boxes.png';
import promoShipping  from '../assets/images/backgrounds/promo-shipping.png';
import promoWarehouse from '../assets/images/backgrounds/promo-warehouse.png';
import promoColors    from '../assets/images/backgrounds/promo-colors.png';
import imgChair       from '../assets/images/products/chair.png';
import imgLamp        from '../assets/images/products/lamp.png';
import imgCoffee      from '../assets/images/products/coffee-machine.png';
import imgJuicer      from '../assets/images/products/juicer.png';
import imgPlant       from '../assets/images/products/plant.png';
import imgRack        from '../assets/images/products/magazine-rack.png';

const HERO_SLIDES = [
  {
    label: 'New Season',
    headline: 'Premium\nHome &\nElectronics.',
    sub: 'Curated essentials for your modern lifestyle',
    cta: 'Shop Collection',
    link: '/products',
    image: heroBanner,
    color: '#E8F4F8',
  },
  {
    label: 'Interior Living',
    headline: 'Style Your\nSpace With\nConfidence.',
    sub: 'Beautiful furniture and home décor pieces',
    cta: 'Explore Furniture',
    link: '/products?category=furniture',
    image: heroLiving,
    color: '#F5F0EA',
  },
  {
    label: 'Smart Devices',
    headline: 'Tech That\nFits Your\nLife.',
    sub: 'Top-rated electronics at unbeatable prices',
    cta: 'Shop Electronics',
    link: '/products?category=electronics',
    image: heroElec,
    color: '#EAF0F8',
  },
];

const CATEGORY_LIST = [
  { id: 'furniture',   label: 'Furniture',   image: heroLiving  },
  { id: 'electronics', label: 'Electronics', image: heroBanner  },
  { id: 'home-decor',  label: 'Home Décor',  image: promoColors },
  { id: 'lighting',    label: 'Lighting',    image: imgLamp     },
  { id: 'plants',      label: 'Plants',      image: imgPlant    },
];

const HIGHLIGHTS = [
  { img: imgChair,  title: 'Accent Seating',     desc: 'Chairs & Sofas', link: '/products?category=furniture'   },
  { img: imgCoffee, title: 'Kitchen Appliances',  desc: 'Coffee & More',  link: '/products?category=electronics' },
  { img: imgJuicer, title: 'Health Gadgets',      desc: 'Live Better',    link: '/products?category=electronics' },
  { img: imgRack,   title: 'Storage & Shelving',  desc: 'Stay Organised', link: '/products?category=home-decor'  },
];

export default function HomePage() {
  const [heroIdx, setHeroIdx]   = useState(0);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getProducts({ featured: true, limit: 8 })
      .then(d => setFeatured(d.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const hero = HERO_SLIDES[heroIdx];

  return (
    <div className="home page-enter">

      {/* HERO */}
      <section className="hero" style={{ '--hero-bg': hero.color }}>
        <div className="container hero__inner">
          <div className="hero__copy">
            <span className="label hero__eyebrow">{hero.label}</span>
            <h1 className="display-1 hero__headline">
              {hero.headline.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h1>
            <p className="hero__sub">{hero.sub}</p>
            <div className="hero__ctas">
              <Link to={hero.link} className="btn btn-primary btn-lg">{hero.cta}</Link>
              <Link to="/products?featured=true" className="btn btn-ghost btn-lg">View Featured</Link>
            </div>
          </div>
          <div className="hero__image-wrap">
            <img key={heroIdx} src={hero.image} alt={hero.label} className="hero__image" />
            <div className="hero__image-badge">
              <span className="label">Free shipping</span>
              <span>Orders over $75</span>
            </div>
          </div>
        </div>
        <div className="hero__dots">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`hero__dot${i === heroIdx ? ' active' : ''}`}
              onClick={() => setHeroIdx(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="trust-bar">
        <div className="container trust-bar__inner">
          {[
            { icon: '🚚', title: 'Free Shipping',  desc: 'On orders over $75'    },
            { icon: '↩️', title: 'Easy Returns',   desc: '30-day free returns'   },
            { icon: '🔒', title: 'Secure Payment', desc: 'SSL encrypted checkout' },
            { icon: '💬', title: '24/7 Support',   desc: 'Chat, email & phone'   },
          ].map(item => (
            <div key={item.title} className="trust-bar__item">
              <span className="trust-bar__icon">{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section categories-section">
        <div className="container">
          <div className="section__header">
            <div>
              <span className="label section__eyebrow">Browse by</span>
              <h2 className="display-2">Shop by Category</h2>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="categories-grid">
            {CATEGORY_LIST.map((cat, i) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`}
                className={`category-card${i === 0 ? ' category-card--featured' : ''}`}>
                <img src={cat.image} alt={cat.label} />
                <div className="category-card__overlay">
                  <span>{cat.label}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <span className="label section__eyebrow">Hand-picked</span>
              <h2 className="display-2">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">See All</Link>
          </div>
          {loading ? (
            <div className="products-grid">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="product-skeleton">
                  <div className="skeleton" style={{ aspectRatio: '4/5', borderRadius: 12 }} />
                  <div className="product-skeleton__info">
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    <div className="skeleton" style={{ height: 14, width: '80%' }} />
                    <div className="skeleton" style={{ height: 16, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HIGHLIGHTS / COLLECTIONS */}
      <section className="section highlights-section">
        <div className="container">
          <div className="section__header">
            <div>
              <span className="label section__eyebrow">Explore More</span>
              <h2 className="display-2">Collections</h2>
            </div>
          </div>
          <div className="highlights-grid">
            {HIGHLIGHTS.map(h => (
              <Link key={h.title} to={h.link} className="highlight-card">
                <div className="highlight-card__img">
                  <img src={h.img} alt={h.title} />
                </div>
                <div className="highlight-card__body">
                  <span className="highlight-card__sub">{h.desc}</span>
                  <h3 className="highlight-card__title">{h.title}</h3>
                  <span className="highlight-card__cta">
                    Shop now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="promo-banner">
        <div className="container promo-banner__inner">
          <div className="promo-banner__copy">
            <span className="label">Limited Time</span>
            <h2 className="display-2">Up to 25% Off<br />Selected Items</h2>
            <p>Don't miss our seasonal sale — quality picks at unbeatable prices.</p>
            <Link to="/products?sort=discount" className="btn btn-accent btn-lg">Shop the Sale</Link>
          </div>
          <div className="promo-banner__images">
            <img src={promoShipping}  alt="Fast shipping"  className="promo-img promo-img--top" />
            <img src={promoWarehouse} alt="Our warehouse"  className="promo-img promo-img--bottom" />
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="section">
        <div className="container">
          <div className="section__header">
            <div>
              <span className="label section__eyebrow">What's Hot</span>
              <h2 className="display-2">Trending Now</h2>
            </div>
            <Link to="/products?sort=rating" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="trending-strip">
            {['New Arrivals','Best Sellers','Under $100','On Sale','Staff Picks','Sustainable'].map(tag => (
              <button key={tag} className="trending-tag" onClick={() => navigate('/products')}>{tag}</button>
            ))}
          </div>
          {!loading && (
            <div className="products-grid">
              {featured.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DELIVERY + VARIETY BANNER */}
      <section className="delivery-banner">
        <div className="container delivery-banner__inner">
          <div className="delivery-banner__card">
            <img src={promoBoxes} alt="Fast delivery" />
            <div className="delivery-banner__text">
              <h3>Fast &amp; Reliable Delivery</h3>
              <p>We ship to 50+ countries with tracked express options at checkout.</p>
              <Link to="/products" className="btn btn-outline btn-sm">Start Shopping</Link>
            </div>
          </div>
          <div className="delivery-banner__card delivery-banner__card--accent">
            <img src={promoColors} alt="Wide selection" />
            <div className="delivery-banner__text">
              <h3>Thousands of Products</h3>
              <p>From home décor to cutting-edge electronics — all curated for you.</p>
              <Link to="/products" className="btn btn-primary btn-sm">Browse All</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}