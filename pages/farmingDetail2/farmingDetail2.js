const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    steps: [
      { number: '01', title: '菌种优选与精准配比', tag: '高活力菌种', desc: '采用中科院优选的高活力菌种与精准定标的培养基配比，确保每一根菌棒萌发率与品质高度一致。' },
      { number: '02', title: '自动化流水线接种', tag: '无尘无污染', desc: '在自动化无菌流水线完成接种，全程无尘无污染，保障菌棒活力与洁净度。' },
      { number: '03', title: '智慧菌仓恒温培育', tag: '立体菌架', desc: '菌棒进入恒温制冷车间，置于多层不锈钢立体菌架上，全程无尘无污染，极大提升空间利用率，彻底摆脱自然季节与恶劣天气限制。' },
      { number: '04', title: '微米级雾化加湿 · AI精准控温', tag: '环境误差±0.5℃', desc: '微米级超声波雾化喷淋只增加空气湿度不滴挂菇体，确保菇面干爽脆嫩；传感器24小时采集数据，中央系统自动调节，环境误差锁定±0.5℃，打造5天极速生长周期。' },
      { number: '05', title: '黄金品相分级采摘 → 3小时极速预冷锁鲜', tag: '3分钟内移入冷库', desc: '在菇伞未完全张开的黄金品相期进行标准分级采摘，3分钟内移入冷库深度预冷，瞬间锁住水分与鲜味。', longTitle: true },
      { number: '06', title: '冷链直供 → 菌棒高值化再利用', tag: '100%无害化利用', desc: '通过冷链快配直供长三角高端市场；废旧菌棒由合作社统一回收，二次深加工为高蛋白畜禽饲料或果木栽培有机基质，实现100%无害化与高价值资源利用。', compact: true }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
