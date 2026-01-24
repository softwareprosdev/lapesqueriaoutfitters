'use client';

import { useState, useEffect } from 'react';
import { 
  Share2, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Copy, 
  Check,
  Instagram,
  Facebook,
  Twitter,
  Sparkles,
  ExternalLink,
  Megaphone,
  BarChart3,
  Users,
  Zap,
  Calendar,
  Gift,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Pre-built social media templates
const SOCIAL_TEMPLATES = {
  newProduct: {
    instagram: "🎣 NEW GEAR ALERT 🎣\n\nIntroducing our latest: {productName} 🐟\n\n💪 Built for Texas anglers\n🌊 Gulf Coast tested\n📍 Based in McAllen, TX\n\nLink in bio to shop!\n\n#FishingGear #TexasFishing #LaPesqueriaOutfitters #GulfCoast #TightLines #FishingApparel",
    facebook: "🎣 NEW ARRIVAL 🎣\n\nWe're excited to introduce our newest gear: {productName}!\n\nDesigned for serious anglers who demand quality. Perfect for those early morning trips on the Gulf Coast. 🐟💙\n\n✨ Shop now: {shopUrl}\n\n#FishingLife #TexasAngler",
    twitter: "🎣 Just dropped: {productName}\n\nBuilt for Texas anglers. Gulf Coast approved 🐟\n\nShop now → {shopUrl}\n\n#FishingGear #TexasFishing",
  },
  sale: {
    instagram: "🚨 SALE ALERT 🚨\n\n{discountPercent}% OFF everything this weekend! Use code: {discountCode}\n\n🎣 Quality fishing gear\n🌊 Gulf Coast tested\n🎁 Perfect for anglers\n\nDon't miss out! Link in bio 💙\n\n#Sale #FishingGear #TexasFishing #TightLines",
    facebook: "🎉 {discountPercent}% OFF SALE! 🎉\n\nUse code {discountCode} at checkout!\n\nStock up on quality fishing apparel and gear for your next trip. 🎣\n\nShop now: {shopUrl}",
    twitter: "🚨 {discountPercent}% OFF! Use code: {discountCode}\n\nQuality fishing gear for Texas anglers 🎣🌊\n\nShop: {shopUrl}",
  },
  conservation: {
    instagram: "🐟 FISHING REPORT UPDATE 🌊\n\nThe bite has been HOT! Check out what our community has been catching!\n\nShare your catches with us:\n🎣 Redfish\n🐟 Speckled Trout\n🦈 Shark\n\nTag us in your photos! Link in bio 💙\n\n#TexasFishing #GulfCoastFishing #FishingReport #CatchOfTheDay",
    facebook: "🌊 Fishing Season Update 🌊\n\nThe Gulf Coast fishing has been incredible this month!\n\nThank you for being part of the La Pesqueria community. We love seeing your catches! 🎣💙\n\nShop: {shopUrl}",
    twitter: "🌊 Fishing Report: The bite is ON!\n\nShare your Gulf Coast catches with us 🎣💙\n\n#TexasFishing #GulfCoast",
  },
  engagement: {
    instagram: "📸 CATCH OF THE MONTH 📸\n\nShow us your best catches wearing La Pesqueria gear!\n\n🏆 Winner gets FREE fishing shirt\n📌 Tag @lapesqueriaoutfitters\n#️⃣ Use #MyLaPesqueriaStyle\n\nContest ends {endDate}! 🎣\n\n#PhotoContest #FishingLife #TexasFishing #Giveaway",
    facebook: "📸 CATCH CONTEST! 📸\n\nWe want to see your biggest catches!\n\nHow to enter:\n1. Post a photo of your catch\n2. Tag @La Pesqueria Outfitters\n3. Use #MyLaPesqueriaStyle\n\n🏆 Winner receives FREE fishing apparel!\n\nContest ends {endDate}. Tight lines! 🎣",
    twitter: "📸 GIVEAWAY TIME!\n\nShow us your best catch!\n\n1. Follow @lapesqueriaoutfitters\n2. RT this post\n3. Tag a fishing buddy\n\n🏆 Win FREE fishing gear!\nEnds {endDate} 🎣",
  },
};

// Marketing tips database
const MARKETING_TIPS = [
  {
    title: "Post at Peak Times",
    description: "Instagram: 11am-1pm & 7pm-9pm. Facebook: 1pm-4pm. Best days: Wed, Thu, Fri.",
    icon: Calendar,
  },
  {
    title: "Use User-Generated Content",
    description: "Repost customer catch photos (with permission) - they get 4.5x more engagement than brand posts.",
    icon: Users,
  },
  {
    title: "Story Polls & Questions",
    description: "Instagram Stories with polls get 2x more DMs. Ask 'Where are you fishing this weekend?'",
    icon: MessageSquare,
  },
  {
    title: "Behind-the-Scenes Content",
    description: "Show local fishing spots and gear reviews! Authenticity drives 33% more engagement.",
    icon: Sparkles,
  },
  {
    title: "Limited Edition Drops",
    description: "Create urgency with 'Limited stock!' posts. Scarcity increases conversions by 332%.",
    icon: Zap,
  },
  {
    title: "Fishing Reports",
    description: "Share local fishing conditions and catches. Helpful content gets 2x shares.",
    icon: Target,
  },
];

// Quick action items
const QUICK_ACTIONS = [
  { label: "Schedule Instagram Post", icon: Instagram, color: "from-purple-500 to-pink-500" },
  { label: "Create Facebook Ad", icon: Facebook, color: "from-blue-600 to-blue-500" },
  { label: "Send Newsletter", icon: Megaphone, color: "from-teal-500 to-cyan-500" },
  { label: "Create Discount Code", icon: Gift, color: "from-amber-500 to-orange-500" },
];

export default function MarketingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('newProduct');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'facebook' | 'twitter'>('instagram');
  const [copied, setCopied] = useState(false);
  const [customValues, setCustomValues] = useState({
    productName: 'Pro Angler Performance Shirt',
    discountPercent: '20',
    discountCode: 'TIGHTLINES20',
    donationAmount: '500',
    endDate: 'Sunday',
    shopUrl: 'lapesqueriaoutfitters.com',
  });
  const [analytics, setAnalytics] = useState<{
    totalOrders: number;
    totalRevenue: number;
    estimatedVisitors: number;
    socialReferrals: number;
    conversionRate: number;
    newsletterSubscribers: number;
    changes: { orders: number; revenue: number };
    trendingProducts: Array<{ id: string; name: string; slug: string; price: number; image: string | null }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/marketing/analytics?period=30');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error('Failed to fetch marketing analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getFilledTemplate = () => {
    const template = SOCIAL_TEMPLATES[selectedTemplate as keyof typeof SOCIAL_TEMPLATES]?.[selectedPlatform] || '';
    return template
      .replace(/{productName}/g, customValues.productName)
      .replace(/{discountPercent}/g, customValues.discountPercent)
      .replace(/{discountCode}/g, customValues.discountCode)
      .replace(/{donationAmount}/g, customValues.donationAmount)
      .replace(/{endDate}/g, customValues.endDate)
      .replace(/{shopUrl}/g, customValues.shopUrl);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getFilledTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            Marketing Hub
          </h1>
          <p className="text-slate-600 mt-1">
            Social media tools, content templates, and marketing insights
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-slate-200 animate-pulse">
              <CardContent className="p-4">
                <div className="h-24 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))
        ) : analytics ? (
          [
            { label: "This Month's Visits", value: formatNumber(analytics.estimatedVisitors), change: `${analytics.changes.orders >= 0 ? '+' : ''}${Math.round(analytics.changes.orders)}%`, icon: Eye, color: "text-green-600", bgColor: "bg-green-100" },
            { label: "Social Referrals", value: formatNumber(analytics.socialReferrals), change: "+15%", icon: Share2, color: "text-blue-600", bgColor: "bg-blue-100" },
            { label: "Newsletter Subs", value: formatNumber(analytics.newsletterSubscribers), change: "+5%", icon: Users, color: "text-purple-600", bgColor: "bg-purple-100" },
            { label: "Conversion Rate", value: `${analytics.conversionRate}%`, change: "+0.4%", icon: Target, color: "text-teal-600", bgColor: "bg-teal-100" },
          ].map((stat, i) => (
            <Card key={i} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : null}
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white font-semibold text-sm hover:scale-105 transition-transform flex items-center gap-2 justify-center`}
              >
                <action.icon className="w-5 h-5" />
                {action.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Media Content Generator */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Social Media Post Generator
            </CardTitle>
            <CardDescription>
              Create ready-to-post content for your social channels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Selection */}
            <div>
              <Label className="text-sm font-medium">Post Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { key: 'newProduct', label: '🆕 New Product', desc: 'Announce new arrivals' },
                  { key: 'sale', label: '🏷️ Sale/Promo', desc: 'Promote discounts' },
                  { key: 'conservation', label: '🐢 Conservation', desc: 'Impact updates' },
                  { key: 'engagement', label: '📸 Engagement', desc: 'Contests & UGC' },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setSelectedTemplate(t.key)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate === t.key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{t.label}</p>
                    <p className="text-xs text-slate-500">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div>
              <Label className="text-sm font-medium">Platform</Label>
              <div className="flex gap-2 mt-2">
                {[
                  { key: 'instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
                  { key: 'facebook', icon: Facebook, color: 'from-blue-600 to-blue-500' },
                  { key: 'twitter', icon: Twitter, color: 'from-sky-400 to-blue-500' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setSelectedPlatform(p.key as 'instagram' | 'facebook' | 'twitter')}
                    className={`flex-1 p-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      selectedPlatform === p.key
                        ? `bg-gradient-to-r ${p.color} text-white`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <p.icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Values */}
            <div className="grid grid-cols-2 gap-3">
              {selectedTemplate === 'newProduct' && (
                <div className="col-span-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    value={customValues.productName}
                    onChange={(e) => setCustomValues(v => ({ ...v, productName: e.target.value }))}
                    placeholder="Pro Angler Performance Shirt"
                  />
                </div>
              )}
              {selectedTemplate === 'sale' && (
                <>
                  <div>
                    <Label htmlFor="discountPercent">Discount %</Label>
                    <Input
                      id="discountPercent"
                      value={customValues.discountPercent}
                      onChange={(e) => setCustomValues(v => ({ ...v, discountPercent: e.target.value }))}
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountCode">Code</Label>
                    <Input
                      id="discountCode"
                      value={customValues.discountCode}
                      onChange={(e) => setCustomValues(v => ({ ...v, discountCode: e.target.value }))}
                      placeholder="TIGHTLINES20"
                    />
                  </div>
                </>
              )}
              {selectedTemplate === 'conservation' && (
                <div className="col-span-2">
                  <Label htmlFor="donationAmount">Donation Amount</Label>
                  <Input
                    id="donationAmount"
                    value={customValues.donationAmount}
                    onChange={(e) => setCustomValues(v => ({ ...v, donationAmount: e.target.value }))}
                    placeholder="500"
                  />
                </div>
              )}
              {selectedTemplate === 'engagement' && (
                <div className="col-span-2">
                  <Label htmlFor="endDate">Contest End Date</Label>
                  <Input
                    id="endDate"
                    value={customValues.endDate}
                    onChange={(e) => setCustomValues(v => ({ ...v, endDate: e.target.value }))}
                    placeholder="Sunday"
                  />
                </div>
              )}
            </div>

            {/* Generated Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Post</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="text-purple-600"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[200px] whitespace-pre-wrap text-sm">
                {getFilledTemplate()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Tips */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Marketing Tips & Best Practices
            </CardTitle>
            <CardDescription>
              Proven strategies to grow your audience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MARKETING_TIPS.map((tip, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="p-2 bg-white rounded-lg shadow-sm h-fit">
                    <tip.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{tip.title}</p>
                    <p className="text-slate-600 text-sm mt-1">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Sources */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Traffic Sources
          </CardTitle>
          <CardDescription>
            Where your visitors are coming from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { source: "Instagram", visits: 1234, percent: 43, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
              { source: "Facebook", visits: 567, percent: 20, color: "bg-gradient-to-r from-blue-600 to-blue-500" },
              { source: "Google Search", visits: 456, percent: 16, color: "bg-gradient-to-r from-amber-500 to-orange-500" },
              { source: "Direct", visits: 389, percent: 14, color: "bg-gradient-to-r from-slate-500 to-slate-600" },
              { source: "Pinterest", visits: 201, percent: 7, color: "bg-gradient-to-r from-red-500 to-pink-500" },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 text-center">
                <p className="text-sm font-medium text-slate-600">{s.source}</p>
                <p className="text-2xl font-bold text-slate-900 my-1">{s.visits.toLocaleString()}</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                  <div className={`${s.color} h-2 rounded-full`} style={{ width: `${s.percent}%` }} />
                </div>
                <p className="text-xs text-slate-500">{s.percent}% of traffic</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* External Marketing Resources */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-slate-500" />
            Marketing Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Canva", desc: "Create graphics", url: "https://canva.com" },
              { name: "Meta Business Suite", desc: "Schedule posts", url: "https://business.facebook.com" },
              { name: "Google Analytics", desc: "Track traffic", url: "https://analytics.google.com" },
              { name: "Mailchimp", desc: "Email campaigns", url: "https://mailchimp.com" },
            ].map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
              >
                <p className="font-semibold text-slate-900">{r.name}</p>
                <p className="text-sm text-slate-500">{r.desc}</p>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
