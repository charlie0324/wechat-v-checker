const cloudbase = require('@cloudbase/node-sdk');

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

const db = app.database();
const COLLECTION = 'wechat_checker_state';
const DOC_ID = 'main';

function normalizePayload(payload) {
  const value = payload || {};
  return {
    schemaVersion: 2,
    app: 'wechat-v-checker',
    data: Array.isArray(value.data) ? value.data : [],
    metrics: Array.isArray(value.metrics) ? value.metrics : [],
    updatedBy: String(value.updatedBy || '团队成员'),
    updatedAt: value.updatedAt || new Date().toISOString()
  };
}

async function loadState() {
  try {
    const result = await db.collection(COLLECTION).doc(DOC_ID).get();
    const doc = Array.isArray(result.data) ? result.data[0] : result.data;
    return {
      ok: true,
      data: Array.isArray(doc && doc.data) ? doc.data : [],
      metrics: Array.isArray(doc && doc.metrics) ? doc.metrics : [],
      updatedBy: doc && doc.updatedBy || '',
      updatedAt: doc && doc.updatedAt || ''
    };
  } catch (error) {
    const message = String(error && (error.message || error.errMsg || error));
    if (message.includes('not exist') || message.includes('not found') || message.includes('DOCUMENT_NOT_EXIST')) {
      return { ok: true, data: [], metrics: [], updatedAt: '' };
    }
    throw error;
  }
}

async function saveState(payload) {
  const state = normalizePayload(payload);
  try {
    await db.collection(COLLECTION).doc(DOC_ID).set(state);
  } catch (error) {
    const message = String(error && (error.message || error.errMsg || error));
    if (message.includes('already exists') || message.includes('duplicate key')) {
      await db.collection(COLLECTION).doc(DOC_ID).update(state);
    } else {
      throw error;
    }
  }
  return {
    ok: true,
    count: state.data.length,
    metricCount: state.metrics.length,
    updatedBy: state.updatedBy,
    updatedAt: state.updatedAt
  };
}

exports.main = async (event = {}, context = {}) => {
  const cloudContext = cloudbase.getCloudbaseContext(context);
  const action = event.action || 'load';

  if (!cloudContext.OPENID && !cloudContext.UNIONID) {
    throw new Error('请先使用团队账号登录。');
  }

  if (action === 'load') return loadState();
  if (action === 'save') return saveState(event.payload);

  throw new Error(`Unknown action: ${action}`);
};
