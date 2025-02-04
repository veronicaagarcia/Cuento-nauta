// Este archivo define un componente IconSymbol que utiliza íconos nativos de SFSymbols en iOS y MaterialIcons en Android y web, asegurando una apariencia consistente en todas las plataformas. Los nombres de los iconos están basados en SFSymbols y requieren un mapeo manual a MaterialIcons. Se proporciona una opción de reserva para usar MaterialIcons en Android y web mediante un mapeo de nombres de íconos.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Agrega tus mapeos de SFSymbol a MaterialIcons aquí.
const MAPPING = {
  // Ver MaterialIcons aquí: https://icobookns.expo.fyi
  // Ver SF Symbols en la aplicación SF Symbols en Mac.
  'house.fill': 'home', // Mapea 'house.fill' de SFSymbols a 'home' de MaterialIcons.
  'paperplane.fill': 'send', // Mapea 'paperplane.fill' de SFSymbols a 'send' de MaterialIcons.
  'chevron.left': 'chevron-left', // Mapea 'chevron.left.forwardslash.chevron.right' de SFSymbols a 'code' de MaterialIcons.
  'chevron.right': 'chevron-right', // Mapea 'chevron.right' de SFSymbols a 'chevron-right' de MaterialIcons.
  'book.fill': 'book', // Mapeo del ícono de libro.
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

// Define el tipo IconSymbolName basado en las claves de MAPPING.
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Un componente de icono que usa SFSymbols nativos en iOS, y MaterialIcons en Android y web. Esto asegura una apariencia consistente en todas las plataformas y el uso óptimo de recursos.
 *
 * Los nombres de los iconos se basan en SFSymbols y requieren mapeo manual a MaterialIcons.
 */
export function IconSymbol({
  name, 
  size = 24, 
  color, 
  style, 
}: {
  name: IconSymbolName; 
  size?: number; 
  color: string | OpaqueColorValue; 
  style?: StyleProp<ViewStyle>; 
  weight?: SymbolWeight; 
}) {
  // Retornamos el componente MaterialIcons con los props mapeados.
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}