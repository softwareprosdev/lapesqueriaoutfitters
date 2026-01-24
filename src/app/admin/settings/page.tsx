'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface SiteSettings {
  id: string;
  siteName: string;
  logo: string | null;
  tagline: string | null;
  primaryColor: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState<SiteSettings>({
    id: '',
    siteName: "La Pesqueria's Studio",
    logo: null,
    tagline: null,
    primaryColor: '#3B82F6',
    email: null,
    phone: null,
    address: null,
    facebook: null,
    instagram: null,
    twitter: null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Thanks beautiful La Pesqueria I love you!');
        await fetchSettings();

        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorMsg = data.error || 'Failed to save settings';
        const details = data.details ? `\n${data.details}` : '';
        setMessage(`✗ ${errorMsg}${details}`);
        console.error('Settings save error:', data);
      }
    } catch (error: unknown) {
      setMessage(`✗ Network error: ${error instanceof Error ? error.message : 'Failed to save settings'}`);
      console.error('Settings save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-gray-600 mt-1">Update your site branding and contact information</p>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded ${message.includes('success') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleInputChange}
                placeholder="La Pesqueria's Studio"
              />
            </div>

            <ImageUpload
              label="Site Logo"
              helperText="Upload your logo (max 5MB, PNG or SVG recommended)"
              currentImage={formData.logo || undefined}
              onUploadComplete={(url) => setFormData(prev => ({ ...prev, logo: url }))}
              onRemove={() => setFormData(prev => ({ ...prev, logo: null }))}
            />

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline || ''}
                onChange={handleInputChange}
                placeholder="Ocean-themed handcrafted bracelets"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="w-20 h-10"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                placeholder="hello@lapesqueria.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                placeholder="123 Ocean Drive, South Padre Island, TX"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                name="facebook"
                value={formData.facebook || ''}
                onChange={handleInputChange}
                placeholder="https://facebook.com/lapesqueria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleInputChange}
                placeholder="https://instagram.com/lapesqueria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter URL</Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.twitter || ''}
                onChange={handleInputChange}
                placeholder="https://twitter.com/lapesqueria"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
