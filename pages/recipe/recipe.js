const router = require('../../utils/router')

const species = {
  shiitake: {
    title: '香菇', base: '机场新村基地', image: '/images/shiitake-hero.png',
    lines: ['富含真菌多糖与麦角甾醇，麦角甾醇经日晒可转化为维生素D，促进钙质吸收。', '自带浓郁菇香（香菇精），有助于降低有害胆固醇，保护心血管。', '香蕈多醣体可提高免疫细胞活力，适合体质偏弱、易感冒人群。']
  },
  oyster: {
    title: '秀珍菇', base: '泽康基地', image: '/images/oyster-mushroom.jpg',
    lines: ['含多种氨基酸及醣蛋白，能修复受损细胞，帮助增强免疫力。', '富含B族维生素与叶酸，有助于促进新陈代谢、改善手脚麻木。', '性质相对温和，适宜神经衰弱及日常养生人群食用。']
  },
  morel: {
    title: '羊肚菌', base: '菌中珍品', image: '/images/morel.jpg',
    lines: ['高蛋白低脂肪，含19种氨基酸，其中包括8种人体必需氨基酸，被誉为"菌中皇后""陆地鱼子酱"。', '富含钾、钙、镁、锌、铁及硒元素，可辅助强身健体、抗疲劳。', '传统医学认为其"和胃消食、化痰理气"，适合消化不良、痰多气短者。']
  },
  enoki: {
    title: '金针菇', base: '益智菇', image: '/images/enoki.jpg',
    lines: ['赖氨酸与精氨酸含量高，锌元素丰富，对儿童智力发育有益。', '热量低，有助抑制血脂升高，但性质偏寒凉，脾胃虚寒者不宜多食。']
  },
  king: {
    title: '杏鲍菇', base: '优质植物蛋白', image: '/images/14124643cf48fd340ac9e852f521a44513a3571e.jpg',
    lines: ['富含植物蛋白，是素食者优质蛋白来源。', '钾含量较高，有助于稳定血压；膳食纤维丰富，可润肠通便。']
  }
}

Page({
  data: {
    statusBarHeight: 0,
    active: 'shiitake',
    current: species.shiitake
  },
  onLoad(options) {
    const active = species[options.species] ? options.species : 'shiitake'
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      active,
      current: species[active]
    })
  },
  goBack() {
    router.back()
  },
  selectSpecies(event) {
    const active = event.currentTarget.dataset.species
    this.setData({ active, current: species[active] })
  }
})
