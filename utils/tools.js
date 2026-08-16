/**
 * utils/tools.js - 通用工具库
 * -------------------------------------------------------------
 * 职责：
 *   1. 日期处理：格式化 / 相对时间 / 时间戳转换
 *   2. 正则校验：手机号 / 身份证 / 金额等常用校验
 *   3. 防抖 / 节流
 *   4. 存储封装：基于 wx.getStorageSync / setStorageSync
 *
 * 使用示例：
 *   const tools = require('../../utils/tools')
 *   tools.formatTime(new Date())
 *   tools.isPhone('13800138000')
 *
 * 团队协作约定：
 *   - 只放通用、无业务耦合的工具函数
 *   - 有业务语义的逻辑（如“订单状态文案”）请放到各自业务模块
 * -------------------------------------------------------------
 */

/* ==================== 一、日期处理 ==================== */

/**
 * 补零
 * @param {Number} n
 * @returns {String}
 */
function padZero(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * 格式化日期
 * @param {Date|Number|String} date  Date 对象 / 时间戳(ms) / 日期字符串
 * @param {String} [pattern] 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {String}
 *
 * 示例：
 *   formatTime(new Date())                       => '2026-08-05 12:00:00'
 *   formatTime(1710000000000, 'YYYY年MM月DD日')   => '2026年08月05日'
 */
function formatTime(date, pattern = 'YYYY-MM-DD HH:mm:ss') {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const map = {
    YYYY: d.getFullYear(),
    MM: padZero(d.getMonth() + 1),
    DD: padZero(d.getDate()),
    HH: padZero(d.getHours()),
    mm: padZero(d.getMinutes()),
    ss: padZero(d.getSeconds())
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match]);
}

/**
 * 相对时间（刚刚 / x分钟前 / x小时前 / x天前 / 日期）
 * @param {Date|Number|String} date
 * @returns {String}
 */
function fromNow(date) {
  const time = new Date(date).getTime();
  if (isNaN(time)) return '';
  const diff = Date.now() - time;
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  if (diff < MINUTE) return '刚刚';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}分钟前`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}小时前`;
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)}天前`;
  return formatTime(time, 'YYYY-MM-DD');
}

/**
 * 日期字符串转时间戳
 * @param {String} str  'YYYY-MM-DD HH:mm:ss'
 * @returns {Number}    时间戳(ms)，兼容 iOS 使用斜杠分隔
 */
function toTimestamp(str) {
  if (!str) return NaN;
  return new Date(str.replace(/-/g, '/')).getTime();
}

/* ==================== 二、正则校验 ==================== */

/** 手机号校验（大陆 11 位） */
function isPhone(value) {
  return /^1[3-9]\d{9}$/.test(String(value).trim());
}

/** 身份证校验（15/18 位，粗略校验） */
function isIdCard(value) {
  return /(^\d{15}$)|(^\d{17}(\d|X|x)$)/.test(String(value).trim());
}

/** 邮箱校验 */
function isEmail(value) {
  return /^[\w.%+-]+@[\w-]+(\.[\w-]+)+$/.test(String(value).trim());
}

/** 金额校验（两位小数以内，≥0） */
function isAmount(value) {
  return /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(String(value).trim());
}

/** 是否为手机号（业务常用别名，可读性更好） */
function isMobile(value) {
  return isPhone(value);
}

/* ==================== 三、防抖 / 节流 ==================== */

/**
 * 防抖：最后一次调用后 delay 毫秒才执行
 * @param {Function} fn    需要防抖的函数
 * @param {Number}   delay 延迟毫秒数（默认 300）
 * @returns {Function}      包装后的函数
 * 常用于：搜索输入、表单校验、resize 等高频触发场景
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流：每隔 interval 毫秒至多执行一次
 * @param {Function} fn       需要节流的函数
 * @param {Number}   interval 间隔毫秒数（默认 300）
 * @param {Boolean}  immediate 是否立即执行第一次（默认 false）
 * @returns {Function}         包装后的函数
 * 常用于：滚动监听、点击提交（防连点）等
 */
function throttle(fn, interval = 300, immediate = false) {
  let last = 0;
  let timer = null;
  return function (...args) {
    const now = Date.now();
    if (immediate && !last) {
      fn.apply(this, args);
      last = now;
      return;
    }
    if (now - last >= interval) {
      fn.apply(this, args);
      last = now;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        last = Date.now();
        timer = null;
      }, interval - (now - last));
    }
  };
}

/* ==================== 四、存储封装 ==================== */

/**
 * 获取缓存（同步）
 * @param {String} key      缓存 key
 * @param {*}      defValue 默认值（无缓存时返回）
 */
function getStorage(key, defValue = '') {
  try {
    const value = wx.getStorageSync(key);
    return value === '' || value === undefined || value === null ? defValue : value;
  } catch (e) {
    console.error('[getStorage]', key, e);
    return defValue;
  }
}

/**
 * 设置缓存（同步）
 * @param {String} key
 * @param {*}      value
 */
function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error('[setStorage]', key, e);
    return false;
  }
}

/**
 * 删除缓存（同步）
 * @param {String} key
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('[removeStorage]', key, e);
    return false;
  }
}

/**
 * 清空缓存（同步）
 */
function clearStorage() {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('[clearStorage]', e);
    return false;
  }
}

module.exports = {
  // 日期处理
  formatTime,
  fromNow,
  toTimestamp,
  padZero,
  // 正则校验
  isPhone,
  isMobile,
  isIdCard,
  isEmail,
  isAmount,
  // 防抖 / 节流
  debounce,
  throttle,
  // 存储封装
  getStorage,
  setStorage,
  removeStorage,
  clearStorage
};