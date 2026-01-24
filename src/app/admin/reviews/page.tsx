'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
  isApproved: boolean;
  isRejected: boolean;
  moderatedAt?: string | null;
  moderatedBy?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    images: Array<{
      url: string;
      alt: string | null;
    }>;
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

interface ReviewSummary {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  averageRating: number;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    totalReviews: 0,
    pendingReviews: 0,
    approvedReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setSummary(data.summary);
      } else {
        toast.error(data.error || 'Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleReviewAction(reviewId: string, action: 'approve' | 'reject' | 'delete') {
    const confirmMessage =
      action === 'delete'
        ? 'Are you sure you want to delete this review? This action cannot be undone.'
        : `Are you sure you want to ${action} this review?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, action }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Review ${action}d successfully`);
        fetchReviews();
      } else {
        toast.error(data.error || `Failed to ${action} review`);
      }
    } catch (error) {
      console.error('Review action error:', error);
      toast.error(`Failed to ${action} review`);
    }
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  }

  const statusCounts = {
    all: summary.totalReviews,
    pending: summary.pendingReviews,
    approved: summary.approvedReviews,
    rejected: summary.totalReviews - summary.pendingReviews - summary.approvedReviews,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">Review Moderation</h1>
        <p className="text-slate-600 text-lg">Approve, reject, or delete product reviews</p>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-cyan-200/30 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Reviews</CardTitle>
            <div className="p-2 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg">
              <MessageSquare className="h-4 w-4 text-cyan-700" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">{summary.totalReviews}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200/60 shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-300/40 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">Pending Review</CardTitle>
            <div className="p-2 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg">
              <Eye className="h-4 w-4 text-amber-700" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">{summary.pendingReviews}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200/60 shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/40 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">Approved</CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-700" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">{summary.approvedReviews}</div>
            <p className="text-xs text-slate-500 mt-1">Published</p>
          </CardContent>
        </Card>

        <Card className="border-violet-200/60 shadow-lg shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-300/40 transition-all duration-300 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-semibold text-slate-700">Average Rating</CardTitle>
            <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg">
              <Star className="h-4 w-4 text-violet-700 fill-violet-700" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{summary.averageRating.toFixed(1)}</div>
            <p className="text-xs text-slate-500 mt-1">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Status Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`group px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative overflow-hidden ${
              statusFilter === status
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-300/50'
                : 'bg-white text-slate-700 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-teal-50 border border-slate-200 hover:border-cyan-300 hover:shadow-md'
            }`}
          >
            <span className="relative z-10">{status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})</span>
            {statusFilter !== status && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/0 via-cyan-100/30 to-cyan-100/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            )}
          </button>
        ))}
      </div>

      {/* Enhanced Reviews List */}
      <div className="space-y-5">
        {loading ? (
          <Card className="border-slate-200/60 shadow-lg">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-600 border-r-transparent mb-4"></div>
                <p className="text-slate-600 font-medium">Loading reviews...</p>
              </div>
            </CardContent>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="border-slate-200/60 shadow-lg bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="py-16">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium text-lg">
                  No {statusFilter !== 'all' ? statusFilter : ''} reviews found
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden border-slate-200/60 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-cyan-200/30 transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative">
                <div className="flex gap-6">
                  {/* Product Image */}
                  {review.product.images[0]?.url && (
                    <div className="flex-shrink-0">
                      <div className="relative group/image">
                        <Image
                          src={review.product.images[0].url}
                          alt={review.product.images[0].alt || review.product.name}
                          width={100}
                          height={100}
                          className="rounded-xl object-cover ring-2 ring-slate-200/60 group-hover/image:ring-cyan-300/50 transition-all duration-300 shadow-md"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-teal-500/0 group-hover/image:from-cyan-500/10 group-hover/image:to-teal-500/10 rounded-xl transition-all duration-300"></div>
                      </div>
                    </div>
                  )}

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-cyan-900 transition-colors">{review.product.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          {renderStars(review.rating)}
                          <span className="text-sm font-semibold text-slate-600 px-2 py-0.5 bg-slate-100 rounded-full">
                            {review.rating.toFixed(1)} / 5.0
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {review.isApproved && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </span>
                        )}
                        {review.isRejected && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                            <XCircle className="h-3 w-3" />
                            Rejected
                          </span>
                        )}
                        {!review.isApproved && !review.isRejected && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                            <Eye className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-slate-700 mb-5 whitespace-pre-wrap leading-relaxed">{review.body}</p>

                    {/* User & Date Info */}
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-5 p-3 bg-slate-50/50 rounded-lg border border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold text-xs">
                          {(review.user?.name || review.customerName)?.charAt(0).toUpperCase() || 'G'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {review.user?.name || review.customerName || 'Guest'}
                          </span>
                          <span className="text-xs text-slate-500">
                            {review.user?.email || review.customerEmail || 'No email'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Moderation Info */}
                    {review.moderatedAt && (
                      <div className="text-xs text-slate-500 mb-4 flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/60 w-fit">
                        <CheckCircle className="h-3 w-3" />
                        <span>Moderated on {new Date(review.moderatedAt).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!review.isApproved && (
                        <Button
                          onClick={() => handleReviewAction(review.id, 'approve')}
                          size="sm"
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-200/50 transition-all duration-200"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-semibold">Approve</span>
                        </Button>
                      )}
                      {!review.isRejected && (
                        <Button
                          onClick={() => handleReviewAction(review.id, 'reject')}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 border-red-300 hover:border-red-400 transition-all duration-200"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="font-semibold">Reject</span>
                        </Button>
                      )}
                      <Button
                        onClick={() => handleReviewAction(review.id, 'delete')}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="font-semibold">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
