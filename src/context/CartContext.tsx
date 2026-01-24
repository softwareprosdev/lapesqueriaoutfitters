'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import {
  trackAddToCart as trackGA4AddToCart,
  trackRemoveFromCart as trackGA4RemoveFromCart,
} from '@/components/providers/GoogleAnalytics';
import { trackClarityEvent } from '@/components/providers/MicrosoftClarity';

// Simple Product type (compatible with Prisma schema)
interface Product {
  id: number | string;
  name: string;
  sku: string;
  basePrice: number;
  inStock?: boolean;
  images?: { url?: string | null }[];
  conservationInfo?: {
    donationPercentage?: number | null;
    conservationFocus?: string | null;
  };
}

// Product variant type
export interface PayloadProductVariant {
  id?: string | null;
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  size?: ('small' | 'medium' | 'large') | null;
  color?: string | null;
  material?: string | null;
  images?: { url?: string | null }[];
}

// Cart item type
export interface PayloadCartItem {
  id: string; // Unique cart item identifier (variantId or productId)
  productId: number | string;
  productName: string;
  productSku: string;
  variantId?: string | null; // Variant ID if using variant, null if base product
  variantName?: string | null;
  variantSku?: string | null;
  price: number; // Variant price or base price
  quantity: number;
  stock: number;
  imageUrl?: string | null;
  // Conservation info
  conservationDonationPercentage?: number | null;
  conservationFocus?: string | null;
}

// Cart state
interface CartState {
  items: PayloadCartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isOpen: boolean;
  // Guest checkout info (optional, for non-logged-in users)
  guestEmail?: string | null;
  guestName?: string | null;
  // Discount info
  discount?: {
    code: string;
    type: string;
    value: number;
    amount: number;
    description?: string;
  } | null;
}

// Cart actions
type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; variant?: PayloadProductVariant | null; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_GUEST_INFO'; payload: { email?: string; name?: string } }
  | { type: 'APPLY_DISCOUNT'; payload: { code: string; type: string; value: number; description?: string } }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'RECALCULATE_TOTALS' };

// Helper function to get image URL
function getImageUrl(product: Product, variant?: PayloadProductVariant | null): string | null {
  // Try variant images first
  if (variant?.images && variant.images.length > 0) {
    const url = variant.images[0]?.url;
    if (url) return url;
  }

  // Fall back to product images
  if (product.images && product.images.length > 0) {
    const url = product.images[0]?.url;
    if (url) return url;
  }

  return null;
}

// Helper function to calculate totals
function calculateTotals(items: PayloadCartItem[], discount?: CartState['discount']): { subtotal: number; shipping: number; tax: number; total: number; discountAmount: number } {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate discount amount
  let discountAmount = 0;
  if (discount) {
    if (discount.type === 'PERCENTAGE') {
      discountAmount = subtotal * (discount.value / 100);
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = discount.value;
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  
  // Free shipping check - applied AFTER discount? Usually depends on policy.
  // Assuming free shipping based on PRE-discount subtotal is common for "Spend X to get free shipping", 
  // but let's stick to simple logic or what was there.
  // Previous logic: const shipping = subtotal > 50 ? 0 : 5.95;
  // If discount is FREE_SHIPPING type, then 0.
  
  let shipping = subtotal > 50 ? 0 : 5.95;
  if (discount?.type === 'FREE_SHIPPING') {
    shipping = 0;
  }

  const tax = discountedSubtotal * 0.0825; // 8.25% tax
  const total = discountedSubtotal + shipping + tax;

  return { subtotal, shipping, tax, total, discountAmount };
}

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState;

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, variant, quantity } = action.payload;

      // Generate unique ID: use variant ID if exists, otherwise use product ID
      const itemId = variant?.id || `product-${product.id}`;
      const price = variant?.price || product.basePrice;
      const stock = variant?.stock || (product.inStock ? 999 : 0); // Assume high stock if no variant

      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(item => item.id === itemId);

      let newItems: PayloadCartItem[];

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        const newItem: PayloadCartItem = {
          id: itemId,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          variantId: variant?.id || null,
          variantName: variant?.variantName || null,
          variantSku: variant?.sku || null,
          price,
          quantity,
          stock,
          imageUrl: getImageUrl(product, variant),
          conservationDonationPercentage: product.conservationInfo?.donationPercentage || null,
          conservationFocus: product.conservationInfo?.conservationFocus || null,
        };

        newItems = [...state.items, newItem];
      }

      const totals = calculateTotals(newItems, state.discount);

      newState = {
        ...state,
        items: newItems,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        // Update discount amount if percentage based
        discount: state.discount ? { ...state.discount, amount: totals.discountAmount } : null,
      };
      break;
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totals = calculateTotals(newItems, state.discount);

      newState = {
        ...state,
        items: newItems,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        discount: state.discount ? { ...state.discount, amount: totals.discountAmount } : null,
      };
      break;
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0); // Remove items with 0 quantity

      const totals = calculateTotals(newItems, state.discount);

      newState = {
        ...state,
        items: newItems,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        discount: state.discount ? { ...state.discount, amount: totals.discountAmount } : null,
      };
      break;
    }

    case 'CLEAR_CART':
      newState = {
        ...state,
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
        discount: null,
      };
      break;

    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };

    case 'SET_GUEST_INFO':
      newState = {
        ...state,
        guestEmail: action.payload.email || state.guestEmail,
        guestName: action.payload.name || state.guestName,
      };
      break;

    case 'APPLY_DISCOUNT': {
      const discount = {
        code: action.payload.code,
        type: action.payload.type,
        value: action.payload.value,
        description: action.payload.description,
        amount: 0, // Calculated below
      };
      
      const totals = calculateTotals(state.items, discount);
      
      newState = {
        ...state,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        discount: { ...discount, amount: totals.discountAmount },
      };
      break;
    }

    case 'REMOVE_DISCOUNT': {
      const totals = calculateTotals(state.items, undefined);
      
      newState = {
        ...state,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        discount: null,
      };
      break;
    }

    case 'LOAD_CART':
      return action.payload;

    case 'RECALCULATE_TOTALS': {
      const totals = calculateTotals(state.items, state.discount);
      newState = {
        ...state,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        discount: state.discount ? { ...state.discount, amount: totals.discountAmount } : null,
      };
      break;
    }

    default:
      return state;
  }

  // Persist to localStorage after state changes
  // (TOGGLE_CART and LOAD_CART return early and don't reach this point)
  if (typeof window !== 'undefined') {
    localStorage.setItem('lapesqueria-cart', JSON.stringify(newState));
  }

  return newState;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  isOpen: false,
  guestEmail: null,
  guestName: null,
  discount: null,
};

