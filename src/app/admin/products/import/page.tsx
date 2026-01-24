'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Download, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImportProductsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    created: number;
    failed: number;
    createdProducts?: string[];
    errors?: { slug: string; error: string }[];
  } | null>(null);

  async function handleImport() {
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.invalid) {
          toast.error(`Validation failed: ${data.invalid.length} invalid rows`);
          setResult({
            success: false,
            created: 0,
            failed: data.invalid.length,
            errors: data.invalid.map((inv: { row: number; errors: string[] }) => ({
              slug: `Row ${inv.row}`,
              error: inv.errors.join(', '),
            })),
          });
        } else {
          throw new Error(data.error || 'Import failed');
        }
        return;
      }

      setResult(data);
      if (data.created > 0) {
        toast.success(`Successfully imported ${data.created} products!`);
      }
      if (data.failed > 0) {
        toast.error(`${data.failed} products failed to import`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import products');
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const template = `name,slug,description,basePrice,categorySlug,images,conservationPercentage,conservationFocus,featured,variantName,variantSku,variantPrice,variantStock,variantSize,variantColor,variantMaterial
Ocean Wave Bracelet,ocean-wave-bracelet,"Beautiful blue and white bracelet inspired by ocean waves",29.99,ocean-collection,https://images.unsplash.com/photo-1611591437281-460bfbe1220a,10,Sea Turtle Conservation,true,Standard,ocean-wave-std,29.99,50,Standard,Blue & White,Glass Beads
Ocean Wave Bracelet,ocean-wave-bracelet,"Beautiful blue and white bracelet inspired by ocean waves",29.99,ocean-collection,https://images.unsplash.com/photo-1611591437281-460bfbe1220a,10,Sea Turtle Conservation,true,Large,ocean-wave-lg,34.99,30,Large,Blue & White,Glass Beads`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Import Products from CSV</h1>
        <p className="text-gray-600 mt-1">
          Upload a CSV file to bulk import products and variants
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructions</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Download the CSV template to see the required format</li>
          <li>Fill in your product data (one row per variant)</li>
          <li>Products with the same slug will be grouped with multiple variants</li>
          <li>Make sure category slugs exist before importing</li>
          <li>Upload the completed CSV file</li>
        </ol>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4"
        >
          <Download className="w-4 h-4" />
          Download CSV Template
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="csv-upload"
          />

          <label
            htmlFor="csv-upload"
            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg cursor-pointer transition-colors"
          >
            Choose CSV File
          </label>

          {file && (
            <div className="mt-4 text-gray-700">
              <p className="font-medium">Selected: {file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleImport}
            disabled={!file || importing}
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? 'Importing...' : 'Import Products'}
          </button>
          <button
            onClick={() => {
              setFile(null);
              setResult(null);
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">Successfully Imported</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{result.created}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">Failed</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{result.failed}</p>
            </div>
          </div>

          {result.createdProducts && result.createdProducts.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Created Products:</h4>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {result.createdProducts.map((slug) => (
                    <li key={slug}>{slug}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Errors:</h4>
              <div className="bg-red-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <ul className="space-y-2">
                  {result.errors.map((err, index) => (
                    <li key={index} className="text-red-700">
                      <span className="font-medium">{err.slug}:</span> {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/admin/products')}
            className="mt-6 w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700"
          >
            View Products
          </button>
        </div>
      )}
    </div>
  );
}
