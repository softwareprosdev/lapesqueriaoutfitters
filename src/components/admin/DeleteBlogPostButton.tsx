'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteBlogPostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeleteBlogPostButton({ postId, postTitle }: DeleteBlogPostButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete blog post');
      }
    } catch {
      alert('Failed to delete blog post');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
    >
      <Trash2 className="h-3 w-3 mr-1" />
      {deleting ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
