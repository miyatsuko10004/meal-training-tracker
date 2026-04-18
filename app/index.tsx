import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { api, Meal, Workout, Profile } from "../src/lib/api";
import { Activity, Utensils, Dumbbell } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getTodayStr } from "../src/hooks/useMealForm";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ meals: Meal[]; workouts: Workout[]; profile: Profile } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const todayMeals = data?.meals.filter(m => m.date === getTodayStr()) || [];
  const todayCalories = todayMeals.reduce((acc, m) => acc + Number(m.calories), 0);
  const todayP = todayMeals.reduce((acc, m) => acc + Number(m.protein), 0);
  const todayF = todayMeals.reduce((acc, m) => acc + Number(m.fat), 0);
  const todayC = todayMeals.reduce((acc, m) => acc + Number(m.carbs), 0);

  const targetCalories = data?.profile?.targetCalories || 2000;
  const targetP = data?.profile?.targetProtein || 150;
  const targetF = data?.profile?.targetFat || 60;
  const targetC = data?.profile?.targetCarbs || 250;

  const NutrientBar = ({ label, current, target, color }: { label: string, current: number, target: number, color: string }) => (
    <View className="flex-1 mx-1">
      <View className="flex-row justify-between mb-1">
        <Text className="text-gray-400 text-[10px] font-bold">{label}</Text>
        <Text className="text-white text-[10px]">{current}g / {target}g</Text>
      </View>
      <View className="h-1 w-full bg-[#333] rounded-full overflow-hidden">
        <View 
          className="h-full rounded-full" 
          style={{ width: `${Math.min((current / target) * 100, 100)}%`, backgroundColor: color }} 
        />
      </View>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-[#121212] p-4">
      {/* カロリーサマリー */}
      <TouchableOpacity 
        onPress={() => router.push("/analytics")}
        className="bg-[#1E1E1E] p-6 rounded-3xl mb-6 shadow-lg border border-[#333]"
      >
        <Text className="text-gray-400 text-sm mb-1 font-medium">今日の摂取状況</Text>
        <View className="flex-row items-baseline mb-4">
          <Text className="text-white text-5xl font-bold">{todayCalories}</Text>
          <Text className="text-gray-500 text-lg ml-2">/ {targetCalories} kcal</Text>
        </View>
        <View className="h-2 w-full bg-[#333] rounded-full overflow-hidden mb-6">
          <View 
            className="h-full bg-[#BB86FC] rounded-full" 
            style={{ width: `${Math.min((todayCalories / targetCalories) * 100, 100)}%` }} 
          />
        </View>

        {/* PFC進捗 */}
        <View className="flex-row justify-between">
          <NutrientBar label="P" current={todayP} target={targetP} color="#BB86FC" />
          <NutrientBar label="F" current={todayF} target={targetF} color="#03DAC6" />
          <NutrientBar label="C" current={todayC} target={targetC} color="#FFB74D" />
        </View>
        <Text className="text-[#BB86FC] text-xs mt-4 text-right">詳細な分析を見る 〉</Text>
      </TouchableOpacity>

      {/* アクションボタン */}
      <View className="flex-row justify-between mb-8">
        <TouchableOpacity 
          onPress={() => router.push("/meals/add")}
          className="bg-[#BB86FC] flex-1 mr-2 p-4 rounded-2xl flex-row items-center justify-center"
        >
          <Utensils size={20} color="#000" />
          <Text className="text-black font-bold ml-2">食事を記録</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push("/workouts/add")}
          className="bg-[#03DAC6] flex-1 ml-2 p-4 rounded-2xl flex-row items-center justify-center"
        >
          <Dumbbell size={20} color="#000" />
          <Text className="text-black font-bold ml-2">トレを記録</Text>
        </TouchableOpacity>
      </View>

      {/* 直近の食事 */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">直近の食事</Text>
          <TouchableOpacity onPress={() => router.push("/meals/history")}>
            <Text className="text-[#BB86FC]">すべて見る</Text>
          </TouchableOpacity>
        </View>
        {data?.meals.length === 0 ? (
          <Text className="text-gray-500 italic">まだ記録がありません</Text>
        ) : (
          data?.meals.slice(0, 3).map((meal) => (
            <TouchableOpacity 
              key={meal.id} 
              onPress={() => router.push({ pathname: "/meals/[id]", params: { id: meal.id } })}
              className="bg-[#1E1E1E] p-4 rounded-2xl mb-3 flex-row items-center border border-[#333]"
            >
              <View className="w-12 h-12 bg-[#333] rounded-xl items-center justify-center mr-4">
                <Utensils size={24} color="#BB86FC" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{meal.timeSlot || "食事"}</Text>
                <Text className="text-gray-500 text-[10px]">P:{meal.protein} F:{meal.fat} C:{meal.carbs}</Text>
              </View>
              <Text className="text-white font-bold">{meal.calories} kcal</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* 直近のトレーニング */}
      <View className="mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-xl font-bold">トレーニング履歴</Text>
          <TouchableOpacity><Text className="text-[#03DAC6]">すべて見る</Text></TouchableOpacity>
        </View>
        {data?.workouts.length === 0 ? (
          <Text className="text-gray-500 italic">まだ記録がありません</Text>
        ) : (
          data?.workouts.slice(0, 3).map((workout) => (
            <View key={workout.id} className="bg-[#1E1E1E] p-4 rounded-2xl mb-3 flex-row items-center border border-[#333]">
              <View className="w-12 h-12 bg-[#333] rounded-xl items-center justify-center mr-4">
                <Dumbbell size={24} color="#03DAC6" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{workout.title}</Text>
                <Text className="text-gray-400 text-xs">{workout.date}</Text>
              </View>
              <Activity size={20} color="#444" />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
