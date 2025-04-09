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
        name="[transitId]/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[transitId]/chat"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[transitId]/chooseDestination"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
