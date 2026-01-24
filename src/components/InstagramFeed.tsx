'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface InstagramPost {
  id: string;
  imageUrl: string;
  permalink: string;
  caption?: string;
}

interface InstagramFeedProps {
  username?: string;
  className?: string;
}

// For now, we'll use curated images that represent the Instagram feed
// In production, this would connect to Instagram Basic Display API
const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&h=400&fit=crop',
    permalink: 'https://www.instagram.com/lapesqueriaoutfitters',
    caption: 'Fresh catch of the day! 🎣',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
    permalink: 'https://www.instagram.com/lapesqueriaoutfitters',
    caption: 'Early morning on the water 🌊',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=400&fit=crop',
    permalink: 'https://www.instagram.com/lapesqueriaoutfitters',
    caption: 'Ready for another day on the Gulf 🐟',
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1510527252109-a53d708700ef?w=400&h=400&fit=crop',
    permalink: 'https://www.instagram.com/lapesqueriaoutfitters',
    caption: 'Reeling in the big one! 💪',
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop',
    permalink: 'https://www.instagram.com/lapesqueriaoutfitters',
    caption: 'Inshore fishing at its finest 🎣',
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=400&fit=crop',
    permalink: 'https://www.instagram.com/lapesqueriaoutfitters',
    caption: 'Texas Gulf Coast sunset 🌅',
  },
];

export default function InstagramFeed({
  username = 'lapesqueriaoutfitters',
  className = ''
}: InstagramFeedProps) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading from API
    const loadPosts = async () => {
      try {
        // In production, this would fetch from Instagram API
        // For now, use curated images
        await new Promise(resolve => setTimeout(resolve, 500));
        setPosts(INSTAGRAM_POSTS);
      } catch (err) {
        console.error('Failed to load Instagram posts:', err);
        setError('Unable to load Instagram feed');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">{error}</p>
        <a
          href={`https://www.instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:text-pink-600 font-medium mt-2 inline-block"
        >
          Visit @{username} on Instagram →
        </a>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="aspect-square rounded-lg overflow-hidden group relative hover:scale-105 transition-transform shadow-md"
        >
          <Image
            src={post.imageUrl}
            alt={post.caption || 'Instagram post'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            priority={parseInt(post.id) <= 2}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
            <p className="text-white text-xs line-clamp-2">{post.caption}</p>
          </div>
          {/* Instagram icon */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
        </a>
      ))}
    </div>
  );
}
