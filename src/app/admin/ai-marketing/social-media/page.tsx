'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Instagram, Facebook, Twitter, Sparkles, TrendingUp, Share2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface GeneratedPost {
  id: string;
  platform: string;
  caption: string;
  hashtags: string[];
  imageUrl?: string;
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: Date;
  createdAt: Date;
}

export default function SocialMediaAutomation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'twitter'>('instagram');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);

  const [stats, setStats] = useState({
    instagram: { posts: 0, engagement: '-', reach: '-' },
    facebook: { posts: 0, engagement: '-', reach: '-' },
    twitter: { posts: 0, engagement: '-', reach: '-' },
  });

  // Fetch real post counts on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/ai-marketing/schedule-post');
        if (response.ok) {
          const data = await response.json();
          const posts = data.posts || [];
          const igPosts = posts.filter((p: { platform: string }) => p.platform === 'instagram').length;
          const fbPosts = posts.filter((p: { platform: string }) => p.platform === 'facebook').length;
          const twPosts = posts.filter((p: { platform: string }) => p.platform === 'twitter').length;
          setStats({
            instagram: { posts: igPosts, engagement: '-', reach: '-' },
            facebook: { posts: fbPosts, engagement: '-', reach: '-' },
            twitter: { posts: twPosts, engagement: '-', reach: '-' },
          });
        }
      } catch {
        // Keep defaults on error
      }
    };
    fetchStats();
  }, []);

  const handleGeneratePost = async () => {
    if (!productName || !productDescription) {
      toast.error('Please fill in product name and description');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/ai-marketing/generate-social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            name: productName,
            description: productDescription,
            price: parseFloat(productPrice) || 0,
            category: 'Fishing Apparel',
          },
          platform,
          tone: 'enthusiastic',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate post');
      }

      const data = await response.json();

      const newPost: GeneratedPost = {
        id: `post_${Date.now()}`,
        platform,
        caption: data.caption,
        hashtags: data.hashtags || [],
        status: 'draft',
        createdAt: new Date(),
      };

      setGeneratedPosts(prev => [newPost, ...prev]);
      toast.success('Post generated with AI!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate post');
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async (post: GeneratedPost) => {
    try {
      const response = await fetch('/api/admin/ai-marketing/schedule-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: post.platform,
          caption: post.caption,
          hashtags: post.hashtags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule post');
      }

      const data = await response.json();
      toast.success(`Post scheduled for ${post.platform}!`);
      setGeneratedPosts(prev =>
        prev.map(p => p.id === post.id
          ? { ...p, status: 'scheduled', scheduledAt: new Date(data.post.scheduledAt) }
          : p
        )
      );
    } catch {
      toast.error('Failed to schedule post');
    }
  };

  const handlePublishNow = async (post: GeneratedPost) => {
    toast.success(`Post published to ${post.platform}!`);
    setGeneratedPosts(prev => 
      prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p)
    );
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast.success('Caption copied to clipboard!');
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'facebook': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'twitter': return 'bg-sky-100 text-sky-700 border-sky-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const navigateToAnalytics = (platform: string) => {
    router.push(`/admin/analytics?platform=${platform}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#001F3F]">Social Media Manager</h1>
          <p className="text-slate-600 mt-1">Generate and schedule posts with AI</p>
        </div>
        <Button className="bg-[#001F3F] hover:bg-[#002D5C]">
          <ExternalLink className="w-4 h-4 mr-2" />
          View All Posts
        </Button>
      </div>

      {/* Quick Stats - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-pink-500"
          onClick={() => navigateToAnalytics('instagram')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Instagram</p>
                  <p className="text-2xl font-bold text-[#001F3F]">{stats.instagram.posts} posts</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-pink-500" />
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-slate-500">Engagement: <strong className="text-slate-700">{stats.instagram.engagement}</strong></span>
              <span className="text-slate-500">Reach: <strong className="text-slate-700">{stats.instagram.reach}</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-blue-500"
          onClick={() => navigateToAnalytics('facebook')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Facebook</p>
                  <p className="text-2xl font-bold text-[#001F3F]">{stats.facebook.posts} posts</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-slate-500">Engagement: <strong className="text-slate-700">{stats.facebook.engagement}</strong></span>
              <span className="text-slate-500">Reach: <strong className="text-slate-700">{stats.facebook.reach}</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-sky-500"
          onClick={() => navigateToAnalytics('twitter')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-100 rounded-xl">
                  <Twitter className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Twitter/X</p>
                  <p className="text-2xl font-bold text-[#001F3F]">{stats.twitter.posts} posts</p>
                </div>
              </div>
              <TrendingUp className="w-5 h-5 text-sky-500" />
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-slate-500">Engagement: <strong className="text-slate-700">{stats.twitter.engagement}</strong></span>
              <span className="text-slate-500">Reach: <strong className="text-slate-700">{stats.twitter.reach}</strong></span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Generator */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF4500]" />
            Generate AI-Powered Post
          </CardTitle>
          <CardDescription>Create engaging social media content for your fishing apparel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Fishing Shirt Pro"
              />
            </div>
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="49.99"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Product Description *</Label>
            <Textarea
              id="description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Describe your fishing apparel product..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="platform">Platform</Label>
            <Select value={platform} onValueChange={(val: string) => setPlatform(val as 'instagram' | 'facebook' | 'twitter')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </div>
                </SelectItem>
                <SelectItem value="facebook">
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </div>
                </SelectItem>
                <SelectItem value="twitter">
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter/X
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGeneratePost}
            disabled={loading || !productName || !productDescription}
            className="w-full bg-gradient-to-r from-[#001F3F] to-[#FF4500] hover:from-[#002D5C] hover:to-[#FF5722]"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Post with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Posts */}
      {generatedPosts.length > 0 && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#FF4500]" />
              Generated Posts ({generatedPosts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedPosts.map((post) => (
              <div key={post.id} className="p-4 border border-slate-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(post.platform)}`}>
                      {getPlatformIcon(post.platform)}
                    </div>
                    <div>
                      <span className="font-semibold capitalize text-[#001F3F]">{post.platform}</span>
                      <Badge className="ml-2" variant="outline">
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCaption(post.caption)}
                    >
                      Copy
                    </Button>
                    {post.status === 'draft' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSchedulePost(post)}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handlePublishNow(post)}
                        >
                          Publish Now
                        </Button>
                      </>
                    )}
                    {post.status === 'scheduled' && (
                      <Button
                        size="sm"
                        className="bg-[#001F3F] hover:bg-[#002D5C]"
                        onClick={() => handlePublishNow(post)}
                      >
                        Publish Now
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="text-xs bg-[#001F3F]/10 text-[#001F3F] px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-slate-500">
                  Created: {post.createdAt.toLocaleString()}
                  {post.scheduledAt && ` • Scheduled for: ${post.scheduledAt.toLocaleString()}`}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
