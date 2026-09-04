const router = require('../../utils/router')
const usage = require('../../utils/usage')

Page({
  data: {
    statusBarHeight: 0,
    showPrivacyPopup: false
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  onShow() {
    usage.push('page_view', { page: 'home' })
    const app = getApp()
    if (!app.globalData.privacyAgreed) {
      this.setData({ showPrivacyPopup: true })
    }
  },
  onPrivacyAgree() {
    this.setData({ showPrivacyPopup: false })
    const app = getApp()
    app.globalData.privacyAgreed = true
    app.globalData.canUseLoginFeatures = true
  },
  onPrivacyReject() {
    this.setData({ showPrivacyPopup: false })
    wx.showToast({ title: '部分功能将受限', icon: 'none' })
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
