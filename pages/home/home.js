const router = require('../../utils/router')
const usage = require('../../utils/usage')

Page({
  data: {
    statusBarHeight: 0
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  onShow() {
    usage.push('page_view', { page: 'home' })
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
