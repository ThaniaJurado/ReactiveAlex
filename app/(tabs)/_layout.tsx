import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useShakeDetector } from '@/hooks/useShakeDetector';
import { useUserConfiguration } from '@/hooks/useUserConfiguration';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isConfigured, isLoading } = useUserConfiguration();
  const { startShakeDetection, stopShakeDetection } = useShakeDetector();

  // Activar shake detection cuando el usuario esté configurado
  useEffect(() => {
    if (isConfigured && !isLoading) {
      startShakeDetection();
    } else {
      stopShakeDetection();
    }
  }, [isConfigured, isLoading, startShakeDetection, stopShakeDetection]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="configuration"
        options={{
          title: 'Configuration',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
