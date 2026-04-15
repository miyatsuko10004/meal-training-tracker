import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { api, Profile } from "../../src/lib/api";
import { useRouter } from "expo-router";
import { User, Target, Save, Weight, Zap } from "lucide-react-native";

export default function ProfileSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Profile>({
    targetWeight: 0,
    targetCalories: 2000,
    targetProtein: 0,
    targetFat: 0,
    targetCarbs: 0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getSummary();
      if (res.profile) {
        setForm({
          targetWeight: Number(res.profile.targetWeight || 0),
          targetCalories: Number(res.profile.targetCalories || 2000),
          targetProtein: Number(res.profile.targetProtein || 0),
          targetFat: Number(res.profile.targetFat || 0),
          targetCarbs: Number(res.profile.targetCarbs || 0),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateProfile(form);
      Alert.alert("成功", "プロフィールを更新しました");
      router.replace("/");
    } catch (err) {
      console.error(err);
      Alert.alert("エラー", "プロフィールの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#121212] p-4">
      {/* 体重・カロリー設定 */}
      <View className="mb-6">
        <Text className="text-gray-400 text-sm mb-2 font-medium">基本目標</Text>
        <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
          <View className="mb-4">
            <View className="flex-row items-center mb-1">
              <Weight size={14} color="#gray-500" className="mr-1" />
              <Text className="text-gray-500 text-xs">目標体重 (kg)</Text>
            </View>
            <TextInput
              className="text-white text-xl font-bold border-b border-[#333] pb-1"
              value={String(form.targetWeight)}
              onChangeText={(t) => setForm({ ...form, targetWeight: Number(t) })}
              keyboardType="numeric"
              placeholder="0.0"
              placeholderTextColor="#444"
            />
          </View>
          <View>
            <View className="flex-row items-center mb-1">
              <Zap size={14} color="#gray-500" className="mr-1" />
              <Text className="text-gray-500 text-xs">目標摂取カロリー (kcal)</Text>
            </View>
            <TextInput
              className="text-white text-xl font-bold border-b border-[#333] pb-1"
              value={String(form.targetCalories)}
              onChangeText={(t) => setForm({ ...form, targetCalories: Number(t) })}
              keyboardType="numeric"
              placeholder="2000"
              placeholderTextColor="#444"
            />
          </View>
        </View>
      </View>

      {/* PFC設定 */}
      <View className="mb-8">
        <View className="flex-row items-center mb-2">
          <Target size={18} color="#BB86FC" />
          <Text className="text-gray-400 text-sm font-medium ml-2">目標PFCバランス (g)</Text>
        </View>
        <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
          <View className="mb-4">
            <Text className="text-[#BB86FC] text-xs font-bold mb-1">タンパク質 (P)</Text>
            <TextInput
              className="text-white text-xl font-bold border-b border-[#333] pb-1"
              value={String(form.targetProtein)}
              onChangeText={(t) => setForm({ ...form, targetProtein: Number(t) })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#444"
            />
          </View>
          <View className="mb-4">
            <Text className="text-[#03DAC6] text-xs font-bold mb-1">脂質 (F)</Text>
            <TextInput
              className="text-white text-xl font-bold border-b border-[#333] pb-1"
              value={String(form.targetFat)}
              onChangeText={(t) => setForm({ ...form, targetFat: Number(t) })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#444"
            />
          </View>
          <View>
            <Text className="text-[#FFB74D] text-xs font-bold mb-1">炭水化物 (C)</Text>
            <TextInput
              className="text-white text-xl font-bold border-b border-[#333] pb-1"
              value={String(form.targetCarbs)}
              onChangeText={(t) => setForm({ ...form, targetCarbs: Number(t) })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#444"
            />
          </View>
        </View>
      </View>

      {/* 保存ボタン */}
      <TouchableOpacity
        onPress={handleSave}
        disabled={saving}
        className="bg-[#BB86FC] p-4 rounded-2xl flex-row items-center justify-center mb-12 shadow-lg"
      >
        {saving ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Save size={20} color="#000" />
            <Text className="text-black font-bold ml-2 text-lg">設定を保存する</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
