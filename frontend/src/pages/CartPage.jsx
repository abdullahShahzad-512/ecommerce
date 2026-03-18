import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import './CartPage.css';

export default function CartPage() {
  const { items, totalItems, subtotal, shipping, total, dispatch } = useCart();

  if (items.length === 0) return (
    <div className="container cart-empty page-enter">
      <div className="empty-state">
        <div className="empty-state__icon">🛍️</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="breadcrumb-bar">
        <div className="container breadcrumb-bar__inner">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Cart</span>
          </nav>
          <span className="products-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
        </div>
      </div>

      <div className="container cart-page">
        {/* Cart Items */}
        <div className="cart-items">
          <div className="cart-items__header">
            <h2 className="heading-1">Shopping Cart</h2>
            <button
              className="cart-clear"
              onClick={() => dispatch({ type: 'CLEAR' })}
            >
              Clear all
            </button>
          </div>

          <ul className="cart-list">
            {items.map(item => (
              <li key={item.key} className="cart-item">
                <div className="cart-item__image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item__info">
                  <Link to={`/products/${item.id}`} className="cart-item__name">
                    {item.name}
                  </Link>
                  <div className="cart-item__meta">
                    {item.selectedColor !== 'one-size' && (
                      <span>Color: <strong style={{ textTransform: 'capitalize' }}>{item.selectedColor}</strong></span>
                    )}
                    {item.selectedSize !== 'one-size' && (
                      <span>Size: <strong>{item.selectedSize}</strong></span>
                    )}
                  </div>
                  <span className="cart-item__price">${item.price.toFixed(2)}</span>
                </div>
                <div className="cart-item__controls">
                  <div className="qty-selector">
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QTY', key: item.key, qty: item.qty - 1 })}
                      aria-label="Decrease"
                    >−</button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QTY', key: item.key, qty: item.qty + 1 })}
                      aria-label="Increase"
                    >+</button>
                  </div>
                  <span className="cart-item__subtotal">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                  <button
                    className="cart-item__remove"
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', key: item.key })}
                    aria-label="Remove item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-continue">
            <Link to="/products" className="btn btn-ghost">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <div className="cart-summary__box">
            <h3>Order Summary</h3>

            <div className="cart-summary__rows">
              <div className="cart-summary__row">
                <span>Subtotal ({totalItems} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary__row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'free' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <div className="cart-summary__free-shipping">
                  <div className="shipping-progress">
                    <div
                      className="shipping-progress__bar"
                      style={{ width: `${Math.min((subtotal / 75) * 100, 100)}%` }}
                    />
                  </div>
                  <p>Add <strong>${(75 - subtotal).toFixed(2)}</strong> more for free shipping</p>
                </div>
              )}
            </div>

            <hr className="divider" />

            <div className="cart-summary__total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button className="btn btn-accent btn-lg btn-full cart-checkout-btn">
              Proceed to Checkout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>

            <div className="cart-summary__payments">
              <p className="label">We Accept</p>
              <div className="payment-icons">
                {['Visa', 'MC', 'Amex', 'PayPal', 'Apple'].map(p => (
                  <span key={p} className="payment-icon">{p}</span>
                ))}
              </div>
            </div>

            {/* Promo Code */}
            <div className="cart-promo">
              <p className="cart-promo__label">Have a promo code?</p>
              <form className="cart-promo__form" onSubmit={e => e.preventDefault()}>
                <input type="text" placeholder="Enter code" />
                <button type="submit" className="btn btn-outline btn-sm">Apply</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}