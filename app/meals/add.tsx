import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, StyleSheet, Image } from "react-native";
import { api, Menu } from "../../src/lib/api";
import { foodApi } from "../../src/lib/foodApi";
import { useRouter } from "expo-router";
import { Save, Barcode, X, Star, ChevronRight, Camera, Image as ImageIcon } from "lucide-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useMealForm } from "../../src/hooks/useMealForm";

const TIME_SLOTS = ["朝食", "昼食", "夕食", "間食", "トレ前", "トレ後"];

export default function AddMeal() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [historySuggestions, setHistorySuggestions] = useState<Menu[]>([]);

  const {
    form,
    updateForm,
    image,
    setImage,
    base64Image,
    setBase64Image,
    pickImage,
    calculateCaloriesFromPFC,
    validate,
    getNumericData,
  } = useMealForm();

  useEffect(() => {
    loadMenus();
    loadHistorySuggestions();
  }, []);

  const loadMenus = async () => {
    try {
      const data = await api.getMenus();
      setMenus(data);
    } catch (err) {
      console.error("Failed to load menus", err);
    }
  };

  const loadHistorySuggestions = async () => {
    try {
      const res = await api.getSummary();
      const suggestions: Menu[] = [];
      const seen = new Set();
      
      [...res.meals].reverse().forEach(m => {
        if (m.memo && !seen.has(m.memo)) {
          seen.add(m.memo);
          suggestions.push({
            id: m.id,
            name: m.memo,
            calories: m.calories,
            protein: m.protein,
            fat: m.fat,
            carbs: m.carbs
          });
        }
      });
      setHistorySuggestions(suggestions.slice(0, 5));
    } catch (err) {
      console.error("Failed to load history suggestions", err);
    }
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setIsScanning(false);
    setLoading(true);
    try {
      const product = await foodApi.getProductByBarcode(data);
      if (product) {
        updateForm({
          calories: String(product.calories),
          protein: String(product.protein),
          fat: String(product.fat),
          carbs: String(product.carbs),
          memo: `${product.name} (バーコード読み取り)`,
        });
        Alert.alert("成功", `${product.name} の情報を取得しました`);
      } else {
        Alert.alert("未登録", "食品データベースに見つかりませんでした");
      }
    } catch (err) {
      Alert.alert("エラー", "情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const copyYesterdayMeal = async () => {
    try {
      setLoading(true);
      const res = await api.getSummary();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      
      const yesterdayMeals = res.meals.filter(m => m.date === yesterdayStr);
      const sameTimeMeal = yesterdayMeals.find(m => m.timeSlot === form.timeSlot) || yesterdayMeals[0];
      
      if (sameTimeMeal) {
        updateForm({
          calories: String(sameTimeMeal.calories),
          protein: String(sameTimeMeal.protein),
          fat: String(sameTimeMeal.fat),
          carbs: String(sameTimeMeal.carbs),
          memo: sameTimeMeal.memo,
        });
        Alert.alert("成功", "昨日の食事内容をコピーしました");
      } else {
        Alert.alert("データなし", "昨日の食事記録が見つかりませんでした");
      }
    } catch (err) {
      Alert.alert("エラー", "コピーに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const selectMenu = (menu: Menu) => {
    updateForm({
      calories: String(menu.calories),
      protein: String(menu.protein),
      fat: String(menu.fat),
      carbs: String(menu.carbs),
      memo: menu.name,
    });
    setIsMenuModalVisible(false);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const numericData = getNumericData();
      await api.addMeal({
        date: form.date,
        timeSlot: form.timeSlot,
        ...numericData,
        imageId: "",
        base64Image: base64Image || undefined,
        memo: form.memo,
      });
      router.replace("/");
    } catch (err) {
      console.error(err);
      Alert.alert("エラー", "データの保存に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#121212] p-4">
      <View className="flex-row justify-between mb-4">
        <TouchableOpacity onPress={() => setIsScanning(true)} className="bg-[#1E1E1E] flex-1 mr-2 p-4 rounded-2xl flex-row items-center justify-center border border-[#BB86FC]">
          <Barcode size={18} color="#BB86FC" />
          <Text className="text-[#BB86FC] font-bold ml-2">バーコード</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsMenuModalVisible(true)} className="bg-[#1E1E1E] flex-1 ml-2 p-4 rounded-2xl flex-row items-center justify-center border border-[#03DAC6]">
          <Star size={18} color="#03DAC6" />
          <Text className="text-[#03DAC6] font-bold ml-2">マイメニュー</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between mb-6">
        <TouchableOpacity onPress={copyYesterdayMeal} className="bg-[#1E1E1E] flex-1 mr-2 p-3 rounded-2xl flex-row items-center justify-center border border-gray-600">
          <Text className="text-gray-400 font-bold">昨日の内容をコピー</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={calculateCaloriesFromPFC} className="bg-[#1E1E1E] flex-1 ml-2 p-3 rounded-2xl flex-row items-center justify-center border border-gray-600">
          <Text className="text-gray-400 font-bold">PFCから計算</Text>
        </TouchableOpacity>
      </View>

      {historySuggestions.length > 0 && (
        <View className="mb-6">
          <Text className="text-gray-400 text-sm mb-2 font-medium">履歴から素早く入力</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {historySuggestions.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => selectMenu(item)} className="bg-[#1E1E1E] mr-3 p-3 rounded-2xl border border-[#333] min-w-[120px]">
                <Text className="text-white font-bold mb-1" numberOfLines={1}>{item.name}</Text>
                <Text className="text-gray-500 text-[10px]">{item.calories}kcal</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View className="mb-6">
        <Text className="text-gray-400 text-sm mb-2 font-medium">食事の写真</Text>
        <View className="bg-[#1E1E1E] rounded-3xl p-4 border border-[#333] items-center">
          {image ? (
            <View className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4">
              <Image source={{ uri: image }} className="w-full h-full" />
              <TouchableOpacity onPress={() => {setImage(null); setBase64Image(null);}} className="absolute top-2 right-2 bg-black/50 p-2 rounded-full">
                <X size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="w-full aspect-[4/3] bg-[#121212] rounded-2xl border-2 border-dashed border-[#333] items-center justify-center mb-4">
              <Camera size={40} color="#333" />
            </View>
          )}
          <View className="flex-row">
            <TouchableOpacity onPress={() => pickImage(true)} className="bg-[#333] px-6 py-3 rounded-full flex-row items-center mr-2"><Camera size={18} color="#fff" /><Text className="text-white font-bold ml-2">撮影</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => pickImage(false)} className="bg-[#333] px-6 py-3 rounded-full flex-row items-center ml-2"><ImageIcon size={18} color="#fff" /><Text className="text-white font-bold ml-2">選択</Text></TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-gray-400 text-sm mb-2 font-medium">基本情報</Text>
        <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
          <View className="mb-4">
            <Text className="text-gray-500 text-xs mb-1">日付</Text>
            <TextInput className="text-white text-lg border-b border-[#333] pb-1" value={form.date} onChangeText={(t) => updateForm({ date: t })} />
          </View>
          <Text className="text-gray-500 text-xs mb-2">時間帯</Text>
          <View className="flex-row flex-wrap">
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity key={slot} onPress={() => updateForm({ timeSlot: slot })} className={`mr-2 mb-2 px-4 py-2 rounded-full border ${form.timeSlot === slot ? "bg-[#BB86FC] border-[#BB86FC]" : "bg-transparent border-[#444]"}`}>
                <Text className={form.timeSlot === slot ? "text-black font-bold" : "text-gray-400"}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-gray-400 text-sm mb-2 font-medium">マクロ栄養素</Text>
        <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2"><Text className="text-gray-500 text-xs mb-1">カロリー (kcal)</Text><TextInput className="text-white text-xl font-bold border-b border-[#333] pb-1" value={form.calories} onChangeText={(t) => updateForm({ calories: t })} keyboardType="numeric" /></View>
            <View className="flex-1 ml-2"><Text className="text-gray-500 text-xs mb-1">タンパク質 (g)</Text><TextInput className="text-white text-xl font-bold border-b border-[#333] pb-1" value={form.protein} onChangeText={(t) => updateForm({ protein: t })} keyboardType="numeric" /></View>
          </View>
          <View className="flex-row justify-between">
            <View className="flex-1 mr-2"><Text className="text-gray-500 text-xs mb-1">脂質 (g)</Text><TextInput className="text-white text-xl font-bold border-b border-[#333] pb-1" value={form.fat} onChangeText={(t) => updateForm({ fat: t })} keyboardType="numeric" /></View>
            <View className="flex-1 ml-2"><Text className="text-gray-500 text-xs mb-1">炭水化物 (g)</Text><TextInput className="text-white text-xl font-bold border-b border-[#333] pb-1" value={form.carbs} onChangeText={(t) => updateForm({ carbs: t })} keyboardType="numeric" /></View>
          </View>
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 text-sm mb-2 font-medium">メニュー名 / メモ</Text>
        <View className="bg-[#1E1E1E] rounded-2xl p-4 border border-[#333]">
          <TextInput className="text-white text-base" value={form.memo} onChangeText={(t) => updateForm({ memo: t })} multiline numberOfLines={2} placeholderTextColor="#444" />
        </View>
      </View>

      <View className="mb-12">
        <TouchableOpacity onPress={handleSave} disabled={loading} className="bg-[#BB86FC] p-4 rounded-2xl flex-row items-center justify-center shadow-lg">
          {loading ? <ActivityIndicator color="#000" /> : <><Save size={20} color="#000" /><Text className="text-black font-bold ml-2 text-lg">記録を保存する</Text></>}
        </TouchableOpacity>
      </View>

      <Modal visible={isMenuModalVisible} animationType="slide">
        <View className="flex-1 bg-[#121212] p-6">
          <View className="flex-row justify-between items-center mb-6"><Text className="text-white text-2xl font-bold">マイメニュー</Text><TouchableOpacity onPress={() => setIsMenuModalVisible(false)}><X size={24} color="#fff" /></TouchableOpacity></View>
          <ScrollView>
            {menus.map((menu) => (
              <TouchableOpacity key={menu.id} onPress={() => selectMenu(menu)} className="bg-[#1E1E1E] p-4 rounded-2xl mb-3 flex-row items-center border border-[#333]">
                <View className="flex-1"><Text className="text-white font-bold text-lg">{menu.name}</Text><Text className="text-gray-400 text-sm">{menu.calories}kcal | P:{menu.protein} F:{menu.fat} C:{menu.carbs}</Text></View>
                <ChevronRight size={20} color="#444" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={isScanning} animationType="slide">
        <View className="flex-1 bg-black">
          <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={handleBarcodeScanned} barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }} />
          <TouchableOpacity onPress={() => setIsScanning(false)} className="absolute top-12 right-6 bg-[#1E1E1E] p-2 rounded-full"><X size={24} color="#fff" /></TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
