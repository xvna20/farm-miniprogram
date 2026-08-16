/**
 * utils/router.js - 统一路由管理
 * -------------------------------------------------------------
 * 职责：
 *   1. 集中维护所有页面路径，避免硬编码散落在各页面
 *   2. 提供统一的导航方法，规范 navigateTo / navigateBack / reLaunch 的使用策略
 *
 * 使用示例：
 *   const router = require('../../utils/router')
 *   router.navigate('mushroom')
 *   router.back()
 *   router.backToHome()
 *
 * 导航策略约定：
 *   - navigate()     进入子页面（入栈），支持返回
 *   - replace()      替换当前页面（不入栈），用于详情页切换
 *   - back()         返回上一页
 *   - backToHome()   清空页面栈并回到首页（用于顶级子模块的返回）
 * -------------------------------------------------------------
 */

const routes = {
  // ---- 底部导航 ----
  home:          '/pages/home/home',
  mall:          '/pages/mall/mall',
  user:          '/pages/user/user',

  // ---- 菌菇品类 ----
  mushroom:       '/pages/mushroom/mushroom',
  mushroomDetail1: '/pages/mushroomDetail1/mushroomDetail1',
  mushroomDetail2: '/pages/mushroomDetail2/mushroomDetail2',

  // ---- 科创兴农 ----
  farming:        '/pages/farming/farming',
  farmingDetail1: '/pages/farmingDetail1/farmingDetail1',
  farmingDetail2: '/pages/farmingDetail2/farmingDetail2',
  revenue:        '/pages/revenue/revenue',

  // ---- 食养安康 ----
  health:  '/pages/health/health',
  recipe:  '/pages/recipe/recipe',
  season:  '/pages/season/season',
  safety:  '/pages/safety/safety',

  // ---- 红铸初心 ----
  redHeart:     '/pages/redHeart/redHeart',
  redSpirit:    '/pages/redSpirit/redSpirit',
  redStartup:   '/pages/redStartup/redStartup',
  redMarketing: '/pages/redMarketing/redMarketing',
  redFuture:    '/pages/redFuture/redFuture',

  // ---- 其他 ----
  about:    '/pages/about/about',
  userEdit: '/pages/user/edit-profile/edit-profile'
};

/**
 * 进入子页面（入栈，支持返回）
 * @param {string} name  路由名称
 * @param {object} [query]  URL 参数（自动拼接为 ?key=value&...）
 */
function navigate(name, query) {
  const base = routes[name];
  if (!base) {
    console.error('[Router] 路由不存在:', name);
    return;
  }
  const url = query ? base + '?' + _buildQuery(query) : base;
  wx.navigateTo({
    url,
    fail(err) { console.error('[Router] navigate 失败:', name, err); }
  });
}

/**
 * 替换当前页面（不入栈）
 * 适用于详情页之间的横向切换（如 mushroomDetail1 ↔ mushroomDetail2）
 */
function replace(name, query) {
  const base = routes[name];
  if (!base) {
    console.error('[Router] 路由不存在:', name);
    return;
  }
  const url = query ? base + '?' + _buildQuery(query) : base;
  wx.redirectTo({
    url,
    fail(err) { console.error('[Router] replace 失败:', name, err); }
  });
}

/**
 * 返回上一页
 */
function back() {
  wx.navigateBack();
}

/**
 * 清空页面栈并回到首页
 * 适用于从顶级子模块（mushroom / farming / redHeart）直接返回首页
 */
function backToHome() {
  wx.reLaunch({
    url: routes.home,
    fail(err) { console.error('[Router] backToHome 失败:', err); }
  });
}

/** 内部工具：将对象拼接为 URL query 字符串 */
function _buildQuery(obj) {
  return Object.keys(obj).map(k => `${k}=${encodeURIComponent(obj[k])}`).join('&');
}

module.exports = { routes, navigate, replace, back, backToHome };
