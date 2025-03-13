import { ScreenContent } from '~/src/components/ScreenContent';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <ScreenContent title="Home" path="App.tsx" />
      <StatusBar style="auto" />
    </>
  );
}
