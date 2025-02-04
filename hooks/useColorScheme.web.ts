// Este archivo define una función useColorScheme personalizada que envuelve el hook useColorScheme de react-native. También maneja el renderizado estático inicial. Al comienzo, el estado hasHydrated es false, y se establece en true después del primer renderizado. Si el componente ha hidratado, se devuelve el esquema de color del sistema; de lo contrario, se retorna 'light' por defecto.
import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

//Para soportar el renderizado estático, este valor necesita ser recalculado en el lado del cliente para la web.
 
export function useColorScheme() {
  // Estado para controlar si el componente ha hidratado.
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // Establecemos hasHydrated en true después de que el componente se haya montado.
    setHasHydrated(true);
  }, []);

  // Usamos el hook useColorScheme de react-native.
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    // Si el componente ha hidratado, retornamos el esquema de color.
    return colorScheme;
  }

  // Si no ha hidratado, retornamos 'light' por defecto.
  return 'light';
}
