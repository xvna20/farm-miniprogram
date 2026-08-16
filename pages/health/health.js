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
  goRecipe() {
    router.navigate('recipe')
  },
  goSeason() {
    router.navigate('season')
  },
  goSafety() {
    router.navigate('safety')
  }
})
