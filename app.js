/**
 * app.js - 全局入口文件
 * -------------------------------------------------------------
 * 职责：
 *   1. 全局生命周期（onLaunch / onShow / onHide）
 *   2. globalData 存放登录态、基础域名、用户信息等全局数据
 *   3. 封装全局 wx.showToast / wx.showLoading 便捷方法
 *
 * 团队协作约定：
 *   - 所有页面通过 `const app = getApp()` 获取实例
 *   - 全局数据统一挂载到 globalData，禁止散落在各页面
 *   - 基础域名在此维护，request.js 会自动拼接该前缀
 * -------------------------------------------------------------
 */

// ---------- 环境配置：基础域名 + 统一请求前缀 ----------
// 开发/测试/生产 通过运行环境切换，方便 3 人各自联调
const ENV_CONFIG = {
  // 开发环境（联调用本地或测试服）
  development: {
    baseUrl: 'https://dev-api.farm.example.com',
    apiPrefix: '/api/v1' // 统一请求前缀，后期对接后端统一替换
  },
  // 体验/生产环境
  production: {
    baseUrl: 'https://api.farm.example.com',
    apiPrefix: '/api/v1'
  }
};

const tools = require('./utils/tools');
const usage = require('./utils/usage');

/**
 * 获取当前运行环境
 * @returns {String} 'production' | 'development'
 */
function getEnv() {
  try {
    const { miniProgram } = wx.getAccountInfoSync();
    // envVersion: develop(开发版) / trial(体验版) / release(正式版)
    return miniProgram.envVersion === 'release' ? 'production' : 'development';
  } catch (e) {
    return 'development';
  }
}

App({
  /**
   * 全局数据（所有页面共享）
   * 通过 getApp().globalData.xxx 访问
   */
  globalData: {
    // 当前环境配置（通过官方 API 获取运行环境，release 为正式版）
    env: getEnv(),
// 状态栏高度（各页面自定义导航栏使用，onLaunch 初始化）
    statusBarHeight: 0,
    // 登录态 token（接口鉴权时携带）
    token: '',
    // 登录状态标记
    isLogin: false,
    // 云端 openid（静默登录后填充）
    openid: '',
    // 用户信息
    userInfo: null,
    // 域名信息：开发环境可选择是否开启调试（request.js 会读取）
    isDebug: false,
    // 其他业务全局数据可放此处（如：购物车数量等）
    appData: {}
  },

  /**
   * 生命周期 - 小程序初始化时触发（全局只触发一次）
   */
  onLaunch() {
// 初始化状态栏高度（全局共享，避免各页面重复调用 wx.getSystemInfoSync）
    try {
      this.globalData.statusBarHeight = wx.getSystemInfoSync().statusBarHeight || 20;
    } catch (e) {
      this.globalData.statusBarHeight = 20;
    }

    // 初始化云开发（头像等文件上传云存储），需先在开发者工具中开通云开发
    if (wx.cloud) {
      wx.cloud.init({ env: 'cloud1-d5gmj24xffe354a63' });
    }

    // 读取本地缓存的登录态，用于冷启动恢复
    const token = tools.getStorage('token', '');
    const userInfo = tools.getStorage('userInfo', null);
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.isLogin = !!token;

    // 静默登录（云端识别用户 / 拉取云端资料），失败自动降级不阻塞启动
    this.ensureLogin();

    // 记录启动事件
    usage.push('launch', { env: this.globalData.env });

    // 若项目配置开启调试，可在控制台查看环境信息
    console.log('[App] onLaunch 环境配置：', this.globalData.env);
  },

  /**
   * 静默登录：调用 login 云函数，通过 openid 识别用户
   * - 云端已有资料 -> 回填本地缓存
   * - 云端无资料但有本地旧资料 -> 同步到云端（首次迁移）
   */
  ensureLogin() {
    if (this.loginPromise) return this.loginPromise;
    const cloud = require('./utils/cloud');

    this.loginPromise = cloud.call('login')
      .then((user) => {
        this.globalData.openid = (user && user._openid) || '';
        const hasCloudData = user && (user.nickname || user.avatar || user.bio);
        const local = tools.getStorage('userInfo', null);

        if (hasCloudData) {
          this.globalData.userInfo = user;
          tools.setStorage('userInfo', user);
          return null;
        }
        if (local && local.nickname) {
          this.globalData.userInfo = local;
          return cloud.safeCall('saveUserInfo', { userInfo: local });
        }
        return null;
      })
      .catch(() => {
        // 云端不可用：保留本地缓存，不影响使用
        this.globalData.openid = this.globalData.openid || '';
      });

    return this.loginPromise;
  },

  /**
   * 获取当前用户资料（含静默登录等待）
   * @returns {Promise} resolve 用户资料对象或 null
   */
  getUserProfile() {
    return this.ensureLogin().then(() => {
      return this.globalData.userInfo || tools.getStorage('userInfo', null);
    });
  },

  /**
   * 生命周期 - 小程序从前台进入后台（切后台/按 Home）
   */
  onHide() {
    // 退出/切后台时把攒批的行为日志上报云端
    usage.flush();
  },

  /**
   * 生命周期 - 小程序从后台进入前台（切回/重新唤醒）
   */
  onShow() {
    // 预留：可在此处理刷新登录态等逻辑
  },

  // ===================================================================
  // 全局便捷方法（挂到 app 实例上，供所有页面调用）
  // 统一封装 wx.showToast / wx.showLoading，保证全局风格一致
  // ===================================================================

  /**
   * 全局提示 Toast（消息提示）
   * @param {String} title   提示文案（必填）
   * @param {Object} [options] 扩展配置
   *   - icon      success / error / loading / none（默认 none）
   *   - duration  显示时长（默认 2000ms）
   *   - mask      是否显示透明遮罩防穿透
   */
  showToast(title, options = {}) {
    const { icon = 'none', duration = 2000, mask = false } = options;
    wx.showToast({ title, icon, duration, mask });
  },

  /**
   * 全局成功 Toast
   * @param {String} title
   */
  showToastSuccess(title) {
    this.showToast(title, { icon: 'success' });
  },

  /**
   * 全局错误 Toast
   * @param {String} title
   */
  showToastError(title) {
    this.showToast(title, { icon: 'none' });
  },

  /**
   * 全局 Loading（加载中）
   * @param {String} [title]  加载文案（默认“加载中”）
   * @param {Boolean} [mask]  是否遮罩（默认 true）
   */
  showLoading(title = '加载中', mask = true) {
    wx.showLoading({ title, mask });
  },

  /**
   * 关闭 Loading
   */
  hideLoading() {
    wx.hideLoading();
  }
});