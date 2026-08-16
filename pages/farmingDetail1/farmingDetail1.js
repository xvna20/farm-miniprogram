const router = require('../../utils/router')

Page({
  data: {
    statusBarHeight: 0,
    steps: [
      { number: '01', title: '培养基配制', tag: '本地天然基料', desc: '精选本地优质农作物秸秆、木屑与棉籽壳作为天然培养基，全过程不添加任何化学生长素或农药残留。' },
      { number: '02', title: '高温灭菌 → 无菌接种', tag: '源头纯净', desc: '经高压高温蒸气彻底灭菌后，在无菌环境中完成接种，从源头确保纯净天然。' },
      { number: '03', title: '生态大棚发菌', tag: '半自然透气小气候', desc: '菌棒运抵标准生态大棚，采用地面立式或挂网立体摆放，利用遮阳网与通风窗创造半自然透气小气候，让菌丝在贴近自然的环境中健康发菌。' },
      { number: '04', title: '微喷滋养 · 物理控温', tag: '顺应自然节律', desc: '棚顶智能微喷系统定时定量喷洒深井纯净水，模拟晨露细雨；结合传感器监测与农户巡棚，灵活掀盖遮阳网、开启排风扇，以物理方式调节光照与二氧化碳浓度，顺应自然节律成长。' },
      { number: '05', title: '手工采摘 → 冷藏保鲜', tag: '保留纯正鲜味', desc: '由经验丰富的农户手工精细采摘，保持菇体天然完整度，采摘后第一时间送入村级冷藏仓储，保留纯正鲜味。', compact: true },
      { number: '06', title: '菌棒堆肥返田', tag: '绿色循环闭环', desc: '采摘结束后的废旧菌棒剥离塑料袋后堆肥发酵，转化为优质有机肥料反哺周边农田，构建绿色循环生态闭环。', compact: true }
    ]
  },
  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },
  goBack() {
    router.back()
  }
})
