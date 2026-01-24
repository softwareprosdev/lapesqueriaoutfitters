import { extendTheme } from '@mui/joy/styles';

export const CHART_NEON_COLORS = {
  pink: '#EC4899',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  orange: '#F97316',
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
  indigo: '#6366F1',
  teal: '#14B8A6',
  fuchsia: '#D946EF',
};

const NEON_COLORS = {
  primaryGradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  secondaryGradient: 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
  neonPink: '#EC4899',
  neonPurple: '#8B5CF6',
  neonCyan: '#06B6D4',
  neonOrange: '#F97316',
  neonGreen: '#22C55E',
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    tertiary: '#334155',
    elevated: '#1E293B',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
  },
  border: {
    default: 'rgba(148, 163, 184, 0.2)',
  },
};

export const joyTheme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        mode: 'dark',
        primary: { 500: '#8B5CF6' },
        neutral: { 500: '#06B6D4' },
        danger: { 500: '#EF4444' },
        success: { 500: '#22C55E' },
        warning: { 500: '#EAB308' },
        background: {
          body: NEON_COLORS.background.primary,
          level1: NEON_COLORS.background.secondary,
          level2: NEON_COLORS.background.tertiary,
        },
        text: {
          primary: NEON_COLORS.text.primary,
          secondary: NEON_COLORS.text.secondary,
          tertiary: NEON_COLORS.text.tertiary,
        },
      },
    },
  },
});

export { NEON_COLORS };
