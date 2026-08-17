const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    routes: ['海勤科技', '机场新村', '孙家圩子旧址', '怀远泽康合作社', '甲鱼供应链基地']
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
