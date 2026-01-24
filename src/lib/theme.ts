/**
 * Theme utilities - re-exports from next-themes for consistency
 *
 * This file provides a single source of truth for theme management.
 * Use `useTheme` from this file or directly from 'next-themes'.
 */

// Re-export everything from next-themes
export { useTheme } from 'next-themes';

// CSS Variables for use in styled components or inline styles
// These map to the CSS custom properties defined in globals.css
export const themeVars = {
  background: {
    primary: 'var(--background-primary)',
    secondary: 'var(--background-secondary)',
    tertiary: 'var(--background-tertiary)',
    elevated: 'var(--background-elevated)',
  },
  text: {
    primary: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    muted: 'var(--text-muted)',
  },
  border: 'var(--border-color)',
  accent: {
    primary: 'var(--accent-primary)',
    secondary: 'var(--accent-secondary)',
    gradient: 'var(--accent-gradient)',
  },
  status: {
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    error: 'var(--error-color)',
  },
  shadow: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    glow: 'var(--shadow-glow)',
  },
};
