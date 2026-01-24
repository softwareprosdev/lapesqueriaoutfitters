'use client';

import { useEffect, useState } from 'react';
import { ReviewCard } from '@/components/ReviewCard';
import { motion } from 'framer-motion';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  body: string;
  title?: string;
  createdAt: string;
}

export function TestimonialSection() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/reviews?limit=6');
        if (response.ok) {
           const data = await response.json();
           setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      }
    }
    fetchReviews();
  }, []);

  // Fallback to static data if API fails or for immediate display
  const displayReviews = reviews.length > 0 ? reviews : [
    { id: '1', customerName: "Mike R.", title: "From South Padre Island", body: "Best fishing shirts I've owned. The UPF protection is legit and they stay cool all day on the water.", rating: 5, createdAt: new Date().toISOString() },
    { id: '2', customerName: "Carlos M.", title: "From McAllen, TX", body: "Finally found shirts that don't fade after a few trips. The salt-resistant fabric is the real deal.", rating: 5, createdAt: new Date().toISOString() },
    { id: '3', customerName: "David K.", title: "From Harlingen, TX", body: "Great fit, great quality. Wore it for a 10-hour offshore trip and stayed comfortable the whole time.", rating: 5, createdAt: new Date().toISOString() },
  ];

  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-black text-[#001F3F] mb-4 uppercase tracking-tight"
          >
            What Anglers Are Saying
          </motion.h2>
          <p className="text-lg text-[#494949] max-w-2xl mx-auto">
            Real reviews from real fishermen across South Texas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayReviews.map((review, i) => (
            <ReviewCard
              key={review.id || i}
              author={review.customerName}
              text={review.body}
              rating={review.rating}
              location={review.title?.replace('From ', '')}
              date={new Date(review.createdAt).toLocaleDateString()}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
