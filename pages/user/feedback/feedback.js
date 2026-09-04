/**
 * pages/user/feedback/feedback.js - 意见反馈
 * 支持：反馈类型选择 + 内容描述 + 联系方式（选填）
 */
const tools = require('../../../utils/tools');
const cloud = require('../../../utils/cloud');
const usage = require('../../../utils/usage');

Page({
  data: {
    statusBarHeight: 20,
    typeList: [
      { key: 'suggest',  label: '功能建议' },
      { key: 'correction', label: '内容纠错' },
      { key: 'shopping', label: '购物体验' },
      { key: 'other',    label: '其他' }
    ],
    contentLength: 0,
    form: {
      type: 'suggest',     // 反馈类型，默认选中第一项
      content: '',          // 描述内容
      contact: ''           // 联系方式（选填）
    }
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
  },

  /* ===== 选择反馈类型 ===== */
  onTypeSelect(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ 'form.type': key });
  },

  /* ===== 描述内容输入 ===== */
  onContentInput(e) {
    const value = e.detail.value;
    this.setData({
      'form.content': value,
      contentLength: value.length
    });
  },

  /* ===== 联系方式输入 ===== */
  onContactInput(e) {
    this.setData({ 'form.contact': e.detail.value.trim() });
  },

  /* ===== 提交反馈 ===== */
  onSubmit() {
    const { form } = this.data;

    // 校验：描述内容必填
    if (!form.content || !form.content.trim()) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' });
      return;
    }
    if (form.content.trim().length < 5) {
      wx.showToast({ title: '请至少输入5个字', icon: 'none' });
      return;
    }

    // 若填写了联系方式，校验格式（手机号或微信号）
    const contact = form.contact.trim();
    if (contact && !tools.isPhone(contact) && !/^[a-zA-Z0-9_-]{5,20}$/.test(contact)) {
      wx.showToast({ title: '请输入正确的手机号或微信号', icon: 'none' });
      return;
    }

    // 组装反馈数据
    const feedback = {
      id: 'fb_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      type: form.type,
      typeLabel: this.data.typeList.find(t => t.key === form.type).label,
      content: form.content.trim(),
      contact: contact,
      createTime: tools.formatTime(new Date())
    };

    // 读取历史反馈列表并追加（本地兜底，离线也能留痕）
    const list = tools.getStorage('feedbackList', []);
    list.unshift(feedback);
    tools.setStorage('feedbackList', list);

    // 同步到云端：管理员可在云开发控制台 feedbacks 集合查看
    cloud.safeCall('submitFeedback', {
      type: form.type,
      typeLabel: feedback.typeLabel,
      content: feedback.content,
      contact: contact
    });
    usage.push('submit_feedback', { type: form.type });

    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 1500
    });

    // 延迟返回
    setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
  }
});
