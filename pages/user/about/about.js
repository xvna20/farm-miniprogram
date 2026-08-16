/**
 * pages/user/about/about.js - 关于项目
 * 展示项目主视觉、实践路线、图片来源说明
 */
Page({
  data: {
    statusBarHeight: 20,
    // 实践路线 5 个站点：前三个橙金 badge，后两个浅米黄 badge
    routeList: [
      { name: '海勤科技',         badgeType: 'gold' },
      { name: '机场新村',         badgeType: 'gold' },
      { name: '孙家圩子旧址',     badgeType: 'gold' },
      { name: '怀远泽康合作社',   badgeType: 'cream' },
      { name: '甲鱼供应链基地',   badgeType: 'cream' }
    ],
    // 图片来源与替换说明
    sourceNotes: [
      '菌菇种植环境图片来自免费图库授权使用',
      '鲜菇采摘展示图片来自免费图库授权使用',
      '图片仅用于原型排版与项目展示占位',
      '正式上线前建议替换为团队实拍并复核授权'
    ]
  },

  onLoad() {
    const sysInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20
    });
  },

  /* 返回 */
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  }
});
