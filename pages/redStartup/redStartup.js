const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    points: [
      { title: '精神指引', desc: '汲取渡江战役迎难而上、自力更生的精神力量。' },
      { title: '现实困境', desc: '全村土地仅数百亩；启动资金仅14万元（乡政府贷款4万＋工作队出资10万）；菌菇种植对温湿度极其敏感，管控失误极可能造成菌丝报废。' },
      { title: '主动学习', desc: '村支部奔赴固镇、凤阳、怀远、上海等优秀基地实地学习。' },
      { title: '借助外脑', desc: '向本地高校求教。' },
      { title: '自主钻研', desc: '同步网络查阅资料、咨询专业人士，自主攻克大量技术难题。' },
      { title: '初步成果', desc: '成功培育优质香菇，踩实菌菇产业第一步。' }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
