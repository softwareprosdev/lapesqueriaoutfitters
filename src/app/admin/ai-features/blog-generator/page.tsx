'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const AI_MODELS = {
  gemini: [
    { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
    { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
  ],
  claude: [
    { name: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku' },
    { name: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
    { name: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet' },
  ],
  huggingface: [
    { name: 'mistralai/Mixtral-8x7B-Instruct-v0.1', displayName: 'Mixtral 8x7B Instruct' },
    { name: 'meta-llama/Llama-2-70b-chat-hf', displayName: 'Llama 2 70B Chat' },
  ],
};

interface GeneratedBlog {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  category: string;
}

export default function BlogGeneratorPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    tone: 'Educational and Inspiring',
    length: 'medium',
    provider: 'gemini',
    model: AI_MODELS.gemini[0].name,
  });

  useEffect(() => {
    // When provider changes, set the model to the first available one for that provider
    setFormData(prev => ({
      ...prev,
      model: AI_MODELS[prev.provider as keyof typeof AI_MODELS][0].name
    }));
  }, [formData.provider]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setGeneratedBlog(null);

    try {
      const response = await fetch('/api/admin/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate blog');
      }

      setGeneratedBlog(data.blog);
      toast.success('Blog post generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate blog');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!generatedBlog) return;

    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedBlog.title,
          slug: generatedBlog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          content: generatedBlog.content,
          excerpt: generatedBlog.excerpt,
          tags: generatedBlog.tags,
          category: generatedBlog.category,
          published: false, // Always save as draft first
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      toast.success('Draft saved! Redirecting to editor...');
      const data = await response.json();
      router.push(`/admin/blog/${data.id}/edit`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save draft');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/ai-features">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-cyan-900 to-teal-900 bg-clip-text text-transparent">
            AI Blog Generator
          </h1>
          <p className="text-slate-600 mt-2">Create engaging content with Gemini, Claude, or Hugging Face</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200/60 shadow-lg">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">AI Provider</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="huggingface">Hugging Face</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                      {AI_MODELS[formData.provider as keyof typeof AI_MODELS].map((model) => (
                        <option key={model.name} value={model.name}>
                          {model.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
                  <textarea
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    rows={3}
                    placeholder="e.g., The importance of seagrass in the Gulf of Mexico"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="conservation, turtles, ocean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Educational and Inspiring">Educational & Inspiring</option>
                    <option value="Professional and Scientific">Professional & Scientific</option>
                    <option value="Casual and Friendly">Casual & Friendly</option>
                    <option value="Urgent and Persuasive">Urgent & Persuasive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Length</label>
                  <select
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="short">Short (~500 words)</option>
                    <option value="medium">Medium (~1000 words)</option>
                    <option value="long">Long (~1500 words)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200/60 shadow-lg h-full min-h-[600px] flex flex-col">
            <CardHeader className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex flex-row items-center justify-between">
              <CardTitle>Content Preview</CardTitle>
              {generatedBlog && (
                <Button onClick={handleSaveDraft} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6 flex-1 overflow-y-auto">
              {generatedBlog ? (
                <div className="prose max-w-none">
                  <h1>{generatedBlog.title}</h1>
                  <div className="flex gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{generatedBlog.category}</span>
                    {generatedBlog.tags.map((tag: string) => (
                      <span key={tag} className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                  <div className="italic text-slate-600 mb-6 border-l-4 border-slate-300 pl-4">
                    {generatedBlog.excerpt}
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generatedBlog.content }} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                  <p>Configure the AI settings and click generate to see the preview here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
