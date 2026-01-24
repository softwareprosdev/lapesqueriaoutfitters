'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadProductImage } from '@/app/actions/upload';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  onRemove?: () => void;
  label?: string;
  helperText?: string;
}

export function ImageUpload({
  onUploadComplete,
  currentImage,
  onRemove,
  label = 'Upload Image',
  helperText = 'Drag and drop an image or click to browse (max 50MB, auto-converted to WebP)',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (uploading) {
      setProgress(0);
      setStatusText('Uploading...');
      // Simulate progress
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          if (prev > 60) setStatusText('Converting to WebP...');
          return prev + 10;
        });
      }, 500);
    } else {
      setProgress(0);
      setStatusText('');
    }
    return () => clearInterval(interval);
  }, [uploading]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProductImage(formData);

      if (result.success && result.url) {
        setProgress(100);
        setStatusText('Done!');
        onUploadComplete(result.url);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</label>

      {currentImage ? (
        <div className="relative">
          {/* Using standard img tag for reliable admin preview with Vercel Blob URLs */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800"
            onError={(e) => {
              // Show placeholder on error
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE5MiIgaGVpZ2h0PSIxOTIiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNODAgODBINjRWNjRIODBWODBaTTEyOCA4MEgxMTJWNjRIMTI4VjgwWk04MCAxMjhINjRWMTEySDgwVjEyOFpNMTI4IDEyOEgxMTJWMTEySDEyOFYxMjhaIiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+';
            }}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={uploading}
              className="bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-gray-100"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {progress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </>
              )}
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRemove}
                className="bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 dark:border-slate-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800/50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{statusText}</p>
              {/* Progress Bar */}
              <div className="w-full max-w-[200px] mx-auto h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Drag and drop your image here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{helperText}</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
        onChange={handleChange}
        disabled={uploading}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
