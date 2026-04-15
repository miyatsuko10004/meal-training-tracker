# M&T Optimizer (Meal & Training Optimizer)

日々の食事とトレーニング内容を記録し、Google Spreadsheet をデータベースとして活用して身体作りを最適化するための個人用アプリケーションです。

## 🚀 技術スタック
- **Frontend:** React Native (Expo SDK 54) + TypeScript
- **Styling:** NativeWind (Tailwind CSS v3)
- **Backend:** Google Apps Script (GAS)
- **Database:** Google Sheets
- **Storage:** Google Drive (画像保存用)

## 🛠 セットアップ手順

### 1. Google スプレッドシートの準備
1. [Google Sheets](https://sheets.new/) で新しいシートを作成。
2. 以下の 4 つのタブ（シート）を作成し、1行目にヘッダーを記入します。
   - **`Profile`**: `targetWeight`, `targetCalories`, `targetProtein`, `targetFat`, `targetCarbs`
   - **`Meals`**: `id`, `date`, `timeSlot`, `calories`, `protein`, `fat`, `carbs`, `imageId`, `memo`
   - **`Workouts`**: `id`, `date`, `title`
   - **`Sets`**: `id`, `workoutId`, `exerciseName`, `weight`, `reps`, `rpe`, `order`

### 2. Google Apps Script (GAS) の設定
1. スプレッドシートの **[拡張機能] > [Apps Script]** を開く。
2. プロジェクト内の **`gas/code.gs`** の内容をコピーして、Apps Script エディタに貼り付ける。
3. コード内の `ACCESS_KEY` 定数を自分だけの秘密の文字列に設定する。
4. **[デプロイ] > [新しいデプロイ]** を選択。
   - 種類: ウェブアプリ
   - 次のユーザーとして実行: 自分
   - アクセスできるユーザー: 全員
5. 発行された **ウェブアプリの URL** をコピー。

### 3. アプリケーションの設定
1. `src/lib/api.ts` を開き、以下の値を設定します。
   - `GAS_URL`: 先ほどコピーしたウェブアプリの URL
   - `ACCESS_KEY`: GAS 側で設定した秘密の文字列

### 4. 開発の開始
```bash
# 依存関係のインストール
npm install

# アプリの起動
npx expo start
```
iPhone の `Expo Go` アプリで QR コードを読み取るか、`w` キーで Web 版を確認できます。

## 📂 ディレクトリ構造
- `app/`: Expo Router による画面遷移定義
- `src/components/`: 再利用可能な UI コンポーネント
- `src/lib/`: API クライアント、ユーティリティ
- `src/styles/`: グローバル CSS (Tailwind)
