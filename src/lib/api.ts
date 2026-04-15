const GAS_URL = "https://script.google.com/macros/s/AKfycbwUew23asqLoeNvftMbxXd3Humjw7hM_NLtS0NKE5DSdXGUclJ-ByiDbu9LjdQst1wQmw/exec";
const ACCESS_KEY = "your-secret-key-here"; // GAS側で設定したものに差し替えてください

export interface Meal {
  id: string;
  date: string;
  timeSlot: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  imageId: string;
  memo: string;
}

export interface Workout {
  id: string;
  date: string;
  title: string;
}

export interface Profile {
  targetWeight: number;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
}

export const api = {
  async getSummary() {
    const url = `${GAS_URL}?action=getSummary&accessKey=${ACCESS_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch summary");
    return response.json() as Promise<{
      meals: Meal[];
      workouts: Workout[];
      profile: Profile;
    }>;
  },

  async addMeal(meal: Omit<Meal, "id">) {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addMeal",
        accessKey: ACCESS_KEY,
        ...meal,
      }),
    });
    if (!response.ok) throw new Error("Failed to add meal");
    return response.json();
  },

  async addWorkout(workout: Omit<Workout, "id"> & { sets: any[] }) {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addWorkout",
        accessKey: ACCESS_KEY,
        ...workout,
      }),
    });
    if (!response.ok) throw new Error("Failed to add workout");
    return response.json();
  },
};
