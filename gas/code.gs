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
      let imageId = "";
      const driveFolderId = data.driveFolderId;
      
      if (data.base64Image && driveFolderId && driveFolderId !== "your-google-drive-folder-id") {
        imageId = saveToDrive(data.base64Image, driveFolderId);
      }

      const sheet = ss.getSheetByName("Meals");
      sheet.appendRow([
        Utilities.getUuid(),
        data.date,
        data.timeSlot,
        data.calories,
        data.protein,
        data.fat,
        data.carbs,
        imageId || data.imageId || "",
        data.memo || ""
      ]);
    } else if (action === "updateMeal") {
      const sheet = ss.getSheetByName("Meals");
      const rowIndex = findRowIndexById(sheet, data.id);
      
      if (rowIndex !== -1) {
        let imageId = data.imageId || "";
        if (data.base64Image && data.driveFolderId) {
          imageId = saveToDrive(data.base64Image, data.driveFolderId);
        }

        const rowData = [
          data.id,
          data.date,
          data.timeSlot,
          data.calories,
          data.protein,
          data.fat,
          data.carbs,
          imageId,
          data.memo || ""
        ];
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        throw new Error("Meal ID not found");
      }
    } else if (action === "deleteMeal") {
      const sheet = ss.getSheetByName("Meals");
      const rowIndex = findRowIndexById(sheet, data.id);
      if (rowIndex !== -1) {
        sheet.deleteRow(rowIndex);
      } else {
        throw new Error("Meal ID not found");
      }
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
    } else if (action === "updateProfile") {
      const sheet = ss.getSheetByName("Profile");
      const rowData = [data.targetWeight, data.targetCalories, data.targetProtein, data.targetFat, data.targetCarbs];
      if (sheet.getLastRow() < 2) {
        sheet.appendRow(rowData);
      } else {
        sheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e.parameter.accessKey !== ACCESS_KEY) {
    return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  if (action === "getSummary") {
    const meals = getRowsAsJson(ss.getSheetByName("Meals"));
    const workouts = getRowsAsJson(ss.getSheetByName("Workouts"));
    const profileRows = getRowsAsJson(ss.getSheetByName("Profile"));
    const profile = profileRows.length > 0 ? profileRows[0] : { targetWeight: 0, targetCalories: 2000, targetProtein: 0, targetFat: 0, targetCarbs: 0 };

    return ContentService.createTextOutput(JSON.stringify({ meals, workouts, profile })).setMimeType(ContentService.MimeType.JSON);
  } else if (action === "getMenus") {
    const menus = getRowsAsJson(ss.getSheetByName("Menus"));
    return ContentService.createTextOutput(JSON.stringify({ menus })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ヘルパー関数
function saveToDrive(base64Image, folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const fileName = `meal_${Utilities.formatDate(new Date(), "GMT+9", "yyyyMMdd_HHmmss")}.jpg`;
  const blob = Utilities.newBlob(Utilities.base64Decode(base64Image), "image/jpeg", fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getId();
}

function findRowIndexById(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const idIndex = values[0].indexOf("id");
  if (idIndex === -1) return -1;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][idIndex] == id) return i + 1;
  }
  return -1;
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
