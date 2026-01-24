import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Edit, Search, FileText, Eye } from 'lucide-react';
import { DeleteBlogPostButton } from '@/components/admin/DeleteBlogPostButton';
import { Prisma } from '@prisma/client';

async function getBlogPosts(searchQuery?: string, status?: string, category?: string) {
  try {
    const where: Prisma.BlogPostWhereInput = {};

    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { excerpt: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    if (status === 'published') {
      where.published = true;
    } else if (status === 'draft') {
      where.published = false;
    }

    if (category) {
      where.category = category;
    }

    return await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch {
    // Return empty array if table doesn't exist yet (new database)
    return [];
  }
}

async function getCategories() {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        category: true,
      },
    });

    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))];
    return categories;
  } catch {
    // Return empty array if table doesn't exist yet (new database)
    return [];
  }
}

export default async function BlogManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; category?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'STAFF')) {
    redirect('/admin/login');
  }

  const params = await searchParams;
  const posts = await getBlogPosts(params.search, params.status, params.category);
  const categories = await getCategories();

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
            Blog Management
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Manage your conservation blog posts and content
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Posts</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {posts.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Published</CardTitle>
            <Eye className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {publishedCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Drafts</CardTitle>
            <Edit className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {draftCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200/60 shadow-lg">
        <CardContent className="pt-6">
          <form className="flex flex-col md:flex-row gap-4" method="get">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="search"
                placeholder="Search by title or excerpt..."
                defaultValue={params.search}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <select
              name="status"
              defaultValue={params.status || ''}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <select
              name="category"
              defaultValue={params.category || ''}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat || ''}>
                  {cat}
                </option>
              ))}
            </select>

            <Button type="submit" className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
              <Search className="h-4 w-4 mr-2" />
              Filter
            </Button>

            {(params.search || params.status || params.category) && (
              <Link href="/admin/blog">
                <Button variant="outline" type="button">
                  Clear
                </Button>
              </Link>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Blog Posts Table */}
      <Card className="border-slate-200/60 shadow-xl">
        <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-600" />
            All Blog Posts ({posts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4 text-lg">No blog posts yet</p>
              <Link href="/admin/blog/new">
                <Button className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first blog post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left">
                    <th className="p-4 font-semibold text-slate-700">Title</th>
                    <th className="p-4 font-semibold text-slate-700">Category</th>
                    <th className="p-4 font-semibold text-slate-700">Status</th>
                    <th className="p-4 font-semibold text-slate-700">Author</th>
                    <th className="p-4 font-semibold text-slate-700">Date</th>
                    <th className="p-4 font-semibold text-slate-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-slate-900">{post.title}</div>
                          {post.featured && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-cyan-100 text-cyan-700 text-xs rounded-full border border-cyan-200">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {post.category ? (
                          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full font-medium">
                            {post.category}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">No category</span>
                        )}
                      </td>
                      <td className="p-4">
                        {post.published ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200 font-semibold">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs rounded-full border border-amber-200 font-semibold">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {post.author?.name || 'Unknown'}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button variant="outline" size="sm" className="hover:bg-cyan-50 hover:border-cyan-300">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Link href={`/admin/blog/${post.id}/edit`}>
                            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <DeleteBlogPostButton postId={post.id} postTitle={post.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
