import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {

    case 'ADD_ITEM': {
      const key = `${action.item.id}-${action.item.selectedColor}-${action.item.selectedSize}`;
      const existing = state.items.find(i => i.key === key);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.key === key ? { ...i, qty: i.qty + 1 } : i
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.item, key, qty: 1 }]
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.key !== action.key)
      };

    case 'UPDATE_QTY':
      if (action.qty < 1) {
        return {
          ...state,
          items: state.items.filter(i => i.key !== action.key)
        };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.key === action.key ? { ...i, qty: action.qty } : i
        )
      };

    case 'CLEAR':
      return { items: [] };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const totalItems = state.items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal   = state.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping   = subtotal >= 75 ? 0 : 9.99;
  const total      = subtotal + shipping;

  return (
    <CartContext.Provider value={{
      ...state,
      totalItems,
      subtotal,
      shipping,
      total,
      dispatch
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);


