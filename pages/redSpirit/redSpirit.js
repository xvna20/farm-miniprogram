const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    points: [
      { title: '精神溯源', desc: '以渡江战役总前委孙家圩子遗址为红色根基，传承革命时期不畏艰难、为民谋福祉的底色。' },
      { title: '现实背景', desc: '机场新村因军用机场征地，土地资源受限；村内多为留守、非青壮年劳动力。' },
      { title: '历史矛盾', desc: '村民与机场之间长期存在复杂矛盾。' },
      { title: '组织定位', desc: '村党委、工作队牢记为民发展初心，把红色奋斗精神作为办事底色。' },
      { title: '发展目标', desc: '确立集体经济、强村富民、踏踏实实为村民谋生活、为村庄谋未来的方向。' },
      { title: '支书理念', desc: '不追求惊天动地的业绩，但求脚踏实地造福乡亲。' }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
