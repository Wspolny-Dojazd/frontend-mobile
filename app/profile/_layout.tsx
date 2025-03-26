import { Stack } from 'expo-router';

export default function MapTestLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="my-profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preferences"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
