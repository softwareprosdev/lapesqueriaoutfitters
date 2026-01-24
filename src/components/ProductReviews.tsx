'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  title?: string;
  body: string;
  photos: string[];
  customerName?: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function fetchReviews() {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
    } finally {
      setLoading(false);
    }
  }

  function renderStars(rating: number, size: 'sm' | 'lg' = 'sm') {
    const sizeClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="mt-1">{renderStars(Math.round(averageRating), 'lg')}</div>
            <div className="text-sm text-gray-600 mt-1">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  {review.isVerifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                {review.title && <h4 className="font-semibold mt-1">{review.title}</h4>}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-gray-700 mt-2">{review.body}</p>

            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 mt-3">
                {review.photos.map((photo, index) => (
                  <Image
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    width={100}
                    height={100}
                    className="rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <p className="text-sm text-gray-600 mt-2">
              {review.customerName || 'Anonymous'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
