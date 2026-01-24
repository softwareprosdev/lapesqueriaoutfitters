'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: '/login' })}
      variant="secondary"
      size="sm"
      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold border-0 text-xs sm:text-sm"
    >
      <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
      Sign Out
    </Button>
  );
}
