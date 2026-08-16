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
  goDetail1() {
    router.replace('mushroomDetail1')
  }
})
