Page({
  data: {
    statusBarHeight: 20,
    userInfo: {
      nickname: '珠城寻菌人',
      phone: '188****3731',
      gender: '保密',
      region: '安徽省蚌埠市',
      bio: '支持乡村好物 · 记录实践足迹'
    }
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20
    });
  },

  /* ===== 返回 ===== */
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  },

  /* ===== 头像 ===== */
  onChangeAvatar() {
    wx.showToast({ title: '更换头像', icon: 'none' });
  },

  /* ===== 表单编辑 ===== */
  onEditNickname() {
    wx.showToast({ title: '修改昵称', icon: 'none' });
  },

  onEditPhone() {
    wx.showToast({ title: '修改手机号', icon: 'none' });
  },

  onEditGender() {
    wx.showToast({ title: '选择性别', icon: 'none' });
  },

  onEditRegion() {
    wx.showToast({ title: '选择地区', icon: 'none' });
  },

  onBioInput(e) {
    this.setData({
      'userInfo.bio': e.detail.value
    });
  },

  /* ===== 保存 ===== */
  onSave() {
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      }
    });
  }
});