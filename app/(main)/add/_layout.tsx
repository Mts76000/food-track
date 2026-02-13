import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "Nouveau repas ",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="camera"
        options={{
          headerTitle: "",
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
