/**
 * pages/user/orders/orders.js - 我的订单
 * Tab：全部 / 待付款 / 待发货 / 待收货 / 已完成
 * 当前为空状态实现，订单卡片样式待设计图（带数据页面）确认后补充
 */
const tools = require('../../../utils/tools');
const cloud = require('../../../utils/cloud');
const { deriveOrderStatus } = require('../../../utils/order');

Page({
  data: {
    statusBarHeight: 20,
    currentTab: 'unpaid',   // 默认待付款
    tabs: [
      { key: 'all',        label: '全部',   emptyChar: '单', emptyTitle: '暂无订单',           emptySub: '快去商城挑选心仪的助农产品吧' },
      { key: 'unpaid',     label: '待付款', emptyChar: '待', emptyTitle: '暂无待付款订单',     emptySub: '未支付，待付款订单会在这里显示' },
      { key: 'unshipped',  label: '待发货', emptyChar: '发', emptyTitle: '暂无待发货订单',     emptySub: '付款后，待发货订单会显示在这里' },
      { key: 'unreceived', label: '待收货', emptyChar: '收', emptyTitle: '暂无待收货订单',     emptySub: '发货后，待收货订单会显示在这里' },
      { key: 'done',       label: '已完成', emptyChar: '完', emptyTitle: '暂无已完成订单',     emptySub: '收货后，已完成订单会显示在这里' }
    ],
    orderList: [],          // 订单列表，空数组时显示空状态
    currentTabInfo: {       // 当前 tab 的空状态文案
      emptyChar: '待',
      emptyTitle: '暂无待付款订单',
      emptySub: '未支付，待付款订单会在这里显示'
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

  /* 读取订单列表（按 tab 过滤），优先云端同步结果 */
  loadOrders() {
    this.applyOrders(tools.getStorage('orderList', []));

    cloud.call('getOrders')
      .then((res) => {
        const cloudList = (res && res.list) || [];
        if (cloudList.length === 0) return;
        tools.setStorage('orderList', cloudList);
        this.applyOrders(cloudList);
      })
      .catch(() => {
        // 云端不可用：继续用本地列表
      });
  },

  /* 应用订单列表（先按时间推导状态，再按 tab 过滤 + 回写变更） */
  applyOrders(list) {
    const { currentTab } = this.data;
    const now = Date.now();
    let changed = false;
    const derived = list.map(order => {
      const st = deriveOrderStatus(order, now);
      if (st !== order.status) changed = true;
      return { ...order, status: st };
    });

    if (changed) {
      tools.setStorage('orderList', derived);
      this.syncOrdersToCloud();
    }

    let filtered = derived;
    if (currentTab !== 'all') {
      filtered = derived.filter(item => item.status === currentTab);
    }
    this.setData({ orderList: this.formatOrders(filtered) });
  },

  /* 把最新订单列表同步到云端（失败静默） */
  syncOrdersToCloud() {
    const orders = tools.getStorage('orderList', []);
    cloud.safeCall('syncOrders', { list: orders });
  },

  /* 补充订单展示字段：状态文案 / 商品总件数 / 下单时间 */
  formatOrders(list) {
    const labelMap = {
      unpaid: '待付款',
      unshipped: '待发货',
      unreceived: '待收货',
      done: '已完成',
      cancelled: '已取消'
    };
    return list.map(order => ({
      ...order,
      statusLabel: labelMap[order.status] || order.status,
      itemCount: (order.items || []).reduce((sum, it) => sum + Number(it.quantity || 0), 0),
      timeText: tools.formatTime(order.createTime, 'MM-DD HH:mm')
    }));
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
  },

  /* 点击订单卡片：待付款订单可继续付款 */
  onOrderTap(e) {
    const orderNumber = e.currentTarget.dataset.order;
    const order = this.data.orderList.find(o => o.orderNumber === orderNumber);
    if (!order || order.status !== 'unpaid') return;

    const checkoutItems = (order.items || []).map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    if (checkoutItems.length === 0) return;

    wx.setStorageSync('checkoutItems', checkoutItems);
    wx.navigateTo({
      url: '/pages/confirm-order/confirm-order'
    });
  }
});
