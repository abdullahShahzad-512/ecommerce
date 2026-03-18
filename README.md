# Shopr — eCommerce Web App
### Week 1 Deliverable: Project Setup & Static Backend Integration

---

## 🏗️ Project Structure

```
ecommerce/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Navbar, Footer, Mobile menu
│   │   │   ├── Layout.css
│   │   │   ├── ProductCard.jsx     # Reusable product card w/ quick-add
│   │   │   └── ProductCard.css
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Hero, Categories, Featured, Promo
│   │   │   ├── ProductsPage.jsx    # Product listing with filters/sort
│   │   │   ├── ProductDetailPage.jsx # Full product detail w/ tabs
│   │   │   ├── CartPage.jsx        # Shopping cart with summary
│   │   │   └── NotFoundPage.jsx
│   │   ├── styles/
│   │   │   └── global.css          # Design system, tokens, utilities
│   │   ├── App.jsx                 # Route definitions
│   │   ├── CartContext.jsx         # Global cart state (useReducer)
│   │   ├── api.js                  # API service module
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js              # Dev proxy: /api → localhost:8000
│   └── package.json
│
└── backend/                # Python FastAPI backend
    ├── main.py             # App entry, CORS, route registration
    ├── models.py           # Pydantic models
    ├── requirements.txt
    └── routes/
        ├── products.py     # GET /api/products, GET /api/products/:id
        ├── categories.py   # GET /api/categories
        └── cart.py         # POST /api/cart/calculate
```

---

## 🚀 Setup & Running

### Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server (port 8000)
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

### Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (port 3000)
npm run dev
```

Open: http://localhost:3000

---

## 📄 Routes

### Frontend Routes
| Path | Page |
|---|---|
| `/` | Home Page |
| `/products` | Product Listing (+ filters via query params) |
| `/products/:id` | Product Detail |
| `/cart` | Shopping Cart |

### Backend API Endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products (filter, sort, paginate) |
| GET | `/api/products/:id` | Single product + related |
| GET | `/api/categories` | All categories |
| POST | `/api/cart/calculate` | Calculate cart totals |

#### Product Query Params
- `category` — Filter by category slug
- `sort` — `default`, `price-asc`, `price-desc`, `rating`, `discount`
- `search` — Full-text search in name and description
- `featured` — `true` to show featured only
- `min_price`, `max_price` — Price range filter
- `page`, `limit` — Pagination

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| `> 1024px` | Desktop: sidebar + 4-col grid, full navbar |
| `768px–1024px` | Tablet: 3-col grid, compact sidebar |
| `480px–768px` | Mobile: 2-col grid, slide-in filter drawer |
| `< 480px` | Mobile S: 2-col grid, stacked actions |

---

## ✨ Features Implemented

- **Sticky responsive navbar** with search overlay, cart badge, mobile hamburger drawer
- **Hero carousel** with auto-rotation and dot navigation
- **Category grid** with featured spanning layout
- **Product cards** with hover image swap, wishlist, quick-add with feedback
- **Filter sidebar** (desktop sticky) + mobile drawer with price range, category, presets
- **Product detail** with image gallery, color/size selectors, qty picker, tabs (description, details, reviews)
- **Cart** with qty controls, remove, shipping progress bar, promo code input
- **Global cart state** via React Context + useReducer (persistent in session)
- **Loading skeletons** on all async data fetches
- **Empty states** for no results / 404
- **CSS custom properties** design system (colors, spacing, typography, shadows)
- **Page enter animations** on all routes
