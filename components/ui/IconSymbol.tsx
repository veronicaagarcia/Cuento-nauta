// Este archivo define un componente IconSymbol que utiliza íconos nativos de SFSymbols en iOS y MaterialIcons en Android y web, asegurando una apariencia consistente en todas las plataformas. Los nombres de los iconos están basados en SFSymbols y requieren un mapeo manual a MaterialIcons. Se proporciona una opción de reserva para usar MaterialIcons en Android y web mediante un mapeo de nombres de íconos.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Agrega tus mapeos de SFSymbol a MaterialIcons aquí.
const MAPPING = {
  'house.fill': 'home',
  'chevron.left': 'chevron-left', 
  'chevron.right': 'chevron-right',
  'favorite': 'favorite',
} as const;

type MaterialIconName = keyof typeof MAPPING;

// Define el tipo IconSymbolName basado en las claves de MAPPING.
export type IconSymbolName = MaterialIconName;

export function IconSymbol({
  name, 
  size = 24, 
  color, 
  style, 
}: {
  name: IconSymbolName; 
  size?: number; 
  color: string | OpaqueColorValue; 
  style?: StyleProp<TextStyle>; 
  weight?: SymbolWeight; 
}) {
  // Retornamos el componente MaterialIcons con los props mapeados.
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
