Page({
  data: {
    statusBarHeight: 20
  },
  onLoad() {
    const sysInfo = wx.getWindowInfo();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 20 });
  },
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  }
});
