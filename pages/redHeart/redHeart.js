const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.backToHome()
  },
  goSpirit() {
    router.navigate('redSpirit')
  },
  goStartup() {
    router.navigate('redStartup')
  },
  goMarketing() {
    router.navigate('redMarketing')
  },
  goFuture() {
    router.navigate('redFuture')
  }
})
