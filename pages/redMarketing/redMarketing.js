const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    points: [
      { title: '精神延续', desc: '延续渡江战役时期主动作为、灵活应变的开拓精神。' },
      { title: '线上推广', desc: '自主直播、新媒体报道扩大知名度。' },
      { title: '研学教育', desc: '承接研学国防教育活动，吸引高校、本地中小学及幼儿园前来体验。' },
      { title: '产销对接', desc: '对接研学及帮扶单位进行产品销售，提升收益。' },
      { title: '矛盾化解', desc: '主动对接军用机场，化解历史矛盾。' },
      { title: '创新模式', desc: '打造"上午国防教育研学＋下午菌菇采摘"特色产学研教路线，挖掘新增长点。' }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
