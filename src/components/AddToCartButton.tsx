'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  images?: { url?: string | null }[];
  conservationPercentage?: number;
  conservationFocus?: string | null;
}

interface Variant {
  id: string;
  variantName: string;
  sku: string;
  price: number;
  stock: number;
  size?: string | null;
  color?: string | null;
  material?: string | null;
  images?: { url?: string | null }[];
}

interface AddToCartButtonProps {
  product: Product;
  variant?: Variant | null;
  stock: number;
  quantity?: number;
  className?: string;
}

export default function AddToCartButton({
  product,
  variant,
  stock,
  quantity = 1,
  className = ''
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isFlying, setIsFlying] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    setIsFlying(true);

    try {
      // Convert product to CartContext format
      const cartProduct = {
        id: product.id,
        name: product.name,
        sku: product.sku,
        basePrice: product.basePrice,
        inStock: stock > 0,
        images: product.images,
        conservationInfo: {
          donationPercentage: product.conservationPercentage || 10,
          conservationFocus: product.conservationFocus,
        },
      };

      // Convert variant to CartContext format if exists
      const cartVariant = variant ? {
        id: variant.id,
        variantName: variant.variantName,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        size: variant.size as any,
        color: variant.color,
        material: variant.material,
        images: variant.images,
      } : null;

      // Add to cart
      addItem(cartProduct, cartVariant, quantity);

      // Show success feedback
      setJustAdded(true);
      toast.success(
        <div>
          <div className="font-semibold">Added to cart!</div>
          <div className="text-sm">{product.name} × {quantity}</div>
        </div>,
        {
          duration: 3000,
          position: 'bottom-right',
        }
      );

      // Reset states
      setTimeout(() => setJustAdded(false), 2000);
      setTimeout(() => setIsFlying(false), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  if (stock === 0) {
    return (
      <Button
        disabled
        className={`w-full ${className}`}
        size="lg"
      >
        Out of Stock
      </Button>
    );
  }

  return (
    <>
      {isFlying && (
        <div 
          className="fixed z-50 pointer-events-none transition-all duration-1000 ease-in-out"
          style={{
            top: '50%',
            left: '50%',
            width: '50px',
            height: '50px',
            animation: 'flyToCart 1s forwards'
          }}
        >
          {product.images?.[0]?.url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.images[0].url}
              alt="flying product"
              className="w-full h-full object-cover rounded-full border-2 border-teal-500 shadow-lg"
            />
          ) : (
            <div className="w-full h-full bg-teal-500 rounded-full flex items-center justify-center text-white">
              <ShoppingCart size={24} />
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        @keyframes flyToCart {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            top: 50%;
            left: 50%;
          }
          100% {
            transform: translate(0, 0) scale(0.2);
            opacity: 0;
            top: 2rem;
            left: calc(100% - 2rem);
          }
        }
      `}</style>
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || justAdded}
        className={`w-full bg-teal-600 hover:bg-teal-700 text-white transition-all transform hover:scale-105 ${className}`}
        size="lg"
      >
        {justAdded ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Added to Cart!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </>
        )}
      </Button>
    </>
  );
}
