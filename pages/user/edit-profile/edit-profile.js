/**
 * pages/user/edit-profile/edit-profile.js - 编辑资料
 * 头像走云开发云存储上传，云开发不可用时回退本地保存
 */
const app = getApp();
const tools = require('../../../utils/tools');

Page({
  data: {
    statusBarHeight: 20,
    userInfo: {
      nickname: '珠城寻菌人',
      phone: '188****3731',
      gender: '保密',
      region: '安徽省蚌埠市',
      bio: '支持乡村好物 · 记录实践足迹',
      avatar: ''
    },
    genderOptions: ['男', '女', '保密'],
    genderIndex: 2,
    regionArr: [],
    avatarTmpPath: ''
  },

  onLoad() {
    const sysInfo = wx.getWindowInfo();
    const cached = tools.getStorage('userInfo', null) || {};
    const userInfo = Object.assign({}, this.data.userInfo, cached);
    const genderIndex = this.data.genderOptions.indexOf(userInfo.gender);
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      userInfo,
      genderIndex: genderIndex >= 0 ? genderIndex : 2,
      regionArr: cached.regionArr || []
    });
  },

  /* ===== 返回 ===== */
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  },

  /* ===== 头像：选图 -> 裁剪页选取区域 -> 保存时上传云存储 ===== */
  onChangeAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tmpPath = res.tempFiles[0].tempFilePath;
        // 跳转裁剪页，让用户选择图片的哪一部分作为头像
        wx.navigateTo({
          url: '/pages/user/edit-profile/avatar-crop?src=' + encodeURIComponent(tmpPath)
        });
      }
    });
  },

  /* 从裁剪页返回时，接收裁剪好的头像 */
  onShow() {
    const cropped = app.globalData.croppedAvatar;
    if (cropped) {
      app.globalData.croppedAvatar = '';
      this.setData({
        'userInfo.avatar': cropped,
        avatarTmpPath: cropped
      });
    }
  },

  /* ===== 昵称 ===== */
  onEditNickname() {
    const current = this.data.userInfo.nickname;
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: current,
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (!value) {
          wx.showToast({ title: '昵称不能为空', icon: 'none' });
          return;
        }
        this.setData({ 'userInfo.nickname': value.slice(0, 20) });
      }
    });
  },

  /* ===== 手机号 ===== */
  onEditPhone() {
    const current = this.data.userInfo.phone;
    wx.showModal({
      title: '修改手机号',
      editable: true,
      placeholderText: '请输入11位手机号',
      content: current,
      success: (res) => {
        if (!res.confirm) return;
        const value = (res.content || '').trim();
        if (value === current) return;
        if (!tools.isPhone(value)) {
          wx.showToast({ title: '手机号格式不正确', icon: 'none' });
          return;
        }
        this.setData({ 'userInfo.phone': value });
      }
    });
  },

  /* ===== 性别 ===== */
  onGenderChange(e) {
    const index = Number(e.detail.value);
    this.setData({
      genderIndex: index,
      'userInfo.gender': this.data.genderOptions[index]
    });
  },

  /* ===== 所在地区 ===== */
  onRegionChange(e) {
    const value = e.detail.value;
    this.setData({
      regionArr: value,
      'userInfo.region': value.join('')
    });
  },

  /* ===== 个人简介 ===== */
  onBioInput(e) {
    this.setData({ 'userInfo.bio': e.detail.value });
  },

  /* ===== 保存 ===== */
  onSave() {
    const userInfo = Object.assign({}, this.data.userInfo);
    const tmpPath = this.data.avatarTmpPath;

    const persist = (avatar, avatarSource = '') => {
      if (avatar) {
        userInfo.avatar = avatar;
        userInfo.avatarSource = avatarSource;
      }
      userInfo.regionArr = this.data.regionArr;
      tools.setStorage('userInfo', userInfo);
      app.globalData.userInfo = userInfo;
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 1500
      });
      setTimeout(() => {
        wx.navigateBack({ delta: 1 });
      }, 1500);
    };

    if (!tmpPath) {
      persist('');
      return;
    }

    // 优先上传云存储（fileID 可在任意端展示），失败回退本地持久化
    if (typeof wx.cloud !== 'undefined' && wx.cloud.uploadFile) {
      wx.cloud.uploadFile({
        cloudPath: `avatar/${Date.now()}-${Math.floor(Math.random() * 10000)}${getExt(tmpPath)}`,
        filePath: tmpPath,
        success: (res) => persist(res.fileID, 'cloud'),
        fail: (err) => {
          console.warn('[头像] 云上传失败，回退本地保存', err);
          saveAvatarLocal(tmpPath, persist);
        }
      });
    } else {
      saveAvatarLocal(tmpPath, persist);
    }
  }
});

/* 取文件后缀 */
function getExt(path) {
  const m = /(\.[a-zA-Z0-9]+)$/.exec(path || '');
  return m ? m[1] : '.jpg';
}

/* 云开发不可用时：把临时图片 copy 到本地用户目录持久化 */
function saveAvatarLocal(tmpPath, callback) {
  wx.getFileSystemManager().saveFile({
    tempFilePath: tmpPath,
    success: (res) => callback(res.savedFilePath, 'local'),
    fail: (err) => {
      console.warn('[头像] 本地兜底保存失败', err);
      wx.showToast({ title: '头像保存失败', icon: 'none' });
    }
  });
}
