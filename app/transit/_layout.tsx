import { Stack } from 'expo-router';

export default function TransitLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="join-group"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
