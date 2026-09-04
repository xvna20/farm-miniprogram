const router = require('../../utils/router')
const { highlightText } = require('../../utils/highlight')

Page({
  data: {
    statusBarHeight: 0,
    featureText: '',
    nutritionText: '',
    identifyText: ''
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })

    // 品种特征
    const featureRaw = '月下香菇属担子菌门香菇科，自古有"菇中之王""山珍"的美誉，是极少数干制后风味大幅升华的食用菌，核心特质是风味浓郁醇厚，自带食用菌领域辨识度极高的标志性菇香。'
    const featureKw = ['担子菌门香菇科', '菇中之王', '山珍', '干制后风味大幅升华', '风味浓郁醇厚', '标志性菇香']

    // 营养价值
    const nutritionRaw = '月下香菇高蛋白低脂肪，富含18种氨基酸、香菇多糖、膳食纤维与维生素D、硒等微量元素，兼顾风味与养护价值，是天然健康的特色山珍食材。'
    const nutritionKw = ['高蛋白低脂肪', '18种氨基酸', '香菇多糖', '膳食纤维', '维生素D', '硒']

    // 辨识方法
    const identifyRaw = '形态：伞面呈深褐色，菌肉厚实饱满，菇褶细密整齐，整体菇形完整，花菇占比高；本土种植菌菇朵形周正、菇脚修剪整齐，无泡水过度导致的虚浮胀大感。\n触感：菌肉被按压后可迅速回弹，整体手感干爽紧实，无黏手、软烂的情况。'
    const identifyKw = ['伞面深褐色', '菌肉厚实饱满', '菇褶细密整齐', '花菇占比高', '菇形周正', '菇脚修剪整齐', '按压迅速回弹', '手感干爽紧实']

    this.setData({
      featureText: highlightText(featureRaw, featureKw),
      nutritionText: highlightText(nutritionRaw, nutritionKw),
      identifyText: highlightText(identifyRaw, identifyKw)
    })
  },
  goBack() {
    router.back()
  },
  goDetail2() {
    router.replace('mushroomDetail2')
  }
})
