const SECRET = '把这里改成你的同步密钥';
const SHEET_NAME = 'wechat_tracker_db';

const HEADERS = [
  'id',
  'date',
  'precisionStatus',
  'formFilled',
  'timestamp',
  'formFilledAt',
  'formMatchedFrom'
];

function doGet(e) {
  try {
    assertSecret(e.parameter.secret);
    const action = e.parameter.action || 'load';
    if (action !== 'load') return json({ ok: false, error: 'Unknown action. 上传请使用 POST，请确认 HTML 和 Apps Script 都是最新版。' });
    return output(e, { ok: true, data: readRows(), updatedAt: new Date().toISOString() });
  } catch (error) {
    return output(e, { ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    assertSecret(payload.secret || (e.parameter && e.parameter.secret));
    const data = Array.isArray(payload.data) ? payload.data : [];
    writeRows(data);
    return json({ ok: true, count: data.length, updatedAt: new Date().toISOString() });
  } catch (error) {
    return json({ ok: false, error: error.message });
  }
}

function assertSecret(secret) {
  if (!SECRET || SECRET === '把这里改成你的同步密钥') {
    throw new Error('Apps Script 里的 SECRET 还没有设置');
  }
  if (secret !== SECRET) throw new Error('同步密钥不正确');
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function readRows() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  const headers = values[0].map(String);
  return values.slice(1).filter(row => row[0]).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return {
      id: String(item.id || ''),
      date: formatDateValue(item.date),
      precisionStatus: normalizePrecision(item.precisionStatus),
      formFilled: item.formFilled === true || String(item.formFilled).toLowerCase() === 'true' || String(item.formFilled).includes('已填') || String(item.formFilled).includes('已约'),
      timestamp: Number(item.timestamp || Date.now()),
      formFilledAt: String(item.formFilledAt || ''),
      formMatchedFrom: String(item.formMatchedFrom || '')
    };
  });
}

function writeRows(data) {
  const sheet = getSheet();
  sheet.clearContents();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

  if (data.length === 0) return;

  const rows = data.map(item => [
    item.id || '',
    item.date || '',
    normalizePrecision(item.precisionStatus),
    !!item.formFilled,
    Number(item.timestamp || Date.now()),
    item.formFilledAt || '',
    item.formMatchedFrom || ''
  ]);
  sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
}

function normalizePrecision(value) {
  if (value === 'accurate' || value === '精准' || value === '确定精准') return 'accurate';
  if (value === 'inaccurate' || value === '不精准') return 'inaccurate';
  return 'unknown';
}

function formatDateValue(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(value || '');
}

function json(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

function output(e, value) {
  const callback = e && e.parameter && e.parameter.callback;
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${JSON.stringify(value)});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json(value);
}
