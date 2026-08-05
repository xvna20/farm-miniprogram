/**
 * utils/request.js - 统一网络请求封装
 * -------------------------------------------------------------
 * 职责：
 *   1. 统一请求方法（GET / POST / PUT / DELETE / UPLOAD）
 *   2. 自动拼接 baseUrl + apiPrefix 统一前缀，方便后期对接后端
 *   3. 自动携带统一请求头（token / content-type）
 *   4. 统一拦截 loading、异常提示、错误处理
 *
 * 使用示例：
 *   const { get, post } = require('../../utils/request')
 *   get('/goods/list', { page: 1 }).then(res => {...})
 *   post('/order/create', { id: 1 }).then(res => {...})
 *
 * 团队协作约定：
 *   - 后端接口约定统一前缀（如 /api/v1），对接时只改 app.js 的 apiPrefix
 *   - 业务开发时禁止在页面单独调用 wx.request，统一走本文件
 * -------------------------------------------------------------
 */
const app = getApp();

// 统一错误码（业务约定，可调整）
const HTTP = { SUCCESS: 200, UNAUTHORIZED: 401 };

/**
 * 默认请求配置
 */
const DEFAULT_CONFIG = {
  // 是否显示 loading（默认 false，需要时传 true）
  showLoading: false,
  // loading 文案
  loadingText: '加载中',
  // 是否在失败时统一弹 Toast（默认 true）
  showError: true,
  // 是否需要登录态（无 token 时自动拦截跳登录）
  needAuth: false,
  // 超时时间（ms）
  timeout: 10000,
  // Content-Type
  header: { 'Content-Type': 'application/json' }
};

/**
 * 核心请求方法
 * @param {String} method  请求方法
 * @param {String} url     接口路径（相对路径，自动拼接前缀）
 * @param {Object} data    请求参数
 * @param {Object} options 扩展配置（覆盖 DEFAULT_CONFIG）
 * @returns {Promise}      resolve 业务数据 / reject 抛错
 */
function request(method, url, data = {}, options = {}) {
  // 合并配置
  const config = { ...DEFAULT_CONFIG, ...options };
  const { baseUrl = '', apiPrefix = '' } = app.globalData.env || {};

  // ---- 需要登录态但未登录：统一拦截 ----
  if (config.needAuth && !app.globalData.token) {
    // 预留：跳转登录页
    return Promise.reject({ code: HTTP.UNAUTHORIZED, msg: '请先登录' });
  }

  // ---- loading ----
  if (config.showLoading) {
    wx.showLoading({ title: config.loadingText, mask: true });
  }

  // ---- 统一请求头（token 等）----
  const header = {
    ...config.header,
    ...(app.globalData.token ? { Authorization: `Bearer ${app.globalData.token}` } : {})
  };

  return new Promise((resolve, reject) => {
    wx.request({
      // 拼接统一前缀，方便整体替换成对应环境域名
      url: `${baseUrl}${apiPrefix}${url}`,
      method,
      data,
      header,
      timeout: config.timeout,
      success(res) {
        // 2xx 视为请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const body = res.data || {};
          // 后端规范：{ code, msg, data }。按实际后端结构调整
          if (body.code === HTTP.SUCCESS) {
            resolve(body.data);
          } else {
            // 业务错误
            handleError(body.msg || '业务处理失败', config, reject);
          }
        } else if (res.statusCode === HTTP.UNAUTHORIZED) {
          // 登录失效：预留跳转登录
          handleError('登录已失效', config, reject);
        } else {
          handleError(`请求失败(${res.statusCode})`, config, reject);
        }
      },
      fail(err) {
        handleError('网络异常，请稍后重试', config, reject, err);
      },
      complete() {
        if (config.showLoading) {
          wx.hideLoading();
        }
      }
    });
  });
}

/**
 * 统一错误处理：弹出提示并 reject
 */
function handleError(msg, config, reject, err) {
  if (config.showError && msg) {
    wx.showToast({ title: msg, icon: 'none' });
  }
  reject(err || { code: -1, msg });
}

/* ==================== 快捷导出方法 ==================== */

/** GET 请求 */
function get(url, data, options) {
  return request('GET', url, data, options);
}

/** POST 请求 */
function post(url, data, options) {
  return request('POST', url, data, options);
}

/** PUT 请求 */
function put(url, data, options) {
  return request('PUT', url, data, options);
}

/** DELETE 请求 */
function del(url, data, options) {
  return request('DELETE', url, data, options);
}

/**
 * 文件上传（封装 wx.uploadFile）
 * @param {String} url      上传接口路径
 * @param {String} filePath 本地文件路径
 * @param {Object} formData 额外参数
 * @param {Object} options  扩展配置
 */
function upload(url, filePath, formData = {}, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  const { baseUrl = '', apiPrefix = '' } = app.globalData.env || {};

  if (config.showLoading) {
    wx.showLoading({ title: config.loadingText, mask: true });
  }

  const header = {
    ...(app.globalData.token ? { Authorization: `Bearer ${app.globalData.token}` } : {})
  };

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${baseUrl}${apiPrefix}${url}`,
      filePath,
      name: 'file',
      formData,
      header,
      success(res) {
        const body = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (body.code === HTTP.SUCCESS) {
          resolve(body.data);
        } else {
          handleError(body.msg || '上传失败', config, reject);
        }
      },
      fail(err) {
        handleError('上传失败，请稍后重试', config, reject, err);
      },
      complete() {
        if (config.showLoading) {
          wx.hideLoading();
        }
      }
    });
  });
}

module.exports = { get, post, put, del, upload, request };