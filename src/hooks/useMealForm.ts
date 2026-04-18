import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Meal } from "../lib/api";

export interface MealForm {
  date: string;
  timeSlot: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  memo: string;
}

// タイムゾーン（JST）を考慮した今日の日付取得
export const getTodayStr = () => {
  const now = new Date();
  const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return jst.toISOString().split("T")[0];
};

export const useMealForm = (initialData?: Meal) => {
  const [image, setImage] = useState<string | null>(initialData?.imageId ? `https://lh3.googleusercontent.com/d/${initialData.imageId}` : null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  
  const [form, setForm] = useState<MealForm>({
    date: initialData?.date || getTodayStr(),
    timeSlot: initialData?.timeSlot || "昼食",
    calories: initialData ? String(initialData.calories) : "",
    protein: initialData ? String(initialData.protein) : "",
    fat: initialData ? String(initialData.fat) : "",
    carbs: initialData ? String(initialData.carbs) : "",
    memo: initialData?.memo || "",
  });

  const updateForm = (updates: Partial<MealForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const calculateCaloriesFromPFC = () => {
    const p = Number(form.protein) || 0;
    const f = Number(form.fat) || 0;
    const c = Number(form.carbs) || 0;
    const total = p * 4 + f * 9 + c * 4;
    if (total > 0) {
      updateForm({ calories: String(total) });
    } else {
      Alert.alert("情報不足", "PFCの値を入力してください");
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

  const validate = () => {
    if (!form.calories || isNaN(Number(form.calories))) {
      Alert.alert("エラー", "正しいカロリーを入力してください");
      return false;
    }
    return true;
  };

  const getNumericData = () => {
    return {
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      fat: Number(form.fat) || 0,
      carbs: Number(form.carbs) || 0,
    };
  };

  return {
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
  };
};
