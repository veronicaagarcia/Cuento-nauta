import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { ModernColors } from '@/constants/ModernColors';


export default function TabLayout() {


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ModernColors.primary[500],
        tabBarInactiveTintColor: ModernColors.neutral[400],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderTopColor: ModernColors.neutral[200],
            borderTopWidth: 1,
          },
          default: {
            backgroundColor: ModernColors.light.surface,
            borderTopColor: ModernColors.neutral[200],
            borderTopWidth: 1,
            elevation: 8,
            shadowColor: ModernColors.neutral[900],
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="myBookList"
        options={{
          title: 'Mis libros',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="favorite" color={color} />,
        }}
      />
    </Tabs>
  );
}
