import { ModernColors } from './ModernColors';

// Using ModernColors as the base for consistency
const tintColorLight = ModernColors.primary[500];
const tintColorDark = ModernColors.primary[400];

export const Colors = {
  light: {
    text: ModernColors.neutral[800],
    background: ModernColors.light.background,
    button: ModernColors.primary[500],
    tint: tintColorLight,
    content: ModernColors.light.surface,
    icon: ModernColors.neutral[600],
    tabIconDefault: ModernColors.neutral[400],
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: ModernColors.dark.text.primary,
    background: ModernColors.dark.background,
    button: ModernColors.primary[400],
    tint: tintColorDark,
    content: ModernColors.dark.surface,
    icon: ModernColors.dark.text.secondary,
    tabIconDefault: ModernColors.dark.text.muted,
    tabIconSelected: tintColorDark,
  },
};
