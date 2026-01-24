/**
 * Genkit AI Configuration for La Pesqueria Outfitters
 * Product recommendation engine setup
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Initialize Genkit with Google AI
export const ai = genkit({
  plugins: [
    // Using Google AI (Gemini) for recommendations
    // Falls back to rule-based if API key not available
    ...(process.env.GOOGLE_AI_API_KEY ? [googleAI()] : []),
  ],
  // Note: Logging configured via environment variables instead of logLevel option
});

// AI Configuration
export const AI_CONFIG = {
  // Model to use for recommendations
  model: 'gemini-1.5-flash', // Fast and cost-effective

  // Recommendation settings
  maxRecommendations: 6,
  similarityThreshold: 0.6,

  // Feature weights for recommendation algorithm
  weights: {
    category: 0.3,      // Product category similarity
    price: 0.2,         // Price range similarity
    attributes: 0.25,   // Color, material, size similarity
    conservation: 0.15, // Conservation focus match
    popularity: 0.1,    // Product popularity
  },

  // Fallback to rule-based recommendations if AI unavailable
  useFallback: true,
} as const;

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
  return !!process.env.GOOGLE_AI_API_KEY || AI_CONFIG.useFallback;
}

/**
 * Get AI recommendation prompt template
 */
export function getRecommendationPrompt(productData: {
  name: string;
  category?: string;
  description?: string;
  price: number;
  attributes?: string[];
}): string {
  return `
You are a product recommendation AI for La Pesqueria Outfitters, a fishing apparel and outdoor gear store
based in McAllen, TX.

Given this product:
- Name: ${productData.name}
- Category: ${productData.category || 'General'}
- Description: ${productData.description || 'N/A'}
- Price: $${productData.price}
- Attributes: ${productData.attributes?.join(', ') || 'N/A'}

Recommend similar products that customers who bought this would also like.
Consider fishing themes, outdoor activities, price range, and functionality.
  `.trim();
}
