const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  },
  // goIndex 是 goBack 的别名，保留以兼容 WXML 中的绑定
  goIndex() {
    router.back()
  }
})
