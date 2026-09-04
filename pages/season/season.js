const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    seasons: [
      { key: '春', name: '春季 · 鲜爽开胃', desc: '秀珍菇炒土鸡蛋，或金针菇配青椒丝清炒，唤醒春日食欲。', theme: 'spring' },
      { key: '夏', name: '夏季 · 清淡消暑', desc: '菌菇豆腐汤（秀珍菇＋嫩豆腐＋青菜），20分钟速成，清淡鲜香；或杏鲍菇切丝凉拌，开胃解腻。', theme: 'summer' },
      { key: '秋', name: '秋季 · 温润滋补', desc: '燕山香菇炖散养土鸡，菇香渗入肉汁，暖身养胃；羊肚菌蒸蛋，嫩滑下饭，老人小孩皆宜。', theme: 'autumn' },
      { key: '冬', name: '冬季 · 暖身御寒', desc: '香菇与羊肉同煲，加入姜片、枸杞，驱寒补气；或用菌菇拼盘涮火锅，全家共享。', theme: 'winter' }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
