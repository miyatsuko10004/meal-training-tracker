import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { api } from "../../src/lib/api";
import { useRouter } from "expo-router";
import { Plus, Trash2, Dumbbell, Save, ChevronLeft } from "lucide-react-native";

interface SetData {
  weight: string;
  reps: string;
  rpe: string;
}

interface ExerciseData {
  id: string;
  name: string;
  sets: SetData[];
}

export default function AddWorkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("胸の日");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [exercises, setExercises] = useState<ExerciseData[]>([
    { id: Math.random().toString(), name: "ベンチプレス", sets: [{ weight: "", reps: "", rpe: "" }] }
  ]);

  const addExercise = () => {
    setExercises([...exercises, { id: Math.random().toString(), name: "", sets: [{ weight: "", reps: "", rpe: "" }] }]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const updateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, name } : e));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        // 前のセットの重量をコピーする（入力の手間を省く）
        const lastSet = e.sets[e.sets.length - 1];
        return { ...e, sets: [...e.sets, { weight: lastSet.weight, reps: lastSet.reps, rpe: lastSet.rpe }] };
      }
      return e;
    }));
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        return { ...e, sets: e.sets.filter((_, i) => i !== setIndex) };
      }
      return e;
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: keyof SetData, value: string) => {
    setExercises(exercises.map(e => {
      if (e.id === exerciseId) {
        const newSets = [...e.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...e, sets: newSets };
      }
      return e;
    }));
  };

  const handleSave = async () => {
    if (!title || exercises.some(e => !e.name)) {
      Alert.alert("エラー", "タイトルと種目名を入力してください");
      return;
    }

    try {
      setLoading(true);
      // APIに送信する形式に整形
      const formattedSets = exercises.flatMap(e => 
        e.sets.map(s => ({
          exerciseName: e.name,
          weight: Number(s.weight || 0),
          reps: Number(s.reps || 0),
          rpe: Number(s.rpe || 0),
        }))
      );

      await api.addWorkout({
        date,
        title,
        sets: formattedSets,
      });

      router.replace("/");
    } catch (err) {
      console.error(err);
      Alert.alert("エラー", "トレーニングの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#121212]"
    >
      <ScrollView className="flex-1 p-4">
        {/* 基本情報 */}
        <View className="bg-[#1E1E1E] p-4 rounded-2xl mb-6 border border-[#333]">
          <View className="mb-4">
            <Text className="text-gray-500 text-xs mb-1">セッション名 (部位など)</Text>
            <TextInput
              className="text-white text-xl font-bold border-b border-[#333] pb-1"
              value={title}
              onChangeText={setTitle}
              placeholder="胸の日"
              placeholderTextColor="#444"
            />
          </View>
          <View>
            <Text className="text-gray-500 text-xs mb-1">日付</Text>
            <TextInput
              className="text-white text-base border-b border-[#333] pb-1"
              value={date}
              onChangeText={setDate}
              placeholder="2026-04-15"
              placeholderTextColor="#444"
            />
          </View>
        </View>

        {/* 種目リスト */}
        {exercises.map((exercise, eIndex) => (
          <View key={exercise.id} className="bg-[#1E1E1E] p-4 rounded-3xl mb-6 border border-[#333] relative">
            <View className="flex-row items-center mb-4 pr-10">
              <Dumbbell size={20} color="#03DAC6" />
              <TextInput
                className="text-white text-lg font-bold flex-1 ml-2 border-b border-[#333]"
                value={exercise.name}
                onChangeText={(t) => updateExerciseName(exercise.id, t)}
                placeholder="種目名 (例: ベンチプレス)"
                placeholderTextColor="#444"
              />
            </View>
            <TouchableOpacity 
              onPress={() => removeExercise(exercise.id)}
              className="absolute top-4 right-4 p-2"
            >
              <Trash2 size={20} color="#CF6679" />
            </TouchableOpacity>

            {/* セット見出し */}
            <View className="flex-row mb-2 px-2">
              <Text className="flex-1 text-gray-500 text-xs">Set</Text>
              <Text className="flex-[2] text-gray-500 text-xs">kg</Text>
              <Text className="flex-[2] text-gray-500 text-xs">reps</Text>
              <Text className="flex-[2] text-gray-500 text-xs">rpe</Text>
              <View className="w-8" />
            </View>

            {/* セット入力 */}
            {exercise.sets.map((set, sIndex) => (
              <View key={sIndex} className="flex-row items-center mb-3 bg-[#121212] p-2 rounded-xl">
                <Text className="flex-1 text-gray-400 font-bold">{sIndex + 1}</Text>
                <TextInput
                  className="flex-[2] text-white text-lg font-bold border-b border-[#333] text-center"
                  value={set.weight}
                  onChangeText={(t) => updateSet(exercise.id, sIndex, "weight", t)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#444"
                />
                <TextInput
                  className="flex-[2] text-white text-lg font-bold border-b border-[#333] text-center"
                  value={set.reps}
                  onChangeText={(t) => updateSet(exercise.id, sIndex, "reps", t)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#444"
                />
                <TextInput
                  className="flex-[2] text-white text-lg font-bold border-b border-[#333] text-center"
                  value={set.rpe}
                  onChangeText={(t) => updateSet(exercise.id, sIndex, "rpe", t)}
                  keyboardType="numeric"
                  placeholder="-"
                  placeholderTextColor="#444"
                />
                <TouchableOpacity onPress={() => removeSet(exercise.id, sIndex)} className="w-8 items-center">
                  <X size={16} color="#444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity 
              onPress={() => addSet(exercise.id)}
              className="bg-[#333] p-3 rounded-2xl items-center mt-2 flex-row justify-center"
            >
              <Plus size={16} color="#03DAC6" />
              <Text className="text-[#03DAC6] font-bold ml-2">セットを追加</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* 種目を追加 */}
        <TouchableOpacity 
          onPress={addExercise}
          className="bg-transparent border-2 border-dashed border-[#444] p-4 rounded-3xl items-center mb-8 flex-row justify-center"
        >
          <Plus size={20} color="#444" />
          <Text className="text-gray-500 font-bold ml-2">種目を追加</Text>
        </TouchableOpacity>

        {/* 保存ボタン */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          className="bg-[#03DAC6] p-4 rounded-2xl flex-row items-center justify-center mb-12 shadow-lg"
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Save size={20} color="#000" />
              <Text className="text-black font-bold ml-2 text-lg">トレーニングを保存</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 共通のバツ印アイコン (lucide-react-native に X があればそれを使う)
const X = ({ size, color }: { size: number, color: string }) => (
  <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color, fontSize: size, fontWeight: "bold" }}>×</Text>
  </View>
);
