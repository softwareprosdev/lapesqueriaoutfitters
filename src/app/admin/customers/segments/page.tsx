'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, Users, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

interface CustomerTag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  isAutomatic: boolean;
  customerCount: number;
  isActive: boolean;
}

interface CustomerSegment {
  id: string;
  name: string;
  description: string | null;
  rules: Record<string, unknown>;
  customerCount: number;
  isActive: boolean;
}

export default function CustomerSegmentsPage() {
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tagsRes, segmentsRes] = await Promise.all([
        fetch('/api/admin/customers/tags'),
        fetch('/api/admin/customers/segments'),
      ]);

      if (tagsRes.ok) {
        const data = await tagsRes.json();
        setTags(data.tags || []);
      }
      if (segmentsRes.ok) {
        const data = await segmentsRes.json();
        setSegments(data.segments || []);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveTag = async (formData: Partial<CustomerTag>) => {
    try {
      const response = await fetch('/api/admin/customers/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create tag');
      }

      toast.success('Tag created successfully');
      setTagDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create tag');
    }
  };

  const handleSaveSegment = async (formData: Partial<CustomerSegment>) => {
    try {
      const response = await fetch('/api/admin/customers/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create segment');
      }

      toast.success('Segment created successfully');
      setSegmentDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create segment');
    }
  };

  const toggleTagActive = async (tag: CustomerTag) => {
    try {
      await fetch(`/api/admin/customers/tags`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: tag.id, isActive: !tag.isActive }),
      });
      toast.success(`Tag ${tag.isActive ? 'disabled' : 'enabled'}`);
      fetchData();
    } catch {
      toast.error('Failed to update tag');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Segmentation</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize customers with tags and create targeted segments
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveTag({
                    name: formData.get('name') as string,
                    color: formData.get('color') as string,
                    description: formData.get('description') as string,
                    isAutomatic: formData.get('isAutomatic') === 'on',
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Tag Name</Label>
                  <Input id="name" name="name" required placeholder="e.g., VIP, Loyal Customer" />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" type="color" defaultValue="#3B82F6" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Optional description" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isAutomatic" name="isAutomatic" />
                  <Label htmlFor="isAutomatic">Auto-apply based on rules</Label>
                </div>
                <Button type="submit" className="w-full">Create Tag</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={segmentDialogOpen} onOpenChange={setSegmentDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Segment</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveSegment({
                    name: formData.get('name') as string,
                    description: formData.get('description') as string,
                    rules: {},
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="name">Segment Name</Label>
                  <Input id="name" name="name" required placeholder="e.g., High Value Customers" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="Optional description" />
                </div>
                <Button type="submit" className="w-full">Create Segment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.filter(t => t.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments.filter(s => s.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Customers Tagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.reduce((sum, t) => sum + t.customerCount, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-teal-500" />
              Customer Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : tags.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No tags created yet</div>
            ) : (
              <div className="space-y-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{tag.name}</p>
                        <p className="text-sm text-gray-500">{tag.customerCount} customers</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tag.isAutomatic && (
                        <Badge variant="secondary">Auto</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTagActive(tag)}
                      >
                        {tag.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Customer Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : segments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No segments created yet</div>
            ) : (
              <div className="space-y-3">
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="p-3 rounded-lg border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900 dark:text-white">{segment.name}</p>
                      <Badge variant={segment.isActive ? 'default' : 'secondary'}>
                        {segment.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {segment.description && (
                      <p className="text-sm text-gray-500 mb-2">{segment.description}</p>
                    )}
                    <p className="text-sm text-gray-500">{segment.customerCount} customers</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
