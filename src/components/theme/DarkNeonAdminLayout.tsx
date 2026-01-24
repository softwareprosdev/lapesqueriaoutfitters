'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@mui/joy/styles';
import { CssBaseline, Sheet } from '@mui/joy';
import { joyTheme } from '@/lib/theme/joyTheme';

interface DarkNeonAdminLayoutProps {
  children: ReactNode;
}

export function DarkNeonAdminLayout({ children }: DarkNeonAdminLayoutProps) {
  return (
    <ThemeProvider theme={joyTheme}>
      <CssBaseline />
      <Sheet
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.body',
          backgroundImage: 'none',
        }}
      >
        {children}
      </Sheet>
    </ThemeProvider>
  );
}
