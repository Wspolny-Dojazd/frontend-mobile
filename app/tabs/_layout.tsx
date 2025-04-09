import FontAwesome from '@expo/vector-icons/FontAwesome';
import Monicon from '@monicon/native';
import { Tabs } from 'expo-router';

import { useTheme } from '@/src/lib/useTheme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: theme.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Monicon name="heroicons:home-solid" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transits"
        options={{
          title: 'Transits',
          headerShown: false,
          tabBarIcon: ({ color }) => <Monicon name="gis:map-users" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Monicon name="material-symbols:group" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <Monicon name="pajamas:profile" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
