'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ImageUpload } from '@/components/admin/ImageUpload';
import toast from 'react-hot-toast';

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    category: '',
    tags: [] as string[],
    featured: false,
    published: false,
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/blog/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        const post = await response.json();
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content,
          featuredImage: post.featuredImage || '',
          category: post.category || '',
          tags: post.tags || [],
          featured: post.featured,
          published: post.published,
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to load blog post');
        router.push('/admin/blog');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, router]);

  const handleTitleChange = (title: string) => {
    // Only auto-generate slug if it's currently empty or matches the old title
    // But since this is edit, we probably shouldn't auto-update slug unless explicitly cleared
    setFormData(prev => ({ ...prev, title }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  const handleSubmit = async (publishStatus?: boolean) => {
    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Please fill in all required fields (Title, Slug, and Content)');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          published: publishStatus !== undefined ? publishStatus : formData.published,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update blog post');
      }

      toast.success('Blog post updated successfully!');
      router.push('/admin/blog');
      router.refresh();
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
              Edit Blog Post
            </h1>
            <p className="text-slate-600 mt-2">Update your conservation story</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)} // Save as draft
            disabled={saving}
            className="hover:bg-slate-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={() => handleSubmit(true)} // Publish
            disabled={saving}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
          >
            <Eye className="h-4 w-4 mr-2" />
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle>Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog post title"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  URL: /blog/{formData.slug || 'your-post-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief summary of your blog post"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle>
                Content <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your blog post content here..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-base">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ImageUpload
                currentImage={formData.featuredImage}
                onUploadComplete={(url) => setFormData({ ...formData, featuredImage: url })}
                onRemove={() => setFormData({ ...formData, featuredImage: '' })}
                label="Featured Image"
              />
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-base">Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Conservation, Wildlife"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag"
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm border border-cyan-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-cyan-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-cyan-600 border-slate-300 rounded focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium text-slate-700">Feature this post</span>
              </label>
              <p className="text-xs text-slate-500 mt-1 ml-6">
                Featured posts appear prominently on the blog page
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}