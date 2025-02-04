import { Pressable, Text, StyleSheet, type PressableProps, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedButtonProps = PressableProps & {
  lightColor?: string;
  darkColor?: string;
  textLightColor?: string;
  textDarkColor?: string;
  title: string;
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  textLightColor,
  textDarkColor,
  title,
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const textColor = useThemeColor({ light: textLightColor, dark: textDarkColor }, 'text');

  return (
    <Pressable
      style={({ pressed }) => [
        { backgroundColor },
        styles.button,
        pressed && styles.buttonPressed,
        style,
      ]}
      {...rest}
    >
      <Text style={[{ color: textColor }, styles.buttonText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical:8,
    borderRadius: 8,
    width: 'auto',
  },
  buttonPressed: {
    opacity: 0.7, // Cambia ligeramente la opacidad cuando se presiona
  },
  buttonText: {
    fontSize: 16,
    textAlign:'center'
  },
});
