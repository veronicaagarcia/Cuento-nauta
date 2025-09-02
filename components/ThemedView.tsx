import { View, type ViewProps } from 'react-native';
import { ModernColors } from '@/constants/ModernColors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Always use ModernColors white background
  const backgroundColor = lightColor || darkColor || ModernColors.light.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
