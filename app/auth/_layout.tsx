import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="profile" />
      <Stack.Screen name="recover" options={{ headerShown: false }} />
      <Stack.Screen name="newPass" options={{ headerShown: false }} />
    </Stack>
  );
}
