const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    activeIndex: 0,
    sectors: [
      {
        title: '成本支出',         percent: '40%~50%', subTitle: '保障生产运营', color: '#839969',
        detail: '•菌棒原料采购与生产\n•大棚/菌仓水电气及设备维护\n•包装、物流、仓储以及技术指导与检测费用'
      },
      {
        title: '村民薪资',         percent: '30%~40%', subTitle: '稳定工资·灵活结算', color: '#B8860B',
        detail: '•固定岗位按月发放工资\n•灵活用工按采摘计件当日结算\n•根据产业效益发放年终绩效奖励'
      },
      {
        title: '发展再投入',         percent: '10%~15%', subTitle: '扩大规模·升级品牌', color: '#A4B888',
        detail: '•扩大种植规模，新建大棚/菌仓\n•推进设备升级与技术引进\n•用于品牌建设与市场推广'
      },
      {
        title: '村集体公共积累',         percent: '5%~10%', subTitle: '乡村公共建设', color: '#D4B888',
        detail: '•乡村基础设施维护\n•公益帮扶\n•集体产业应急储备'
      }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  },
  selectSector(e) {
    this.setData({ activeIndex: Number(e.currentTarget.dataset.index) })
  }
})
