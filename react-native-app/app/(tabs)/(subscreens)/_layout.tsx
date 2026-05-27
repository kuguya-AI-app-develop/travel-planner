import { Stack } from 'expo-router';

export default function SubScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
