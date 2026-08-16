const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    points: [
      { title: '精神传承', desc: '传承渡江战役依靠群众、发动群众的红色理念。' },
      { title: '前期问题', desc: '菌菇产业主要靠村党委推动，村民参与积极性不强。' },
      { title: '初见成效', desc: '产业从2023年11月逐步见效，2024年收入突破20万，2025年达30万。' },
      { title: '群众变化', desc: '实实在在的收益激发了村民参与意愿。' },
      { title: '近期规划', desc: '计划成立合作社，自上而下扩大菌菇种植产业。' },
      { title: '远期方向', desc: '后续规划发展农家乐，完善研学全链条。' },
      { title: '最终目标', desc: '带动更多村民参与，实现村庄多元接续振兴。' }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
