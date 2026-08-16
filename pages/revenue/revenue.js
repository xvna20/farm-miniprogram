const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    items: [
      { number: '01', title: '成本支出（约40–50%）', tag: '保障生产运营', lines: ['菌棒原料采购与生产', '大棚／菌仓水电气及设备维护', '包装、物流、仓储以及技术指导与检测费用'] },
      { number: '02', title: '村民薪资（约30–40%）', tag: '稳定工资 · 灵活结算', lines: ['固定岗位按月发放工资', '灵活用工按采摘计件当日结算', '根据产业效益发放年终绩效奖励'] },
      { number: '03', title: '发展再投入（约10–15%）', tag: '扩大规模 · 升级品牌', lines: ['扩大种植规模，新建大棚／菌仓', '推进设备升级与技术引进', '用于品牌建设与市场推广'] },
      { number: '04', title: '村集体公共积累（约5–10%）', tag: '反哺乡村', lines: ['反哺村庄公益事业', '帮扶困难群体', '改善公共设施'] }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
