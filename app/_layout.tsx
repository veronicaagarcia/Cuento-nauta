// Este archivo configura mi layout principal. Manejo el tema oscuro o claro según el esquema de color del sistema, cargo fuentes personalizadas, y muestro una pantalla de carga (splash screen) hasta que las fuentes estén completamente cargadas. Luego, defino la estructura de navegación con una pila de pantallas, incluyendo una pantalla para manejar rutas no encontradas y la barra de estado. Todo esto lo envuelvo en un ThemeProvider que ajusta el tema de mi aplicación.
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router' // Stack para la navegacion en pila
import * as SplashScreen from 'expo-splash-screen' // SplashScreen para manejar la pantalla de carga
import { StatusBar } from 'expo-status-bar'// StatusBar para manejar la barra de estado
import { useEffect } from 'react'
import 'react-native-reanimated'

import { useColorScheme } from '@/hooks/useColorScheme'// Hook personalizado para obtener el esquema de color

// Prevee que la pantalla de carga se esconda automaticamente antes de que se completen la carga de recursos
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
