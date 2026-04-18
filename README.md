# M&T Optimizer (Meal & Training Optimizer)

日々の食事とトレーニング内容の記録。Google Spreadsheetのデータベース活用。身体作り最適化のための個人用アプリケーション。

## 技術スタック
- Frontend: React Native (Expo SDK 54), TypeScript
- Styling: NativeWind (Tailwind CSS v3)
- Backend: Google Apps Script (GAS)
- Database: Google Sheets
- Storage: Google Drive (画像保存用)

## セットアップ手順

### 1. Google スプレッドシートの準備
1. Google Sheetsでの新規シート作成。
2. 以下の5つのタブ（シート）の作成。1行目へのヘッダー記入。
   - Profile: targetWeight, targetCalories, targetProtein, targetFat, targetCarbs
   - Meals: id, date, timeSlot, calories, protein, fat, carbs, imageId, memo
   - Workouts: id, date, title
   - Sets: id, workoutId, exerciseName, weight, reps, rpe, order
   - Menus: id, name, calories, protein, fat, carbs

### 2. Google Apps Script (GAS) の設定
1. スプレッドシートの [拡張機能] > [Apps Script] の選択。
2. `gas/code.gs` 内容のコピー。Apps Scriptエディタへの貼り付け。
3. `ACCESS_KEY` 定数への任意の秘密の文字列設定。
4. [デプロイ] > [新しいデプロイ] の実行。
   - 種類: ウェブアプリ
   - 実行ユーザー: 自分
   - アクセス権: 全員
5. 発行されたウェブアプリURLの保存。

### 3. アプリケーションの設定
1. プロジェクトルートへの `.env` ファイル作成（`.env.example` の複製）。
2. 各項目の設定。
   - EXPO_PUBLIC_GAS_URL: ウェブアプリのURL
   - EXPO_PUBLIC_ACCESS_KEY: GAS側で設定した文字列
   - EXPO_PUBLIC_DRIVE_FOLDER_ID: 画像保存用のGoogle DriveフォルダID
     - Google Driveでのフォルダ作成。URLの folders/ 以降の文字列のコピー。

### 4. 開発の開始
```bash
# 依存関係の導入
npm install

# 起動
npx expo start
```

## ディレクトリ構造
- app/: Expo Routerによる画面定義
- gas/: GASの実装コード
- src/components/: 共通UIコンポーネント
- src/lib/: APIクライアント、ユーティリティ
- src/styles/: グローバルCSS
