/**
 * pages/user/orders/orders.js - 我的订单
 * Tab：全部 / 待付款 / 待发货 / 待收货 / 已完成
 * 当前为空状态实现，订单卡片样式待设计图（带数据页面）确认后补充
 */
const tools = require('../../../utils/tools');

Page({
  data: {
    statusBarHeight: 20,
    currentTab: 'unpaid',   // 默认待付款
    tabs: [
      { key: 'all',        label: '全部',   emptyChar: '单', emptyTitle: '暂无订单',           emptySub: '快去商城挑选心仪的助农产品吧' },
      { key: 'unpaid',     label: '待付款', emptyChar: '待', emptyTitle: '暂无待付款订单',     emptySub: '下单后，待付款订单会显示在这里' },
      { key: 'unshipped',  label: '待发货', emptyChar: '发', emptyTitle: '暂无待发货订单',     emptySub: '付款后，待发货订单会显示在这里' },
      { key: 'unreceived', label: '待收货', emptyChar: '收', emptyTitle: '暂无待收货订单',     emptySub: '发货后，待收货订单会显示在这里' },
      { key: 'done',       label: '已完成', emptyChar: '完', emptyTitle: '暂无已完成订单',     emptySub: '收货后，已完成订单会显示在这里' }
    ],
    orderList: [],          // 订单列表，空数组时显示空状态
    currentTabInfo: {       // 当前 tab 的空状态文案
      emptyChar: '待',
      emptyTitle: '暂无待付款订单',
      emptySub: '下单后，待付款订单会显示在这里'
    }
  },

  onLoad(options) {
    const sysInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20
    });

    // 支持从外部指定初始 tab（如 user 页点击"待付款"图标）
    if (options && options.tab) {
      this.setData({ currentTab: options.tab });
    }

    this.updateTabInfo();
    this.loadOrders();
  },

  /* 读取订单列表（按 tab 过滤） */
  loadOrders() {
    const all = tools.getStorage('orderList', []);
    const { currentTab } = this.data;
    let list = all;
    if (currentTab !== 'all') {
      list = all.filter(item => item.status === currentTab);
    }
    this.setData({ orderList: list });
  },

  /* 更新当前 tab 的空状态文案到 data */
  updateTabInfo() {
    const info = this.data.tabs.find(t => t.key === this.data.currentTab);
    this.setData({ currentTabInfo: info || {} });
  },

  /* 切换 Tab */
  onTabChange(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ currentTab: key });
    this.updateTabInfo();
    this.loadOrders();
  },

  /* 返回 */
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  },

  /* 去商城 */
  onGoMall() {
    wx.switchTab({
      url: '/pages/mall/mall'
    });
  }
});
