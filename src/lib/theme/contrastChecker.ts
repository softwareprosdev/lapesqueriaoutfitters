import { CHART_NEON_COLORS } from './joyTheme';

interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function getContrastRatio(foreground: string, background: string): number {
  const fgLum = getLuminance(foreground);
  const bgLum = getLuminance(background);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

export function checkContrast(
  foreground: string,
  background: string,
  context: string = 'text'
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const wcagAA = ratio >= 4.5;
  const wcagAAA = ratio >= 7;

  let status: 'pass' | 'fail' | 'warning' = 'fail';
  let message = '';

  if (context === 'largeText') {
    const aaLarge = ratio >= 3;
    // AAA compliance for large text requires 4.5:1 ratio
    // const aaaLarge = ratio >= 4.5;
    status = aaLarge ? 'pass' : 'fail';
    message = aaLarge
      ? `Pass (AA large text: ${ratio.toFixed(2)}:1)`
      : `Fail (AA large text requires 3:1, got ${ratio.toFixed(2)}:1)`;
  } else {
    status = wcagAA ? 'pass' : 'fail';
    message = wcagAA
      ? `Pass (AA normal text: ${ratio.toFixed(2)}:1)`
      : `Fail (AA normal text requires 4.5:1, got ${ratio.toFixed(2)}:1)`;
  }

  if (wcagAAA && status === 'pass') {
    message += ' - AAA compliant';
  }

  return { ratio, wcagAA, wcagAAA, status, message };
}

export function validateComponentContrast(
  fgColor: string,
  bgColor: string,
  component: string
): ContrastResult {
  const result = checkContrast(fgColor, bgColor);

  if (result.status === 'fail') {
    result.message = `[${component}] ${result.message}`;
    if (typeof console !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(`WCAG Contrast Warning [${component}]:`, result.message);
    }
  }

  return result;
}

export function validateButtonContrast(
  bgColor: string,
  textColor: string = '#ffffff'
): ContrastResult {
  return validateComponentContrast(textColor, bgColor, 'Button');
}

export function validateChartColors(background: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const bgLum = getLuminance(background);

  for (const [name, color] of Object.entries(CHART_NEON_COLORS)) {
    const fgLum = getLuminance(color);
    const ratio = (Math.max(bgLum, fgLum) + 0.05) / (Math.min(bgLum, fgLum) + 0.05);
    if (ratio < 3) {
      issues.push(`${name} (${color}) has low contrast against background: ${ratio.toFixed(2)}:1`);
    }
  }

  return { valid: issues.length === 0, issues };
}

export function runContrastAudit(): void {
  const background = '#0F172A';
  const textPrimary = '#F8FAFC';
  const textSecondary = '#94A3B8';
  const primaryColor = '#8B5CF6';
  const secondaryColor = '#06B6D4';

  console.log('🎨 WCAG Contrast Audit - Dark Neon Theme');
  console.log('='.repeat(50));

  const checks = [
    { fg: textPrimary, bg: background, name: 'Primary text on background' },
    { fg: textSecondary, bg: background, name: 'Secondary text on background' },
    { fg: '#ffffff', bg: primaryColor, name: 'White text on primary button' },
    { fg: '#ffffff', bg: secondaryColor, name: 'White text on secondary button' },
  ];

  checks.forEach(({ fg, bg, name }) => {
    const result = checkContrast(fg, bg);
    const statusIcon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${statusIcon} ${name}: ${result.message}`);
  });

  console.log('='.repeat(50));
  console.log('Chart colors:', validateChartColors(background));
}

export { CHART_NEON_COLORS };
