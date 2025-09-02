/**
 * Modern color palette for Cuento Nauta
 * Inspired by contemporary design trends
 */

export const ModernColors = {
  // Primary Brand Colors - Warm and inviting for reading
  primary: {
    50: '#fef7ed',
    100: '#fedfc7', 
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Main warm orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // Secondary Colors - Complementary blue
  secondary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Complementary blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral Colors
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Success, Warning, Error
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },

  // Dark mode optimized
  dark: {
    background: '#d97706',
    surface: '#161618',
    border: '#27272a',
    text: {
      primary: '#f4f4f5',
      secondary: '#a1a1aa',
      muted: '#71717a',
    }
  },

  // Light mode optimized  
  light: {
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      muted: '#64748b',
    }
  },

  // Gradient combinations - Reading-focused
  gradients: {
    primary: ['#f97316', '#fb923c', '#fdba74'], // Warm orange gradient
    secondary: ['#3b82f6', '#60a5fa', '#93c5fd'], // Cool blue gradient
    sunset: ['#f97316', '#fb923c', '#f59e0b'], // Book-inspired sunset
    warm: ['#fed7aa', '#fdba74', '#fb923c'], // Soft warm gradient
    neutral: ['#f8fafc', '#f1f5f9', '#e2e8f0'], // Clean neutral
  }
};

// Theme-aware color function
export const getThemedColors = (isDark: boolean) => ({
  background: isDark ? ModernColors.dark.background : ModernColors.light.background,
  surface: isDark ? ModernColors.dark.surface : ModernColors.light.surface,
  border: isDark ? ModernColors.dark.border : ModernColors.light.border,
  primary: ModernColors.primary[500],
  secondary: ModernColors.secondary[500],
  text: {
    primary: isDark ? ModernColors.dark.text.primary : ModernColors.light.text.primary,
    secondary: isDark ? ModernColors.dark.text.secondary : ModernColors.light.text.secondary,
    muted: isDark ? ModernColors.dark.text.muted : ModernColors.light.text.muted,
  },
  success: ModernColors.success[500],
  warning: ModernColors.warning[500],
  error: ModernColors.error[500],
});