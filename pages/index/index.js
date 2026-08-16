/**
 * pages/index/index.js - 首页（皖北珍菌·助农）
 * 布局：绿色导航栏 + 2×3 六功能卡片网格 + 底部 tabBar
 * JS 职责：仅提供卡片路由配置与统一跳转，不写复杂业务
 */
const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    headerHeight: 64,
    heroImage: '/image/01_首页菌菇基地.jpeg',
    // 四大主题卡片配置（编号 + 标题 + 简介 + 跳转路由）
    cards: [
      {
        number: '01',
        title: '红铸初心',
        desc: '新村振兴奋斗史',
        url: '/pages/article/history/history'
      },
      {
        number: '02',
        title: '皖北珍菌',
        desc: '地域特色物产图鉴',
        url: '/pages/article/mushroom/mushroom'
      },
      {
        number: '03',
        title: '科创兴农',
        desc: '双基地产业助农',
        url: '/pages/article/grow/grow'
      },
      {
        number: '04',
        title: '食养安康',
        desc: '菌菇养生应用指南',
        url: '/pages/article/recipe/recipe'
      }
    ]
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    const rpxToPx = sysInfo.windowWidth / 750;
    const statusBarHeight = sysInfo.statusBarHeight || 20;
    // header 总高度 = 状态栏 + header-inner(88rpx)
    const headerHeight = Math.ceil(statusBarHeight + 88 * rpxToPx);
    this.setData({
      statusBarHeight: statusBarHeight,
      headerHeight: headerHeight
    });
  },

  /**
   * 卡片点击：统一跳转对应路由
   * 目标页面尚未创建时，兜底提示（适配团队分步开发，不因缺页面而报错）
   */
  onCardTap(e) {
    const index = e.currentTarget.dataset.index;
    const card = this.data.cards[index];
    if (!card) return;

    wx.navigateTo({
      url: card.url,
      fail: () => {
        // 页面未建立时的友好提示
        wx.showToast({ title: '页面建设中，敬请期待', icon: 'none' });
      }
    });
  },

  /**
   * Hero 探索按钮点击
   */
  onExploreTap() {
    wx.showToast({ title: '开始探索', icon: 'none' });
  }
});