// Helper function to track add to cart in custom backend
async function trackCustomAddToCart(product: Product, variant: PayloadProductVariant | null, quantity: number) {
  try {
    // Get or create session ID
    let sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('analytics_session_id') : null;
    if (!sessionId && typeof window !== 'undefined') {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'ADD_TO_CART',
        sessionId,
        productId: product.id,
        variantId: variant?.id,
        metadata: {
          productName: product.name,
          variantName: variant?.variantName,
          price: variant?.price || product.basePrice,
          quantity,
        },
      }),
    });
  } catch {
    // Silent fail - don't break cart functionality if tracking fails
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (product: Product, variant?: PayloadProductVariant | null, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setGuestInfo: (email?: string, name?: string) => void;
  syncWithPayload: (userId?: number) => Promise<void>;
  recalculateTotals: () => void;
  applyDiscount: (code: string, type: string, value: number, description?: string) => void;
  removeDiscount: () => void;
} | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('lapesqueria-cart');
      if (savedCart) {
        try {
          const parsedCart: CartState = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: parsedCart });
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
        }
      }
    }
  }, []);

  const addItem = useCallback((product: Product, variant: PayloadProductVariant | null = null, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, variant, quantity } });

    // Track add to cart in GA4
    trackGA4AddToCart({
      id: variant?.id || String(product.id),
      name: product.name,
      price: variant?.price || product.basePrice,
      quantity,
      variant: variant?.variantName || undefined,
    });

    // Track in Clarity
    trackClarityEvent('add_to_cart');

    // Track in custom backend
    trackCustomAddToCart(product, variant, quantity);
  }, []);

  const removeItem = useCallback((id: string) => {
    // Find the item to get its details for tracking
    const item = state.items.find(i => i.id === id);

    dispatch({ type: 'REMOVE_FROM_CART', payload: id });

    if (item) {
      // Track remove from cart in GA4
      trackGA4RemoveFromCart({
        id: item.id,
        name: item.productName,
        price: item.price,
        quantity: item.quantity,
      });

      // Track in Clarity
      trackClarityEvent('remove_from_cart');
    }
  }, [state.items]);

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lapesqueria-cart');
    }
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const setGuestInfo = (email?: string, name?: string) => {
    dispatch({ type: 'SET_GUEST_INFO', payload: { email, name } });
  };

  const recalculateTotals = () => {
    dispatch({ type: 'RECALCULATE_TOTALS' });
  };

  // Sync cart with Payload API (for logged-in users)
  // TODO: Implement backend cart sync endpoint at /api/cart/sync
  // For now, this is a no-op function to prevent runtime errors
  const syncWithPayload = async (userId?: number) => {
    if (!userId) {
      console.warn('Cannot sync cart: No user ID provided');
      return;
    }

    // Currently disabled - cart is client-side only
    // To enable:
    // 1. Create /src/app/api/cart/sync/route.ts endpoint
    // 2. Implement Payload CMS cart collection
    // 3. Add authentication middleware
    // 4. Uncomment the code below

    console.log('Cart sync not implemented - cart is client-side only');
    return;

    /* Commented out until backend endpoint is created
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          items: state.items,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync cart with server');
      }

      const data = await response.json();

      if (data.cart) {
        dispatch({ type: 'LOAD_CART', payload: data.cart });
      }

      console.log('Cart synced successfully with Payload');
    } catch (error) {
      console.error('Failed to sync cart with Payload:', error);
    }
    */
  };

  const applyDiscount = (code: string, type: string, value: number, description?: string) => {
    dispatch({ type: 'APPLY_DISCOUNT', payload: { code, type, value, description } });
  };

  const removeDiscount = () => {
    dispatch({ type: 'REMOVE_DISCOUNT' });
  };

  const value = {
    state,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    setGuestInfo,
    syncWithPayload,
    recalculateTotals,
    applyDiscount,
    removeDiscount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export type { CartState, CartAction };