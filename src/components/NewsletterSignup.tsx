'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Anchor, Fish } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: '' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🎣 Welcome aboard! Your 10% discount is in your inbox!');
        setIsSuccess(true);
        setEmail('');
      } else {
        setMessage(data.error || 'Failed to subscribe. Try again!');
        setIsSuccess(false);
      }
    } catch {
      setMessage('Something went wrong. Give it another cast!');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#001F3F] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-3 mb-3">
            <Anchor className="w-8 h-8 text-[#FF4500]" />
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Join the Crew
            </h2>
            <Fish className="w-8 h-8 text-[#FF4500]" />
          </div>
          <p className="text-white/70 text-lg">
            Get 10% off + early access to new fishing gear drops!
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg text-center flex items-center justify-center gap-2 ${
            isSuccess
              ? 'bg-green-100 border border-green-300 text-green-800'
              : 'bg-red-100 border border-red-300 text-red-800'
          }`}>
            {isSuccess && <Fish className="w-5 h-5" />}
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="bg-white border-white/20 text-white placeholder:text-white/50"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#FF4500] hover:bg-[#FF5722] text-white font-bold whitespace-nowrap"
            >
              {loading ? 'Casting...' : 'Get 10% OFF'}
            </Button>
          </div>
          <p className="text-xs text-white/50 mt-3 text-center">
            No spam, just catches! Unsubscribe anytime.
          </p>
        </form>
      </div>
    </div>
  );
}
