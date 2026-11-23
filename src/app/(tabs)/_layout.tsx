import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { useTheme } from '@/kit/theme';

export default function TabsLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Decks', tabBarIcon: ({ color, size }) => <Ionicons name="albums-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="wheel" options={{ title: 'Wheel', tabBarIcon: ({ color, size }) => <Ionicons name="sync-circle-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="quizzes" options={{ title: 'Quizzes', tabBarIcon: ({ color, size }) => <Ionicons name="heart-half-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="together" options={{ title: 'Together', tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color as string} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color as string} size={size} /> }} />
    </Tabs>
  );
}
