export interface FoodProduct {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/**
 * Open Food Facts API を利用してバーコードから食品情報を取得
 */
export const foodApi = {
  async getProductByBarcode(barcode: string): Promise<FoodProduct | null> {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,nutriments`
      );
      const data = await response.json();

      if (data.status === 0 || !data.product) {
        return null;
      }

      const p = data.product;
      const n = p.nutriments;

      // 100gあたりの値が返ってくることが多いので注意が必要ですが、まずは取得値をそのまま返します
      return {
        name: p.product_name || "不明な食品",
        calories: Math.round(n["energy-kcal_100g"] || 0),
        protein: n.proteins_100g || 0,
        fat: n.fat_100g || 0,
        carbs: n.carbohydrates_100g || 0,
      };
    } catch (err) {
      console.error("Food API Error:", err);
      return null;
    }
  },
};
