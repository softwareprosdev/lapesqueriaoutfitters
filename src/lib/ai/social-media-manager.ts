import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_KEY || '');

/**
 * Zod schema for validated Social Media responses
 */
export const GeneratedSocialPostSchema = z.object({
  caption: z.string().min(10),
  hashtags: z.array(z.string()).min(5).max(20),
});

export type GeneratedSocialPost = z.infer<typeof GeneratedSocialPostSchema>;

export interface SocialMediaPost {
  platform: 'instagram' | 'facebook' | 'pinterest' | 'twitter';
  caption: string;
  hashtags: string[];
  imageUrl: string;
  scheduledAt: Date;
}

export interface ProductInfo {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

/**
 * Generate engaging social media captions using Gemini AI
 */
export async function generateSocialCaption(
  product: ProductInfo,
  platform: 'instagram' | 'facebook' | 'pinterest' | 'twitter',
  tone: 'casual' | 'professional' | 'enthusiastic' = 'enthusiastic'
): Promise<GeneratedSocialPost> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      You are a social media expert for La Pesqueria Outfitters, a fishing apparel and outdoor gear business.
      Create an engaging ${platform} post for the product listed below.

      PRODUCT DETAILS:
      - Name: ${product.name}
      - Description: ${product.description}
      - Price: $${product.price}
      - Category: ${product.category}

      PLATFORM: ${platform}
      TONE: ${tone}

      GUIDELINES:
      - Highlight the quality fishing apparel and outdoor gear for anglers and outdoor enthusiasts.
      - ${platform === 'twitter' ? 'Keep it under 280 characters.' : 'Make it engaging and story-driven.'}
      - Include a clear call-to-action to "Shop now".
      - Focus on fishing lifestyle, outdoor adventures, and Texas Gulf Coast fishing.

      RESPONSE FORMAT:
      You must return ONLY a strictly valid JSON object. No preamble, no markdown.
      JSON STRUCTURE:
      {
        "caption": "Your compelling post caption",
        "hashtags": ["list", "of", "10-15", "relevant", "hashtags", "without", "#"]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Secure JSON parsing
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;
    const rawJson = JSON.parse(jsonString);

    const validated = GeneratedSocialPostSchema.safeParse(rawJson);
    if (!validated.success) {
      throw new Error(`AI social post validation failed: ${validated.error.issues[0].message}`);
    }

    return validated.data;
  } catch (error) {
    console.error('AI caption generation error:', error);
    
    // Fallback caption
    return {
      caption: `🎣 ${product.name} 🎣\n\n${product.description}\n\n🌊 Quality gear for Texas anglers\n📍 Based in McAllen, TX\n\nShop now! Link in bio 👆`,
      hashtags: [
        'fishinggear',
        'fishingapparel',
        'texasfishing',
        'gulfcoastfishing',
        'outdoorgear',
        'anglerlife',
        'fishinglife',
        'catchoftheday',
        'tightlines'
      ]
    };
  }
}

/**
 * Generate optimal posting times based on platform
 */
export function getOptimalPostingTimes(platform: string): Date[] {
  const now = new Date();
  const times: Date[] = [];

  // Best times based on platform research
  const schedules = {
    instagram: [
      { hour: 9, minute: 0 },  // 9 AM
      { hour: 14, minute: 0 }, // 2 PM
      { hour: 19, minute: 0 }  // 7 PM
    ],
    facebook: [
      { hour: 10, minute: 0 }, // 10 AM
      { hour: 13, minute: 0 }, // 1 PM
      { hour: 20, minute: 0 }  // 8 PM
    ],
    pinterest: [
      { hour: 8, minute: 30 },  // 8:30 AM
      { hour: 15, minute: 0 },  // 3 PM
      { hour: 21, minute: 0 }   // 9 PM
    ],
    twitter: [
      { hour: 8, minute: 0 },   // 8 AM
      { hour: 12, minute: 0 },  // 12 PM
      { hour: 17, minute: 0 }   // 5 PM
    ]
  };

  const platformSchedule = schedules[platform as keyof typeof schedules] || schedules.instagram;

  // Generate next 7 days of posting times
  for (let day = 0; day < 7; day++) {
    platformSchedule.forEach(time => {
      const postDate = new Date(now);
      postDate.setDate(postDate.getDate() + day);
      postDate.setHours(time.hour, time.minute, 0, 0);
      
      // Only schedule future times
      if (postDate > now) {
        times.push(postDate);
      }
    });
  }

  return times.slice(0, 14); // Return next 14 posting slots
}

/**
 * Create a complete social media content calendar
 */
export async function createContentCalendar(
  products: ProductInfo[],
  startDate: Date = new Date(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _daysAhead: number = 14 // Reserved for future calendar range functionality
): Promise<SocialMediaPost[]> {
  const posts: SocialMediaPost[] = [];
  const platforms: Array<'instagram' | 'facebook' | 'pinterest'> = [
    'instagram',
    'facebook', 
    'pinterest'
  ];

  // Rotate through products and platforms
  let productIndex = 0;
  let platformIndex = 0;

  // Generate 2 posts per day until Jan 31
  const endDate = new Date('2026-01-31T23:59:59');
  const currentDate = new Date(startDate);

  while (currentDate <= endDate && productIndex < products.length * 3) {
    const product = products[productIndex % products.length];
    const platform = platforms[platformIndex % platforms.length];

    // Get optimal times for this platform
    const times = getOptimalPostingTimes(platform);
    const timeSlot = times[Math.floor(Math.random() * Math.min(3, times.length))];

    // Generate AI caption
    const { caption, hashtags } = await generateSocialCaption(product, platform);

    posts.push({
      platform,
      caption,
      hashtags,
      imageUrl: product.imageUrl,
      scheduledAt: timeSlot
    });

    // Move to next product and platform
    productIndex++;
    platformIndex++;
    
    // Every 2 posts, move to next day
    if (posts.length % 2 === 0) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return posts.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
}

/**
 * Get trending hashtags for fishing gear and apparel niche
 */
export function getTrendingFishingHashtags(): string[] {
  return [
    'fishinggear',
    'fishingapparel',
    'texasfishing',
    'gulfcoastfishing',
    'outdoorgear',
    'anglerlife',
    'fishinglife',
    'catchoftheday',
    'tightlines',
    'bassfishing',
    'saltwaterfishing',
    'fishingshirt',
    'fishinghat',
    'tackleshop',
    'fishingoutfitters',
    'sportfishing',
    'redfishing',
    'trouttexas',
    'kayakfishing',
    'offshorefishing',
    'inshorefishing',
    'fishingguide',
    'texasoutdoors',
    'riograndevalley',
    'mcallentx'
  ];
}
