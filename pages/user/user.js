/**
 * pages/user/user.js - 个人中心页（占位）
 * 正式业务由成员三开发（个人中心 / 编辑资料 / 意见反馈 / 收货地址 / 订单状态）
 */
Page({
  data: {
    statusBarHeight: 20,
    orders: [
      { key: 'unpaid',   count: 0, label: '待付款' },
      { key: 'unshipped', count: 1, label: '待发货' },
      { key: 'unreceived', count: 1, label: '待收货' },
      { key: 'done',     count: 3, label: '已完成' }
    ]
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20
    });
  },

  /* ===== 用户卡片 ===== */
  onEditProfile() {
    wx.navigateTo({
      url: '/pages/user/edit-profile/edit-profile'
    });
  },

  /* ===== 订单 ===== */
  onGoOrders() {
    wx.showToast({ title: '全部订单', icon: 'none' });
  },

  /* ===== 功能列表 ===== */
  onGoAddress() {
    wx.showToast({ title: '收货地址', icon: 'none' });
  },

  onFeedback() {
    wx.showToast({ title: '意见反馈', icon: 'none' });
  },

  onAbout() {
    wx.showToast({ title: '关于我们', icon: 'none' });
  }
});