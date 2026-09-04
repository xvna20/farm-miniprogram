const router = require('../../utils/router')
const { highlightText } = require('../../utils/highlight')

Page({
  data: {
    statusBarHeight: 0,
    introText: '',
    featureText: '',
    identifyText: ''
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })

    // 品种介绍
    const introRaw = '秀珍菇属担子菌门侧耳科侧耳属，是平菇家族中的优质小巧品种，因菌株玲珑、质地秀脆得名，兼具平菇的鲜醇与独特的脆嫩口感。'
    const introKw = ['担子菌门侧耳科侧耳属', '平菇家族', '质地秀脆', '脆嫩口感']

    // 核心特征
    const featureRaw = '菇伞呈优雅浅灰至灰褐色，形如小巧折扇；菇柄白净短实，肉质紧密脆嫩，形态精致，是兼具食用与观赏价值的菌中珍品。'
    const featureKw = ['浅灰至灰褐色', '菇柄白净短实', '肉质紧密脆嫩']

    // 辨识方法
    const identifyRaw = '菇盖：伞面光泽度高，边缘卷曲紧致，无塌软发黄现象，菌盖完整饱满。\n触感与声音：轻捏菇柄富有弹性，折断时发出清脆声响，含水量适中，肉质紧实不松散。'
    const identifyKw = ['伞面光泽度高', '边缘卷曲紧致', '菇盖完整饱满', '菇柄富有弹性', '折断清脆声响', '含水量适中', '肉质紧实不松散']

    this.setData({
      introText: highlightText(introRaw, introKw),
      featureText: highlightText(featureRaw, featureKw),
      identifyText: highlightText(identifyRaw, identifyKw)
    })
  },
  goBack() {
    router.back()
  },
  goDetail1() {
    router.replace('mushroomDetail1')
  }
})
