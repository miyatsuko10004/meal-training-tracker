const GAS_URL = process.env.EXPO_PUBLIC_GAS_URL || "";
const ACCESS_KEY = process.env.EXPO_PUBLIC_ACCESS_KEY || "";

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

export interface Menu {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const api = {
  async getSummary() {
    if (!GAS_URL) throw new Error("GAS_URL is not defined in environment variables");
    const url = `${GAS_URL}?action=getSummary&accessKey=${ACCESS_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch summary");
    return response.json() as Promise<{
      meals: Meal[];
      workouts: Workout[];
      profile: Profile;
    }>;
  },

  async addMeal(meal: Omit<Meal, "id"> & { base64Image?: string }) {
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

  async getMenus() {
    const url = `${GAS_URL}?action=getMenus&accessKey=${ACCESS_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch menus");
    const data = await response.json();
    return data.menus as Menu[];
  },

  async addMenu(menu: Omit<Menu, "id">) {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addMenu",
        accessKey: ACCESS_KEY,
        ...menu,
      }),
    });
    if (!response.ok) throw new Error("Failed to add menu");
    return response.json();
  },

  async updateProfile(profile: Profile) {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateProfile",
        accessKey: ACCESS_KEY,
        ...profile,
      }),
    });
    if (!response.ok) throw new Error("Failed to update profile");
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
