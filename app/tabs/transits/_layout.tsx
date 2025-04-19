import { Stack } from 'expo-router';

export default function TransitsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[transitId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
