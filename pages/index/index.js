/**
 * pages/index/index.js - 首页（皖北珍菌·助农）
 * 布局：绿色导航栏 + 2×3 六功能卡片网格 + 底部 tabBar
 * JS 职责：仅提供卡片路由配置与统一跳转，不写复杂业务
 */
const app = getApp();

Page({
  data: {
    // 标题区
    pageTitle: '皖北珍菌·助农',
    slogan: '菌香皖北 · 乡村振兴',

    // 六个功能卡片配置（图标用 emoji，标题 + 简介 + 跳转路由）
    cards: [
      {
        icon: '🌾',
        title: '红铸初心·机场新村振兴奋斗史',
        desc: '乡村振兴纪实图文展示',
        url: '/pages/article/history/history'
      },
      {
        icon: '🍄',
        title: '皖北珍菌·菌种辨识',
        desc: '本地菌类科普识别',
        url: '/pages/article/mushroom/mushroom'
      },
      {
        icon: '🌱',
        title: '科创兴农·种植流程',
        desc: '双基地培育全过程讲解',
        url: '/pages/article/grow/grow'
      },
      {
        icon: '🍲',
        title: '食养安康·家常食谱',
        desc: '菌类养生食谱查阅',
        url: '/pages/article/recipe/recipe'
      },
      {
        icon: '📰',
        title: '助农资讯',
        desc: '惠农政策、行业动态',
        url: '/pages/article/news/news'
      },
      {
        icon: '📖',
        title: '关于项目',
        desc: '团队实训项目介绍',
        url: '/pages/article/about/about'
      }
    ]
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
        app.showToastError('页面建设中，敬请期待');
      }
    });
  }
});