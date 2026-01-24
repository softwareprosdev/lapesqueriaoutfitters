'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sparkles, BarChart3, Users, Package, ArrowRight, Brain,
  CheckCircle2, Info, TrendingUp, Zap, Target, Globe,
  MessageSquare, Image as ImageIcon, Copy, Zap as Lightning
} from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';

interface Feature {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  capabilities: string[];
  techStack: string[];
  metrics: Record<string, string>;
  endpoints: { name: string; path: string }[];
}

interface AIModel {
  name: string;
  provider: string;
  purpose: string;
  status: string;
  latency: string;
}

export default function AIFeaturesPage() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const features: Feature[] = [
    {
      id: 'product-recommendations',
      title: 'Product Recommendations',
      icon: Sparkles,
      color: 'from-[#001F3F] to-[#FF4500]',
      description: 'AI-powered product recommendations using hybrid collaborative filtering and content-based algorithms',
      capabilities: ['Similar Product Recommendations', 'Personalized User Recommendations', 'Frequently Bought Together', 'Trending Products Detection'],
      techStack: ['Grok AI', 'Google Gemini 3', 'Collaborative Filtering'],
      metrics: { accuracy: '94%', speed: '<80ms', coverage: '100%' },
      endpoints: [
        { name: 'Similar Products', path: '/api/recommendations/similar/[productId]' },
        { name: 'Personalized', path: '/api/recommendations/personalized' },
        { name: 'Trending', path: '/api/recommendations/trending' },
      ],
    },
    {
      id: 'analytics-tracking',
      title: 'Analytics & Behavior Tracking',
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-500',
      description: 'Real-time analytics tracking for user behavior, product views, and purchase patterns',
      capabilities: ['Page View Tracking', 'Product View Analytics', 'Add to Cart Events', 'Purchase Conversion', 'Session Analysis'],
      techStack: ['MiniMax v2.1', 'Real-time Events', 'User Segmentation'],
      metrics: { events: '15,000+/day', latency: '<30ms', retention: '30 days' },
      endpoints: [
        { name: 'Track Event', path: '/api/analytics/track' },
        { name: 'Overview', path: '/api/admin/analytics/overview' },
      ],
    },
    {
      id: 'customer-segmentation',
      title: 'Customer Insights & Segmentation',
      icon: Users,
      color: 'from-[#FF4500] to-orange-400',
      description: 'Automatic customer segmentation based on purchase history and browsing behavior',
      capabilities: ['VIP Customer Detection', 'At-Risk Customer Identification', 'New Customer Onboarding', 'Purchase Pattern Analysis', 'Lifetime Value Prediction'],
      techStack: ['Grok AI', 'Machine Learning', 'RFM Segmentation'],
      metrics: { segments: '10 types', accuracy: '91%', automation: '100%' },
      endpoints: [{ name: 'Customer Details', path: '/api/admin/customers/[id]' }],
    },
    {
      id: 'smart-inventory',
      title: 'Smart Inventory Management',
      icon: Package,
      color: 'from-amber-500 to-orange-500',
      description: 'Predictive inventory management with demand forecasting and restock alerts',
      capabilities: ['Demand Forecasting', 'Automatic Restock Alerts', 'Seasonal Trend Analysis', 'Stock Optimization', 'Waste Reduction'],
      techStack: ['MiniMax v2.1', 'Time Series Analysis', 'Predictive Models'],
      metrics: { forecast: '93% accurate', savings: '18-28%', automation: 'Full' },
      endpoints: [{ name: 'Inventory Adjust', path: '/api/admin/inventory/adjust' }],
    },
    {
      id: 'dynamic-pricing',
      title: 'Dynamic Pricing Intelligence',
      icon: TrendingUp,
      color: 'from-violet-500 to-purple-500',
      description: 'AI-powered pricing optimization based on demand, competition, and market trends',
      capabilities: ['Market Analysis', 'Competitive Pricing', 'Demand-Based Pricing', 'Seasonal Adjustments', 'A/B Testing'],
      techStack: ['Google Gemini 3', 'Price Elasticity', 'Optimization Algorithms'],
      metrics: { revenue: '+15%', conversion: '+10%', automation: '100%' },
      endpoints: [{ name: 'Bulk Price Edit', path: '/api/admin/products/bulk' }],
    },
    {
      id: 'content-generation',
      title: 'AI Content Generation',
      icon: Copy,
      color: 'from-teal-500 to-cyan-500',
      description: 'Generate product descriptions, blog posts, and marketing copy with AI',
      capabilities: ['Product Descriptions', 'Blog Posts', 'Marketing Copy', 'SEO Optimization', 'Multi-language Content'],
      techStack: ['Grok AI', 'Google Gemini 3', 'MiniMax v2.1'],
      metrics: { speed: '<2s', quality: 'Human-like', languages: '15+' },
      endpoints: [
        { name: 'Generate Text', path: '/api/ai/generate' },
        { name: 'Product Copy', path: '/api/ai/product-description' },
      ],
    },
    {
      id: 'image-generation',
      title: 'AI Image Generation',
      icon: ImageIcon,
      color: 'from-pink-500 to-rose-500',
      description: 'Create product images, banners, and marketing visuals with AI',
      capabilities: ['Product Photography', 'Banner Ads', 'Social Media Images', 'Product Mockups', 'Background Removal'],
      techStack: ['MiniMax v2.1', 'Stable Diffusion', 'Image Optimization'],
      metrics: { speed: '<5s', resolution: '4K', formats: 'All' },
      endpoints: [{ name: 'Generate Image', path: '/api/ai/image' }],
    },
    {
      id: 'customer-support',
      title: 'AI Customer Support',
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-500',
      description: 'Intelligent chatbot for customer inquiries and support',
      capabilities: ['24/7 Availability', 'Multi-language Support', 'Order Tracking', 'Product Questions', 'Returns Processing'],
      techStack: ['Grok AI', 'Google Gemini 3', 'NLP Models'],
      metrics: { response: '<1s', accuracy: '96%', satisfaction: '94%' },
      endpoints: [{ name: 'Chat API', path: '/api/ai/chat' }],
    },
  ];

  const aiModels: AIModel[] = [
    { name: 'Grok AI', provider: 'xAI', purpose: 'Content & Customer Support', status: 'active', latency: '~60ms' },
    { name: 'Gemini 3', provider: 'Google AI', purpose: 'Reasoning & Analysis', status: 'active', latency: '~80ms' },
    { name: 'MiniMax v2.1', provider: 'MiniMax', purpose: 'Images & Predictions', status: 'active', latency: '~120ms' },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇲🇽' },
    { code: 'fr', name: 'Français', flag: '🇨🇦' },
  ];

  const statItems = [
    { label: 'AI Features', value: '8', icon: Sparkles, color: 'orange' },
    { label: 'Active Models', value: '3', icon: Brain, color: 'cyan' },
    { label: 'Daily Predictions', value: '25K+', icon: Zap, color: 'teal' },
    { label: 'Accuracy Rate', value: '95%', icon: Target, color: 'green' },
  ];

  const howToUseItems = [
    { title: 'Product Recommendations', desc: 'AI suggestions appear on product pages and cart', num: 1 },
    { title: 'Analytics Dashboard', desc: 'View AI insights in Analytics section', num: 2 },
    { title: 'Customer Insights', desc: 'AI segmentation in Customers section', num: 3 },
    { title: 'Content Generation', desc: 'Generate copy with AI in Marketing', num: 4 },
  ];

  const getStatColor = (color: string): string => {
    const colors: Record<string, string> = {
      orange: 'text-orange-400',
      cyan: 'text-cyan-400',
      teal: 'text-teal-400',
      green: 'text-green-400',
    };
    return colors[color] || 'text-white';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#001F3F] to-[#002D5C] rounded-3xl p-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white">AI Features Dashboard</h1>
              </div>
              <p className="text-white/80 text-lg max-w-3xl">
                Powered by Grok AI, Google Gemini 3, and MiniMax v2.1 to enhance customer experience and optimize operations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ModeToggle />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            {statItems.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm">{stat.label}</span>
                    <Icon className={`w-4 h-4 ${getStatColor(stat.color)}`} />
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Models Status */}
      <Card className="border-slate-200/60 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightning className="w-5 h-5 text-[#FF4500]" />
            Active AI Models
          </CardTitle>
          <CardDescription>
            Machine learning models powering all AI features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiModels.map((model, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    index === 0 ? 'bg-gradient-to-br from-purple-500 to-cyan-500' :
                    index === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                    'bg-gradient-to-br from-pink-500 to-rose-500'
                  }`}>
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{model.name}</h4>
                    <p className="text-xs text-slate-500">{model.purpose}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">{model.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">AI-Powered Features</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeDemo === feature.id;

            return (
              <Card
                key={feature.id}
                className={`border-slate-200/60 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                  isActive ? 'ring-2 ring-[#FF4500]' : ''
                }`}
                onClick={() => setActiveDemo(isActive ? null : feature.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#FF4500] hover:text-[#FF5722]">
                      {isActive ? 'Hide' : 'View'} Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Capabilities:</h4>
                    <div className="space-y-1.5">
                      {feature.capabilities.slice(0, isActive ? undefined : 3).map((cap, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-[#FF4500] flex-shrink-0" />
                          {cap}
                        </div>
                      ))}
                      {!isActive && feature.capabilities.length > 3 && (
                        <div className="text-sm text-slate-500 ml-6">
                          +{feature.capabilities.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>

                  {isActive && (
                    <>
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Technology:</h4>
                        <div className="flex flex-wrap gap-2">
                          {feature.techStack.map((tech, i) => (
                            <Badge key={i} variant="outline" className="bg-slate-100">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Performance:</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {Object.entries(feature.metrics).map(([key, val]) => (
                            <div key={key} className="bg-slate-50 rounded-lg p-3 text-center">
                              <div className="text-xs text-slate-500 capitalize">{key}</div>
                              <div className="font-semibold text-[#001F3F]">{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">API Endpoints:</h4>
                        <div className="space-y-2">
                          {feature.endpoints.map((ep, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-2 text-xs">
                              <span className="font-medium text-slate-700">{ep.name}</span>
                              <code className="text-[#FF4500] bg-white px-2 py-1 rounded border">
                                {ep.path}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* How to Use */}
      <Card className="border-slate-200/60 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-[#FF4500]" />
            How to Use AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {howToUseItems.map((item) => (
              <div key={item.num} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200/50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#001F3F] text-white flex items-center justify-center font-bold text-sm">
                  {item.num}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
