import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { api, Meal, Profile } from "../../src/lib/api";
import { BarChart, LineChart } from "react-native-chart-kit";
import { ChevronLeft, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getJSTDate } from "../../src/utils/date";

const screenWidth = Dimensions.get("window").width;

type Period = "daily" | "weekly" | "monthly";

export default function Analytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ meals: Meal[]; profile: Profile } | null>(null);
  const [period, setPeriod] = useState<Period>("weekly");

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

  const chartData = useMemo(() => {
    if (!data) return null;

    const meals = data.meals;
    const profile = data.profile || { targetCalories: 2000 };

    // 今日の日付から遡って集計
    const labels: string[] = [];
    const actuals: number[] = [];
    const targets: number[] = [];

    const now = getJSTDate();
    const count = period === "daily" ? 7 : period === "weekly" ? 4 : 6; // 日次は7日分、週次は4週間分、月次は6ヶ月分

    for (let i = count - 1; i >= 0; i--) {
      let start = getJSTDate();
      let end = getJSTDate();
      let label = "";

      if (period === "daily") {
        start.setDate(now.getDate() - i);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() - i);
        end.setHours(23, 59, 59, 999);
        label = `${start.getMonth() + 1}/${start.getDate()}`;
      } else if (period === "weekly") {
        start.setDate(now.getDate() - i * 7 - now.getDay()); // 週の始まり
        end.setDate(start.getDate() + 6);
        label = `W${i === 0 ? "今" : i}`;
      } else {
        start.setMonth(now.getMonth() - i);
        label = `${start.getMonth() + 1}月`;
      }

      const periodMeals = meals.filter(m => {
        const d = new Date(m.date);
        if (period === "monthly") return d.getMonth() === start.getMonth() && d.getFullYear() === start.getFullYear();
        return d >= start && d <= end;
      });

      const totalCal = periodMeals.reduce((acc, m) => acc + Number(m.calories), 0);
      const avgCal = period === "daily" ? totalCal : totalCal / (period === "weekly" ? 7 : 30); // 期間中の1日平均

      labels.push(label);
      actuals.push(Math.round(avgCal));
      targets.push(profile.targetCalories || 2000);
    }

    return { labels, actuals, targets };
  }, [data, period]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  const avgActual = chartData ? Math.round(chartData.actuals.reduce((a, b) => a + b, 0) / chartData.actuals.length) : 0;
  const target = data?.profile?.targetCalories || 2000;
  const diff = avgActual - target;

  return (
    <ScrollView className="flex-1 bg-[#121212] p-4">
      {/* 期間切り替え */}
      <View className="flex-row bg-[#1E1E1E] rounded-2xl p-1 mb-6 border border-[#333]">
        {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p)}
            className={`flex-1 py-3 rounded-xl items-center ${period === p ? "bg-[#BB86FC]" : "bg-transparent"}`}
          >
            <Text className={`font-bold ${period === p ? "text-black" : "text-gray-500"}`}>
              {p === "daily" ? "日次" : p === "weekly" ? "週次" : "月次"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* サマリーカード */}
      <View className="bg-[#1E1E1E] p-6 rounded-3xl mb-6 border border-[#333]">
        <Text className="text-gray-400 text-sm mb-1">期間中の1日平均</Text>
        <View className="flex-row items-baseline mb-2">
          <Text className="text-white text-4xl font-bold">{avgActual}</Text>
          <Text className="text-gray-500 text-lg ml-2">/ {target} kcal</Text>
        </View>
        <View className="flex-row items-center">
          {Math.abs(diff) <= 100 ? (
            <CheckCircle2 size={16} color="#03DAC6" />
          ) : (
            <AlertCircle size={16} color={diff > 0 ? "#CF6679" : "#FFB74D"} />
          )}
          <Text className={`ml-2 font-medium ${Math.abs(diff) <= 100 ? "text-[#03DAC6]" : diff > 0 ? "text-[#CF6679]" : "text-[#FFB74D]"}`}>
            目標との乖離: {diff > 0 ? "+" : ""}{diff} kcal
          </Text>
        </View>
      </View>

      {/* グラフセクション */}
      <View className="bg-[#1E1E1E] p-4 rounded-3xl mb-6 border border-[#333]">
        <Text className="text-white text-lg font-bold mb-4 ml-2">カロリー推移 (平均)</Text>
        {chartData && (
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [
                { data: chartData.actuals, color: (opacity = 1) => `rgba(187, 134, 252, ${opacity})`, strokeWidth: 3 }, // 実績
                { data: chartData.targets, color: (opacity = 0.5) => `rgba(255, 255, 255, ${opacity})`, strokeWidth: 1, withDots: false }, // 目標線
              ],
              legend: ["実績", "目標"]
            }}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: "#1E1E1E",
              backgroundGradientFrom: "#1E1E1E",
              backgroundGradientTo: "#1E1E1E",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
              propsForDots: { r: "5", strokeWidth: "2", stroke: "#BB86FC" },
              style: { borderRadius: 16 }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        )}
      </View>

      {/* 栄養バランス分析 (簡易版) */}
      <View className="bg-[#1E1E1E] p-6 rounded-3xl mb-12 border border-[#333]">
        <View className="flex-row items-center mb-4">
          <TrendingUp size={20} color="#BB86FC" />
          <Text className="text-white text-lg font-bold ml-2">栄養素アドバイス</Text>
        </View>
        <Text className="text-gray-400 leading-relaxed">
          {diff > 200 ? "摂取カロリーが目標を大幅に上回っています。夕食の間食を控えるか、トレーニング強度を上げると効果的です。" :
           diff < -200 ? "摂取カロリーが目標を下回っています。筋肉を維持するために、タンパク質を多めに含む間食を追加してください。" :
           "目標通り非常に安定しています！このペースを維持しましょう。"}
        </Text>
      </View>
    </ScrollView>
  );
}
