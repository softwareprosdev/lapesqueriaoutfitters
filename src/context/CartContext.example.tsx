/* eslint-disable @next/next/no-img-element, react-hooks/rules-of-hooks */
/**
 * EXAMPLE USAGE OF UPDATED CARTCONTEXT WITH PAYLOAD CMS
 *
 * This file demonstrates how to use the updated CartContext with Payload CMS data structures.
 * It shows examples for both products with variants and products without variants.
 */

import { useCart, PayloadProductVariant } from '@/context/CartContext';
import type { Product } from '@payload-types';

// ==========================================
// Example 1: Adding a product WITHOUT variants (using base price)
// ==========================================

function AddBaseProductExample({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // When product has no variants, pass product and null for variant
    // This will use the product's basePrice
    addItem(product, null, 1);
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart - ${product.basePrice}
    </button>
  );
}

// ==========================================
// Example 2: Adding a product WITH a specific variant
// ==========================================

function AddVariantProductExample({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddVariant = (variantId: string) => {
    // Find the selected variant
    const selectedVariant = product.variants?.find(v => v.id === variantId);

    if (!selectedVariant) {
      console.error('Variant not found');
      return;
    }

    // Cast to PayloadProductVariant (they have the same structure)
    const variant: PayloadProductVariant = {
      id: selectedVariant.id,
      variantName: selectedVariant.variantName,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      stock: selectedVariant.stock,
      size: selectedVariant.size,
      color: selectedVariant.color,
      material: selectedVariant.material,
      images: selectedVariant.images,
    };

    // Add the product with the selected variant
    addItem(product, variant, 1);
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <div>
        {product.variants?.map((variant) => (
          <button
            key={variant.id}
            onClick={() => handleAddVariant(variant.id!)}
            disabled={variant.stock === 0}
          >
            {variant.variantName} - ${variant.price}
            {variant.stock === 0 && ' (Out of Stock)'}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// Example 3: Product detail page with variant selector
// ==========================================

function ProductDetailWithVariants({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = React.useState<string | null>(
    product.variants?.[0]?.id || null
  );

  const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
  const displayPrice = selectedVariant?.price || product.basePrice;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.inStock;

  const handleAddToCart = () => {
    if (selectedVariant) {
      const variant: PayloadProductVariant = {
        id: selectedVariant.id,
        variantName: selectedVariant.variantName,
        sku: selectedVariant.sku,
        price: selectedVariant.price,
        stock: selectedVariant.stock,
        size: selectedVariant.size,
        color: selectedVariant.color,
        material: selectedVariant.material,
        images: selectedVariant.images,
      };
      addItem(product, variant, 1);
    } else {
      addItem(product, null, 1);
    }
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="price">${displayPrice.toFixed(2)}</p>

      {/* Variant selector */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <label>Select Option:</label>
          <select
            value={selectedVariantId || ''}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id!}>
                {variant.variantName} - ${variant.price}
                {variant.stock === 0 && ' (Out of Stock)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={!inStock}
      >
        {inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>

      {/* Conservation info */}
      {product.conservationInfo && (
        <div className="conservation-badge">
          {product.conservationInfo.donationPercentage || 10}% of proceeds support{' '}
          {product.conservationInfo.conservationFocus || 'marine conservation'}
        </div>
      )}
    </div>
  );
}

// ==========================================
// Example 4: Cart display component
// ==========================================

function CartDisplay() {
  const { state, removeItem, updateQuantity } = useCart();

  return (
    <div className="cart">
      <h2>Shopping Cart ({state.items.length} items)</h2>

      {state.items.map((item) => (
        <div key={item.id} className="cart-item">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.productName} width={80} height={80} />
          )}

          <div className="item-details">
            <h4>{item.productName}</h4>
            {item.variantName && <p className="variant">{item.variantName}</p>}
            <p className="sku">SKU: {item.variantSku || item.productSku}</p>

            {/* Conservation badge */}
            {item.conservationDonationPercentage && (
              <p className="conservation-badge">
                {item.conservationDonationPercentage}% goes to conservation
              </p>
            )}
          </div>

          <div className="item-actions">
            <input
              type="number"
              min="1"
              max={item.stock}
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
            />
            <p className="price">${(item.price * item.quantity).toFixed(2)}</p>
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        </div>
      ))}

      {/* Cart totals */}
      <div className="cart-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>${state.subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Shipping:</span>
          <span>
            {state.shipping === 0 ? 'FREE' : `$${state.shipping.toFixed(2)}`}
            {state.subtotal < 50 && ' (Free over $50)'}
          </span>
        </div>
        <div className="total-row">
          <span>Tax (8.25%):</span>
          <span>${state.tax.toFixed(2)}</span>
        </div>
        <div className="total-row total">
          <span>Total:</span>
          <span>${state.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Example 5: Guest checkout - setting guest info
// ==========================================

function GuestCheckoutForm() {
  const { setGuestInfo, state } = useCart();
  const [email, setEmail] = React.useState(state.guestEmail || '');
  const [name, setName] = React.useState(state.guestName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestInfo(email, name);
    // Proceed to payment...
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Guest Checkout</h3>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Continue to Payment</button>
    </form>
  );
}

// ==========================================
// Example 6: Syncing cart for logged-in users
// ==========================================

function UserCartSync({ userId }: { userId: number }) {
  const { syncWithPayload } = useCart();
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    // Auto-sync on mount for logged-in users
    if (userId) {
      setSyncing(true);
      syncWithPayload(userId).finally(() => setSyncing(false));
    }
  }, [userId, syncWithPayload]);

  const handleManualSync = async () => {
    setSyncing(true);
    await syncWithPayload(userId);
    setSyncing(false);
  };

  return (
    <div>
      {syncing && <p>Syncing cart...</p>}
      <button onClick={handleManualSync} disabled={syncing}>
        Sync Cart
      </button>
    </div>
  );
}

// ==========================================
// Example 7: Fetching products from Payload API and adding to cart
// ==========================================

async function fetchAndAddProduct(productId: number) {
  const { addItem } = useCart();

  try {
    // Fetch product from Payload API
    const response = await fetch(`/api/products/${productId}`);
    const data = await response.json();
    const product: Product = data.doc;

    // Check if product has variants
    if (product.variants && product.variants.length > 0) {
      // Add first variant as example
      const firstVariant = product.variants[0];
      const variant: PayloadProductVariant = {
        id: firstVariant.id,
        variantName: firstVariant.variantName,
        sku: firstVariant.sku,
        price: firstVariant.price,
        stock: firstVariant.stock,
        size: firstVariant.size,
        color: firstVariant.color,
        material: firstVariant.material,
        images: firstVariant.images,
      };
      addItem(product, variant, 1);
    } else {
      // Add base product (no variant)
      addItem(product, null, 1);
    }
  } catch (error) {
    console.error('Failed to fetch and add product:', error);
  }
}

// ==========================================
// Example 8: Conservation donation calculator
// ==========================================

function ConservationDonationSummary() {
  const { state } = useCart();

  // Calculate total conservation donation from cart
  const totalConservationDonation = state.items.reduce((total, item) => {
    const donationPercentage = item.conservationDonationPercentage || 0;
    const itemTotal = item.price * item.quantity;
    return total + (itemTotal * (donationPercentage / 100));
  }, 0);

  if (totalConservationDonation === 0) {
    return null;
  }

  return (
    <div className="conservation-summary">
      <h4>Conservation Impact</h4>
      <p>
        Your purchase will contribute <strong>${totalConservationDonation.toFixed(2)}</strong> to marine conservation efforts!
      </p>

      {/* Show breakdown by conservation focus */}
      <ul>
        {state.items
          .filter(item => item.conservationDonationPercentage)
          .map(item => (
            <li key={item.id}>
              {item.productName}: ${((item.price * item.quantity * (item.conservationDonationPercentage! / 100))).toFixed(2)}
              {item.conservationFocus && ` → ${item.conservationFocus}`}
            </li>
          ))}
      </ul>
    </div>
  );
}

// ==========================================
// Import example for reference
// ==========================================

import React from 'react';

export {
  AddBaseProductExample,
  AddVariantProductExample,
  ProductDetailWithVariants,
  CartDisplay,
  GuestCheckoutForm,
  UserCartSync,
  fetchAndAddProduct,
  ConservationDonationSummary,
};
