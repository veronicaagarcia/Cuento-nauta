import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ModernColors } from '@/constants/ModernColors';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle
}) => {
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return ModernColors.gradients.primary;
      case 'secondary':
        return ModernColors.gradients.secondary;
      case 'danger':
        return [ModernColors.error[500], ModernColors.error[600]];
      case 'success':
        return [ModernColors.success[500], ModernColors.success[600]];
      case 'outline':
        return ['transparent', 'transparent'];
      default:
        return ModernColors.gradients.primary;
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 };
      case 'medium':
        return { paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 };
      case 'large':
        return { paddingHorizontal: 20, paddingVertical: 14, fontSize: 16 };
      default:
        return { paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 };
    }
  };

  const getTextColor = () => {
    if (disabled) return ModernColors.neutral[400];
    if (variant === 'outline') return ModernColors.primary[600];
    return 'white';
  };

  const buttonSize = getButtonSize();
  const colors = disabled ? [ModernColors.neutral[300], ModernColors.neutral[400]] : getButtonColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            paddingHorizontal: buttonSize.paddingHorizontal,
            paddingVertical: buttonSize.paddingVertical,
          },
          variant === 'outline' && styles.outline,
          disabled && styles.disabled
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: buttonSize.fontSize,
              color: getTextColor(),
            },
            textStyle
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  outline: {
    borderWidth: 2,
    borderColor: ModernColors.primary[600],
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ModernButton;