/**
 * BACKEND GOOGLE APPS SCRIPT - TÍCH HỢP AI GEMINI ĐỌC BIỂN SỐ & LƯU GOOGLE DRIVE
 */

function getTargetSpreadsheet() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;

  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty("ERP_SPREADSHEET_ID");
  if (savedId) {
    try { return SpreadsheetApp.openById(savedId); } catch (e) {}
  }

  ss = SpreadsheetApp.create("DATABASE_ERP_VA_GIU_XE");
  props.setProperty("ERP_SPREADSHEET_ID", ss.getId());
  return ss;
}

// CHẠY HÀM NÀY 1 LẦN ĐỂ CẤP QUYỀN GHI SHEET & DRIVE
function KHOI_TAO_VA_CAP_QUYEN() {
  const ss = getTargetSpreadsheet();
  const folder = getOrCreateDriveFolder();
  Logger.log("Sheet URL: " + ss.getUrl());
  Logger.log("Drive Folder URL: " + folder.getUrl());
}

function doGet(e) {
  const ss = getTargetSpreadsheet();
  return jsonResponse({
    success: true,
    ok: true,
    status: "ONLINE",
    service: "HỆ THỐNG QUẢN TRỊ & GIỮ XE NỘI BỘ",
    sheetUrl: ss.getUrl()
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    const payload = JSON.parse(e.postData.contents);
    const action = String(payload.action || "CREATE").toUpperCase();
    const sheetName = String(payload.module || "19_LuotGiuXe").trim();
    const data = payload.data || payload;

    if (action === "PING") {
      return jsonResponse({ success: true, ok: true, status: "success", message: "Kết nối thành công!" });
    }

    // AI ĐỌC BIỂN SỐ XE TỪ ẢNH BASE64 (Nếu cài GEMINI_API_KEY trong Script Properties)
    if (action === "OCR_PLATE") {
      const plate = extractPlateWithGemini(payload.base64Image);
      return jsonResponse({ success: true, ok: true, plate: plate });
    }

    if (action === "GET_DATA") {
      return jsonResponse({ success: true, ok: true, status: "success", data: getSheetData(sheetName) });
    }

    if (action === "DELETE") {
      return jsonResponse(deleteDynamicRecord(sheetName, data.ID || data.id));
    }

    if (action === "UPDATE" || action === "PARKING_CHECKOUT") {
      if (action === "PARKING_CHECKOUT") {
        data.ThoiGianRa = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
        data.TrangThai = "Đã lấy xe";
      }
      return jsonResponse(updateDynamicRecord(sheetName, data));
    }

    // MẶC ĐỊNH: LƯU MỚI HOẶC CHECK-IN GIỮ XE
    const saved = saveDynamicRecord(sheetName, data);
    return jsonResponse({ success: true, ok: true, status: "success", data: saved });

  } catch (err) {
    return jsonResponse({ success: false, ok: false, status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function saveDynamicRecord(sheetName, dataObj) {
  const ss = getTargetSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  const cleanObj = { ...dataObj };
  delete cleanObj.action;
  delete cleanObj.module;

  // Lưu ảnh nén <100KB lên Google Drive và tạo link Thumbnail hiển thị mượt trên mọi điện thoại
  if (cleanObj.base64Image) {
    try {
      const folder = getOrCreateDriveFolder();
      const cleanB64 = String(cleanObj.base64Image).replace(/^data:image\/\w+;base64,/, "");
      const plate = cleanObj.BienSo || "XE";
      const blob = Utilities.newBlob(Utilities.base64Decode(cleanB64), "image/jpeg", `XE_${plate}_${Date.now()}.jpg`);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      cleanObj.AnhCheckInURL = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800";
      delete cleanObj.base64Image;
    } catch (e) {
      cleanObj.LoiLuuAnh = e.toString();
    }
  }

  const now = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  if (!cleanObj.ID) cleanObj.ID = "ID-" + Date.now();
  if (sheetName === "19_LuotGiuXe") {
    cleanObj.MaVe = cleanObj.MaVe || ("VE-" + Math.floor(100000 + Math.random() * 900000));
    cleanObj.ThoiGianVao = cleanObj.ThoiGianVao || now;
    cleanObj.TrangThai = cleanObj.TrangThai || "Đang gửi";
  }
  cleanObj.NgayTao = cleanObj.NgayTao || now;

  const lastCol = sheet.getLastColumn();
  let headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  if (headers.length === 0 || headers[0] === "") {
    headers = Object.keys(cleanObj);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    const lowerHeaders = headers.map(h => String(h).toLowerCase());
    Object.keys(cleanObj).forEach(key => {
      if (!lowerHeaders.includes(key.toLowerCase())) {
        headers.push(key);
        lowerHeaders.push(key.toLowerCase());
        sheet.getRange(1, headers.length).setValue(key).setFontWeight("bold");
      }
    });
  }

  const keyMap = {};
  Object.keys(cleanObj).forEach(k => { keyMap[k.toLowerCase()] = cleanObj[k]; });
  const rowToAppend = headers.map(h => {
    const val = keyMap[String(h).toLowerCase()];
    return val !== undefined && val !== null ? val : "";
  });

  sheet.appendRow(rowToAppend);
  return cleanObj;
}

function updateDynamicRecord(sheetName, dataObj) {
  const ss = getTargetSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, ok: true, data: saveDynamicRecord(sheetName, dataObj) };

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const lowerHeaders = headers.map(h => String(h).toLowerCase());
  const idIdx = lowerHeaders.indexOf("id");
  const targetId = dataObj.ID || dataObj.id;

  const keyMap = {};
  Object.keys(dataObj).forEach(k => { keyMap[k.toLowerCase()] = dataObj[k]; });

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(targetId)) {
      const updatedRow = headers.map((h, idx) => {
        const k = String(h).toLowerCase();
        return keyMap[k] !== undefined ? keyMap[k] : rows[i][idx];
      });
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([updatedRow]);
      return { success: true, ok: true, status: "success", data: dataObj };
    }
  }
  return { success: true, ok: true, data: saveDynamicRecord(sheetName, dataObj) };
}

function deleteDynamicRecord(sheetName, targetId) {
  const ss = getTargetSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, ok: true };
  const rows = sheet.getDataRange().getValues();
  const idIdx = rows[0].map(h => String(h).toLowerCase()).indexOf("id");
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(targetId)) {
      sheet.deleteRow(i + 1);
      return { success: true, ok: true };
    }
  }
  return { success: true, ok: true };
}

