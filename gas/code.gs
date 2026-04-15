/**
 * M&T Optimizer - Backend API (GAS)
 */

const ACCESS_KEY = "your-secret-key-here"; // ★ここをアプリ側の .env と合わせる

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
    } else if (action === "addMenu") {
      const sheet = ss.getSheetByName("Menus");
      sheet.appendRow([
        Utilities.getUuid(),
        data.name,
        data.calories,
        data.protein,
        data.fat,
        data.carbs
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // 簡易認証
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
      targetWeight: 0, targetCalories: 2000, targetProtein: 0, targetFat: 0, targetCarbs: 0
    };

    return ContentService.createTextOutput(JSON.stringify({ meals, workouts, profile }))
                         .setMimeType(ContentService.MimeType.JSON);
  } else if (action === "getMenus") {
    const menus = getRowsAsJson(ss.getSheetByName("Menus"));
    return ContentService.createTextOutput(JSON.stringify({ menus }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function getRowsAsJson(sheet) {
  const range = sheet.getDataRange();
  if (range.getNumRows() < 2) return [];
  
  const data = range.getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
}
