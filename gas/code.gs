/**
 * M&T Optimizer - Backend API (GAS)
 * 
 * 使い方:
 * 1. Google スプレッドシートの [拡張機能] > [Apps Script] を開く
 * 2. このコードをエディタに貼り付ける
 * 3. ACCESS_KEY を自分だけの秘密の文字列に変更する
 * 4. [デプロイ] > [新しいデプロイ] から「ウェブアプリ」として公開する
 */

const ACCESS_KEY = "your-secret-key-here"; // ★ここをアプリ側の src/lib/api.ts と合わせる

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // 簡易認証
  if (data.accessKey !== ACCESS_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
                         .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = data.action;

  try {
    if (action === "addMeal") {
      const sheet = ss.getSheetByName("Meals");
      sheet.appendRow([
        Utilities.getUuid(),
        data.date,
        data.timeSlot,
        data.calories,
        data.protein,
        data.fat,
        data.carbs,
        data.imageId || "",
        data.memo || ""
      ]);
    } else if (action === "addWorkout") {
      const workoutSheet = ss.getSheetByName("Workouts");
      const setSheet = ss.getSheetByName("Sets");
      const workoutId = Utilities.getUuid();

      workoutSheet.appendRow([workoutId, data.date, data.title]);
      
      data.sets.forEach((set, index) => {
        setSheet.appendRow([
          Utilities.getUuid(),
          workoutId,
          set.exerciseName,
          set.weight,
          set.reps,
          set.rpe,
          index + 1
        ]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // 簡易認証 (URLパラメータ ?accessKey=xxx)
  if (e.parameter.accessKey !== ACCESS_KEY) {
    return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  if (action === "getSummary") {
    const meals = getRowsAsJson(ss.getSheetByName("Meals"));
    const workouts = getRowsAsJson(ss.getSheetByName("Workouts"));
    const profileRows = getRowsAsJson(ss.getSheetByName("Profile"));
    const profile = profileRows.length > 0 ? profileRows[0] : {
      targetWeight: 0,
      targetCalories: 2000,
      targetProtein: 0,
      targetFat: 0,
      targetCarbs: 0
    };

    return ContentService.createTextOutput(JSON.stringify({ meals, workouts, profile }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * シートのデータをJSON形式の配列に変換するヘルパー
 */
function getRowsAsJson(sheet) {
  const range = sheet.getDataRange();
  if (range.getNumRows() < 2) return []; // ヘッダーのみ、または空の場合
  
  const data = range.getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}
