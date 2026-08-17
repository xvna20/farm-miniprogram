/**
 * pages/user/user.js - 个人中心页
 * 正式业务由成员三开发（个人中心 / 编辑资料 / 意见反馈 / 收货地址 / 订单状态）
 */
const app = getApp();
const tools = require('../../utils/tools');

Page({
  data: {
    statusBarHeight: 20,
    userInfo: {
      nickname: '珠城寻菌人',
      bio: '支持乡村好物 · 记录实践足迹',
      avatar: ''
    },
    orders: [
      { key: 'unpaid',   count: 0, label: '待付款' },
      { key: 'unshipped', count: 1, label: '待发货' },
      { key: 'unreceived', count: 1, label: '待收货' },
      { key: 'done',     count: 3, label: '已完成' }
    ]
  },

  onLoad() {
    const sysInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20
    });
    this.refreshUserInfo();
  },

  onShow() {
    this.refreshUserInfo();
    this.refreshOrderCounts();
  },

  /* 从全局数据/本地缓存刷新用户资料 */
  refreshUserInfo() {
    const info = app.globalData.userInfo || tools.getStorage('userInfo', null);
    if (!info) return;
    this.setData({
      userInfo: {
        nickname: info.nickname || this.data.userInfo.nickname,
        bio: info.bio || this.data.userInfo.bio,
        avatar: info.avatar || ''
      }
    });
  },

  /* 从本地缓存统计各状态订单数量 */
  refreshOrderCounts() {
    const all = tools.getStorage('orderList', []);
    const orders = this.data.orders.map(item => ({
      ...item,
      count: item.key === 'all' ? all.length : all.filter(o => o.status === item.key).length
    }));
    this.setData({ orders });
  },

  /* ===== 用户卡片 ===== */
  onEditProfile() {
    wx.navigateTo({
      url: '/pages/user/edit-profile/edit-profile'
    });
  },

  /* ===== 订单 ===== */
  onGoOrders() {
    wx.navigateTo({
      url: '/pages/user/orders/orders?tab=all'
    });
  },

  /* 点击订单角标：按对应状态进入订单页 */
  onGoOrdersTab(e) {
    const key = e.currentTarget.dataset.key;
    wx.navigateTo({
      url: '/pages/user/orders/orders?tab=' + key
    });
  },

  /* ===== 功能列表 ===== */
  onGoAddress() {
    wx.navigateTo({
      url: '/pages/user/address/address'
    });
  },

  onFeedback() {
    wx.navigateTo({
      url: '/pages/user/feedback/feedback'
    });
  },

  onAbout() {
    wx.navigateTo({
      url: '/pages/user/about/about'
    });
  }
});
