const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  onExplore() {
    router.navigate('mushroom')
  },
  goRedHeart() {
    router.navigate('redHeart')
  },
  goMushroom() {
    router.navigate('mushroom')
  },
  goFarming() {
    router.navigate('farming')
  },
  goHealth() {
    router.navigate('health')
  }
})
