/**
 * FILE CODE.GS CHUẨN DÀNH RIÊNG CHO GOOGLE APPS SCRIPT
 * (Không chứa lệnh import - Chạy 100% trên Google Sheets & Google Drive)
 */

function getTargetSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;

  var props = PropertiesService.getScriptProperties();
  var savedId = props.getProperty("ERP_SPREADSHEET_ID");
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (e) {}
  }

  ss = SpreadsheetApp.create("DATABASE_ERP_VA_GIU_XE");
  props.setProperty("ERP_SPREADSHEET_ID", ss.getId());
  return ss;
}

// BƯỚC 1: CHỌN HÀM NÀY VÀ BẤM "CHẠY (RUN)" ĐỂ CẤP QUYỀN
function KHOI_TAO_VA_CAP_QUYEN() {
  var ss = getTargetSpreadsheet();
  var folder = getOrCreateDriveFolder();
  Logger.log("Kết nối Google Sheet thành công: " + ss.getUrl());
  Logger.log("Kết nối thư mục Google Drive thành công: " + folder.getUrl());
}

// (TÙY CHỌN) DÁN MÃ AIzaSy... VÀO ĐÂY RỒI BẤM RUN ĐỂ LƯU KEY ĐỌC BIỂN SỐ
function LUU_KEY_VAO_BO_NHO_NGAM() {
  var myKey = "DAN_MA_AIzaSy_CUA_BAN_VAO_DAY";
  PropertiesService.getScriptProperties().setProperty("GEMINI_API_KEY", myKey.trim());
  Logger.log("Đã lưu GEMINI_API_KEY thành công!");
}

function doGet(e) {
  var ss = getTargetSpreadsheet();
  return jsonResponse({
    success: true,
    ok: true,
    status: "ONLINE",
    service: "HỆ THỐNG QUẢN TRỊ & GIỮ XE NỘI BỘ",
    sheetUrl: ss.getUrl()
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var payload = JSON.parse(e.postData.contents);
    var action = String(payload.action || "CREATE").toUpperCase();
    var sheetName = String(payload.module || "19_LuotGiuXe").trim();
    var data = payload.data || payload;

    if (action === "PING") {
      return jsonResponse({ success: true, ok: true, status: "success", message: "Kết nối thành công!" });
    }

    if (action === "OCR_PLATE") {
      var plate = extractPlateWithGemini(payload.base64Image);
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

    var saved = saveDynamicRecord(sheetName, data);
    return jsonResponse({ success: true, ok: true, status: "success", data: saved });

  } catch (err) {
    return jsonResponse({ success: false, ok: false, status: "error", message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function saveDynamicRecord(sheetName, dataObj) {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  var cleanObj = {};
  for (var k in dataObj) {
    if (k !== "action" && k !== "module") {
      cleanObj[k] = dataObj[k];
    }
  }

  if (cleanObj.base64Image) {
    try {
      var folder = getOrCreateDriveFolder();
      var cleanB64 = String(cleanObj.base64Image).replace(/^data:image\/\w+;base64,/, "");
      var plate = cleanObj.BienSo || "XE";
      var blob = Utilities.newBlob(Utilities.base64Decode(cleanB64), "image/jpeg", "XE_" + plate + "_" + Date.now() + ".jpg");
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      cleanObj.AnhCheckInURL = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800";
      delete cleanObj.base64Image;
    } catch (e) {
      cleanObj.LoiLuuAnh = e.toString();
    }
  }

  var now = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  if (!cleanObj.ID) cleanObj.ID = "ID-" + Date.now();
  if (sheetName === "19_LuotGiuXe") {
    cleanObj.MaVe = cleanObj.MaVe || ("VE-" + Math.floor(100000 + Math.random() * 900000));
    cleanObj.ThoiGianVao = cleanObj.ThoiGianVao || now;
    cleanObj.TrangThai = cleanObj.TrangThai || "Đang gửi";
  }
  cleanObj.NgayTao = cleanObj.NgayTao || now;

  var lastCol = sheet.getLastColumn();
  var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  if (headers.length === 0 || headers[0] === "") {
    headers = Object.keys(cleanObj);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    var lowerHeaders = headers.map(function(h) { return String(h).toLowerCase(); });
    Object.keys(cleanObj).forEach(function(key) {
      if (lowerHeaders.indexOf(key.toLowerCase()) === -1) {
        headers.push(key);
        lowerHeaders.push(key.toLowerCase());
        sheet.getRange(1, headers.length).setValue(key).setFontWeight("bold");
      }
    });
  }

  var keyMap = {};
  Object.keys(cleanObj).forEach(function(key) {
    keyMap[key.toLowerCase()] = cleanObj[key];
  });

  var rowToAppend = headers.map(function(h) {
    var val = keyMap[String(h).toLowerCase()];
    return val !== undefined && val !== null ? val : "";
  });

  sheet.appendRow(rowToAppend);
  return cleanObj;
}

function updateDynamicRecord(sheetName, dataObj) {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, ok: true, data: saveDynamicRecord(sheetName, dataObj) };
  }

  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var lowerHeaders = headers.map(function(h) { return String(h).toLowerCase(); });
  var idIdx = lowerHeaders.indexOf("id");
  var targetId = dataObj.ID || dataObj.id;

  var keyMap = {};
  Object.keys(dataObj).forEach(function(k) {
    keyMap[k.toLowerCase()] = dataObj[k];
  });

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(targetId)) {
      var updatedRow = headers.map(function(h, idx) {
        var k = String(h).toLowerCase();
        return keyMap[k] !== undefined ? keyMap[k] : rows[i][idx];
      });
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([updatedRow]);
      return { success: true, ok: true, status: "success", data: dataObj };
    }
  }
  return { success: true, ok: true, data: saveDynamicRecord(sheetName, dataObj) };
}

function deleteDynamicRecord(sheetName, targetId) {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return { success: true, ok: true };
  var rows = sheet.getDataRange().getValues();
  var idIdx = rows[0].map(function(h) { return String(h).toLowerCase(); }).indexOf("id");
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][idIdx]) === String(targetId)) {
      sheet.deleteRow(i + 1);
      return { success: true, ok: true };
    }
  }
  return { success: true, ok: true };
}

function getSheetData(sheetName) {
  var ss = getTargetSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() <= 1) return [];
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  return rows.slice(1).reverse().map(function(r) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = r[i]; });
    return obj;
  });
}

function extractPlateWithGemini(cleanBase64) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
  if (!apiKey || !cleanBase64) return "NONE";
  try {
    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;
    var payload = {
      contents: [{
        parts: [
          { text: "Đọc biển số xe trong hình này. Chỉ trả về đúng biển số viết hoa (ví dụ 47B1-123.45). Nếu không thấy trả về NONE." },
          { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } }
        ]
      }]
    };
    var res = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    var json = JSON.parse(res.getContentText());
    var text = json.candidates[0].content.parts[0].text.trim();
    return text.replace(/[^A-Z0-9.-]/gi, "").toUpperCase();
  } catch (e) {
    return "NONE";
  }
}

function getOrCreateDriveFolder() {
  var folders = DriveApp.getFoldersByName("ERP_Parking_And_Docs_Storage");
  if (folders.hasNext()) return folders.next();
  var folder = DriveApp.createFolder("ERP_Parking_And_Docs_Storage");
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}