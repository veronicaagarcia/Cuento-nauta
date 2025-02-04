// Este archivo define una función useThemeColor que selecciona un color basado en el esquema de color actual (light o dark). Primero, obtiene el esquema de color usando el hook useColorScheme. Luego, intenta obtener el color de las propiedades (props); si no se define un color en las propiedades, se usa el color predeterminado de la constante Colors.

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Obtenemos el esquema de color actual usando useColorScheme.
  const theme = useColorScheme() ?? 'light';
  // Obtenemos el color específico de las propiedades si está definido.
  const colorFromProps = props[theme];

  if (colorFromProps) {
    // Si el color está definido en las propiedades, lo retornamos.
    return colorFromProps;
  } else {
    // Si no, retornamos el color definido en Colors basado en el esquema de color.
    return Colors[theme][colorName];
  }
}
