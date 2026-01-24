'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface ReviewCardProps {
  author: string;
  text: string;
  rating: number;
  location?: string;
  date?: string;
}

export function ReviewCard({ author, text, rating, location, date }: ReviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-teal-50 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Star
              className={`w-5 h-5 ${
                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </motion.div>
        ))}
      </div>
      
      <p className="text-gray-600 mb-6 italic leading-relaxed">&quot;{text}&quot;</p>
      
      <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-4">
        <div>
          <h4 className="font-bold text-gray-900">{author}</h4>
          {location && (
            <p className="text-sm text-teal-600 font-medium">{location}</p>
          )}
        </div>
        {date && (
          <span className="text-xs text-gray-400">{date}</span>
        )}
      </div>
    </motion.div>
  );
}
