import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, StyleSheet, Image } from "react-native";
import { api, Meal, Menu } from "../../src/lib/api";
import { foodApi } from "../../src/lib/foodApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Save, Barcode, X, Star, ChevronLeft, Camera, Image as ImageIcon, Trash2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";

const TIME_SLOTS = ["朝食", "昼食", "夕食", "間食", "トレ前", "トレ後"];

export default function MealDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  
  const [form, setForm] = useState<Meal>({
    id: id as string,
    date: "",
    timeSlot: "昼食",
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    imageId: "",
    memo: "",
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summary, menusData] = await Promise.all([
        api.getSummary(),
        api.getMenus()
      ]);
      
      const meal = summary.meals.find(m => m.id === id);
      if (meal) {
        setForm(meal);
        if (meal.imageId) {
          setImage(`https://lh3.googleusercontent.com/d/${meal.imageId}`);
        }
      } else {
        Alert.alert("エラー", "データが見つかりませんでした");
        router.back();
      }
      setMenus(menusData);
    } catch (err) {
      console.error(err);
      Alert.alert("エラー", "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    let result;
    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    };

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("エラー", "カメラの使用が許可されていません");
        return;
      }
      result = await ImagePicker.launchCameraAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setBase64Image(result.assets[0].base64 || null);
    }
  };

  const handleUpdate = async () => {
    if (!form.calories) {
      Alert.alert("エラー", "カロリーを入力してください");
      return;
    }

    try {
      setSaving(true);
      await api.updateMeal({
        ...form,
        calories: Number(form.calories),
        protein: Number(form.protein),
        fat: Number(form.fat),
        carbs: Number(form.carbs),
        base64Image: base64Image || undefined,
      });
      Alert.alert("成功", "保存しました");
      router.replace("/meals/history");
    } catch (err) {
      console.error(err);
      Alert.alert("エラー", "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "削除の確認",
      "この食事記録を削除してもよろしいですか？",
      [
        { text: "キャンセル", style: "cancel" },
        { 
          text: "削除", 
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);
              await api.deleteMeal(id as string);
              router.replace("/meals/history");
            } catch (err) {
              Alert.alert("エラー", "削除に失敗しました");
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#BB86FC" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#121212]">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-4 pt-12 border-b border-[#333]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">詳細・編集</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} className="p-2">
          <Trash2 size={24} color="#CF6679" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* 画像選択セクション */}
        <View className="mb-6">
          <View className="bg-[#1E1E1E] rounded-3xl p-4 border border-[#333] items-center">
            {image ? (
              <View className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                <Image source={{ uri: image }} className="w-full h-full" />
                <TouchableOpacity
                  onPress={() => { setImage(null); setBase64Image(null); }}
                  className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="w-full aspect-[4/3] bg-[#121212] rounded-2xl border-2 border-dashed border-[#333] items-center justify-center mb-4">
                <ImageIcon size={40} color="#333" />
              </View>
            )}
            <View className="flex-row">
              <TouchableOpacity onPress={() => pickImage(true)} className="bg-[#333] px-6 py-3 rounded-full flex-row items-center mr-2">
                <Camera size={18} color="#fff" />
                <Text className="text-white font-bold ml-2">撮影</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => pickImage(false)} className="bg-[#333] px-6 py-3 rounded-full flex-row items-center ml-2">
                <ImageIcon size={18} color="#fff" />
                <Text className="text-white font-bold ml-2">選択</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* フォームセクション */}
        <View className="mb-6">
          <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
            <View className="mb-4">
              <Text className="text-gray-500 text-xs mb-1">日付</Text>
              <TextInput
                className="text-white text-lg border-b border-[#333] pb-1"
                value={form.date}
                onChangeText={(t) => setForm({ ...form, date: t })}
              />
            </View>
            <Text className="text-gray-500 text-xs mb-2">時間帯</Text>
            <View className="flex-row flex-wrap">
              {TIME_SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setForm({ ...form, timeSlot: slot })}
                  className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                    form.timeSlot === slot ? "bg-[#BB86FC] border-[#BB86FC]" : "bg-transparent border-[#444]"
                  }`}
                >
                  <Text className={form.timeSlot === slot ? "text-black font-bold" : "text-gray-400"}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* マクロ栄養素セクション */}
        <View className="mb-6">
          <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-gray-500 text-xs mb-1">カロリー (kcal)</Text>
                <TextInput
                  className="text-white text-xl font-bold border-b border-[#333] pb-1"
                  value={String(form.calories)}
                  onChangeText={(t) => setForm({ ...form, calories: Number(t) })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-500 text-xs mb-1">タンパク質 (g)</Text>
                <TextInput
                  className="text-white text-xl font-bold border-b border-[#333] pb-1"
                  value={String(form.protein)}
                  onChangeText={(t) => setForm({ ...form, protein: Number(t) })}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-gray-500 text-xs mb-1">脂質 (g)</Text>
                <TextInput
                  className="text-white text-xl font-bold border-b border-[#333] pb-1"
                  value={String(form.fat)}
                  onChangeText={(t) => setForm({ ...form, fat: Number(t) })}
                  keyboardType="numeric"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-500 text-xs mb-1">炭水化物 (g)</Text>
                <TextInput
                  className="text-white text-xl font-bold border-b border-[#333] pb-1"
                  value={String(form.carbs)}
                  onChangeText={(t) => setForm({ ...form, carbs: Number(t) })}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </View>

        {/* メモ */}
        <View className="mb-8">
          <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
            <TextInput
              className="text-white text-base"
              value={form.memo}
              onChangeText={(t) => setForm({ ...form, memo: t })}
              multiline
              numberOfLines={2}
              placeholder="メモ"
              placeholderTextColor="#444"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={saving}
          className="bg-[#BB86FC] p-4 rounded-2xl flex-row items-center justify-center mb-12"
        >
          {saving ? <ActivityIndicator color="#000" /> : <><Save size={20} color="#000" /><Text className="text-black font-bold ml-2 text-lg">変更を保存</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
