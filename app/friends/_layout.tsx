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
        options={({ route }) => ({
          title: (route.params as ChatRouteParams)?.name || 'Chat',
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <Text style={{ color: 'green' }}>Active now</Text>
            </View>
          )
        })}
      />
    </Stack>
  );
}