import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

// Define type for route parameters
type ChatRouteParams = {
  name: string;
  id: string;
};

export default function FriendsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="addFriend"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}