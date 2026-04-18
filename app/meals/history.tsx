import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { api, Meal } from "../../src/lib/api";
import { useRouter } from "expo-router";
import { ChevronLeft, Utensils, ChevronRight } from "lucide-react-native";

export default function MealHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const res = await api.getSummary();
      // 日付の降順でソート
      const sortedMeals = res.meals.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setMeals(sortedMeals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  // 日付ごとにグループ化
  const groupedMeals: { [key: string]: Meal[] } = {};
  meals.forEach(meal => {
    if (!groupedMeals[meal.date]) {
      groupedMeals[meal.date] = [];
    }
    groupedMeals[meal.date].push(meal);
  });

  const dates = Object.keys(groupedMeals).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center p-4 pt-12 border-b border-[#333]">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold ml-2">食事履歴</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {dates.length === 0 ? (
          <Text className="text-gray-500 text-center mt-10 italic">記録がありません</Text>
        ) : (
          dates.map(date => (
            <View key={date} className="mb-6">
              <Text className="text-gray-400 font-bold mb-3 ml-1">{date}</Text>
              {groupedMeals[date].map((meal) => (
                <TouchableOpacity 
                  key={meal.id} 
                  onPress={() => router.push({ pathname: "/meals/[id]", params: { id: meal.id } })}
                  className="bg-[#1E1E1E] p-4 rounded-2xl mb-3 flex-row items-center border border-[#333]"
                >
                  <View className="w-12 h-12 bg-[#333] rounded-xl items-center justify-center mr-4 overflow-hidden">
                    {meal.imageId ? (
                      <Image 
                        source={{ uri: `https://lh3.googleusercontent.com/d/${meal.imageId}` }} 
                        className="w-full h-full"
                      />
                    ) : (
                      <Utensils size={24} color="#BB86FC" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold">{meal.timeSlot || "食事"}</Text>
                    <Text className="text-gray-400 text-xs" numberOfLines={1}>{meal.memo || "メモなし"}</Text>
                  </View>
                  <View className="items-end mr-2">
                    <Text className="text-white font-bold">{meal.calories} kcal</Text>
                    <Text className="text-gray-500 text-[10px]">P:{meal.protein} F:{meal.fat} C:{meal.carbs}</Text>
                  </View>
                  <ChevronRight size={16} color="#444" />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
