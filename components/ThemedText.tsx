import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ModernColors } from '@/constants/ModernColors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // Use ModernColors as default, fallback to specified colors
  const defaultColor = ModernColors.neutral[800];
  const color = lightColor || darkColor || defaultColor;

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    color: ModernColors.neutral[800],
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 26,
    color: ModernColors.neutral[800],
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 26,
    color: ModernColors.neutral[700],
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    color: ModernColors.primary[600],
  },
});
