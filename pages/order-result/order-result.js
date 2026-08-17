Page({
  data: {
    order: null
  },

  onLoad() {
    this.loadOrder();
  },

  loadOrder() {
    const order = wx.getStorageSync("latestOrder");

    if (!order) {
      wx.showToast({
        title: "暂无订单信息",
        icon: "none"
      });

      setTimeout(() => {
        wx.switchTab({
          url: "/pages/mall/mall"
        });
      }, 1000);

      return;
    }

    this.setData({
      order
    });
  },

  // 查看我的订单
  goToOrders() {
    // “我的订单”页面由成员三负责。
    // 当前先进入“我的”页面。
    wx.switchTab({
      url: "/pages/user/user"
    });
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: "/pages/home/home"
    });
  }
});