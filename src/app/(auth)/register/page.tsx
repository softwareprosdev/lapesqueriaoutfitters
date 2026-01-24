'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Gift, Truck, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to login page
      router.push('/login?registered=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#001F3F]">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1676395245813-9cd304454501?w=1920&q=80"
          alt="Fishing boat at sunrise"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F]/80 via-[#001F3F]/60 to-[#001F3F]/80" />

        {/* Branding and Benefits on Image */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          {/* Top Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/lapescerialogo.png"
                alt="La Pesqueria Outfitters"
                width={60}
                height={60}
                className="object-contain"
              />
              <h1 className="text-3xl font-black uppercase">La Pesqueria Outfitters</h1>
            </div>
            <p className="text-xl text-white/80 max-w-md">
              Premium Fishing Apparel for the Modern Angler
            </p>
          </div>

          {/* Benefits Section */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black mb-4 uppercase">Join the Crew</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Gift className="h-6 w-6 flex-shrink-0 text-[#FF4500]" />
                <div>
                  <h3 className="font-bold text-lg">Welcome Discount</h3>
                  <p className="text-white/70 text-sm">Get 10% off your first order</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Truck className="h-6 w-6 flex-shrink-0 text-[#FF4500]" />
                <div>
                  <h3 className="font-bold text-lg">Fast Shipping</h3>
                  <p className="text-white/70 text-sm">Get your gear quick so you can hit the water</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <Sparkles className="h-6 w-6 flex-shrink-0 text-[#FF4500]" />
                <div>
                  <h3 className="font-bold text-lg">Exclusive Access</h3>
                  <p className="text-white/70 text-sm">Early access to new drops & member-only deals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-[#F8FAFC] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Image
                src="/images/lapescerialogo.png"
                alt="La Pesqueria Outfitters"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-[#001F3F] uppercase">La Pesqueria Outfitters</h1>
          </div>

          {/* Form Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-[#001F3F] rounded-lg">
                <UserPlus className="h-8 w-8 text-[#FF4500]" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-[#001F3F] uppercase">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-[#494949]">
              Join the La Pesqueria crew today
            </p>
          </div>

          {/* Signup Bonus Banner - Mobile */}
          <div className="lg:hidden bg-[#001F3F] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-[#FF4500] flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#FF4500]">10% Off First Order!</p>
                <p className="text-xs text-white/70">Create an account to claim your discount</p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-[#001F3F] mb-2">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Smith"
                className="border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-[#001F3F] mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-[#001F3F] mb-2">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 8 characters"
                className="border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-[#001F3F] mb-2">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="border-gray-300"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-bold rounded-lg text-white bg-[#FF4500] hover:bg-[#FF5722] uppercase"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create My Account
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Already have account */}
          <div className="text-center">
            <p className="text-sm text-[#494949]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#FF4500] hover:text-[#FF5722] font-bold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <div className="text-center">
            <p className="text-xs text-[#494949]">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-[#FF4500] hover:text-[#FF5722]">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-[#FF4500] hover:text-[#FF5722]">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
