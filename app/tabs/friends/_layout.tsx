import { Stack } from 'expo-router';

export default function FriendsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="addFriend"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}