function getSheetData(sheetName) {
  const ss = getTargetSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  return rows.slice(1).reverse().map(r => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = r[i]; });
    return obj;
  });
}

function extractPlateWithGemini(cleanBase64) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey || !cleanBase64) return "NONE";
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
    const payload = {
      contents: [{
        parts: [
          { text: "Đọc biển số xe trong hình này. Chỉ trả về đúng biển số viết hoa (ví dụ 47B1-123.45). Nếu không thấy trả về NONE." },
          { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
        ]
      }]
    };
    const res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const json = JSON.parse(res.getContentText());
    const text = json.candidates[0].content.parts[0].text.trim();
    return text.replace(/[^A-Z0-9.-]/gi, "").toUpperCase();
  } catch (e) {
    return "NONE";
  }
}

function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName("ERP_Parking_And_Docs_Storage");
  if (folders.hasNext()) return folders.next();
  const folder = DriveApp.createFolder("ERP_Parking_And_Docs_Storage");
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function LUU_KEY_VAO_BO_NHO_NGAM() {
  // Thay mã AIzaSy... của bạn vào giữa 2 dấu nháy kép dưới đây rồi bấm Run:
  const myKey = "AIzaSy_DAN_MA_CUA_BAN_VAO_DAY"; 
  
  PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", myKey.trim());
  Logger.log("Đã lưu GEMINI_API_KEY thành công vào bộ nhớ bảo mật của Google Apps Script!");
}