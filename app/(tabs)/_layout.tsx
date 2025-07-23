import { Tabs } from 'expo-router';
import { Chrome as Home, Target, Trophy, Settings, Zap } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 15, 25, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(139, 92, 246, 0.3)',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ size, color }) => (
            <Target size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="medals"
        options={{
          title: 'Medals',
          tabBarIcon: ({ size, color }) => (
            <Trophy size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="calibration"
        options={{
          title: 'Calibration',
          tabBarIcon: ({ size, color }) => (
            <Zap size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}