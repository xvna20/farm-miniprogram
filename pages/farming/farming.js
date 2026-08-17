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
  goFarmingDetail1() {
    router.navigate('farmingDetail1')
  },
  goFarmingDetail2() {
    router.navigate('farmingDetail2')
  },
  goShop() {
    router.navigate('revenue')
  }
})
