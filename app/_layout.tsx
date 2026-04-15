import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { User } from "lucide-react-native";
import "../src/lib/api";
import "../src/styles/global.css";

export default function RootLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        contentStyle: {
          backgroundColor: "#121212",
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: "M&T Optimizer",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/profile")} className="mr-2">
              <User size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen name="meals/add" options={{ title: "食事を記録" }} />
      <Stack.Screen name="workouts/add" options={{ title: "トレを記録" }} />
      <Stack.Screen name="analytics/index" options={{ title: "データ分析" }} />
      <Stack.Screen name="profile/index" options={{ title: "プロフィール設定" }} />
    </Stack>
  );
}
