/**
 * pages/user/address/address.js - 收货地址列表
 */
const tools = require('../../../utils/tools');

Page({
  data: {
    statusBarHeight: 20,
    addressList: [],
    selectMode: false
  },

  onLoad(options) {
    const sysInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20,
      selectMode: !!(options && options.select === '1')
    });
  },

  onShow() {
    this.loadAddressList();
  },

  /* 加载地址列表 */
  loadAddressList() {
    const list = tools.getStorage('addressList', []);
    // 格式化手机号显示（中间用*号）
    const formatted = list.map(item => ({
      ...item,
      phoneDisplay: this.maskPhone(item.phone)
    }));
    this.setData({ addressList: formatted });
  },

  /* 手机号脱敏 */
  maskPhone(phone) {
    const str = String(phone || '');
    if (str.length < 7) return str;
    return str.slice(0, 3) + '****' + str.slice(-4);
  },

  /* 返回 */
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  },

  /* 新增地址 */
  onAddAddress() {
    wx.navigateTo({
      url: '/pages/user/address-edit/address-edit'
    });
  },

  /* 编辑地址 */
  onEditAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/user/address-edit/address-edit?id=' + id
    });
  },

  /* 点击地址卡片：选择模式下选中返回，普通模式设为默认 */
  onCardTap(e) {
    if (this.data.selectMode) {
      this.onSelectAddress(e);
      return;
    }
    this.onSetDefault(e);
  },

  /* 选择模式下：选中该地址并返回 */
  onSelectAddress(e) {
    const id = e.currentTarget.dataset.id;
    const list = tools.getStorage('addressList', []);
    const target = list.find(item => item.id === id);
    if (!target) return;
    tools.setStorage('selectedOrderAddress', target);
    wx.navigateBack({ delta: 1 });
  },

  /* 设置默认地址 */
  onSetDefault(e) {
    const id = e.currentTarget.dataset.id;
    let list = tools.getStorage('addressList', []);
    list = list.map(item => ({
      ...item,
      isDefault: item.id === id
    }));
    tools.setStorage('addressList', list);
    this.loadAddressList();
    wx.showToast({ title: '已设为默认', icon: 'success' });
  },

  /* 长按删除地址 */
  onLongPressDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (!res.confirm) return;
        let list = tools.getStorage('addressList', []);
        list = list.filter(item => item.id !== id);
        // 如果删的是默认地址，将第一个设为默认
        if (list.length > 0 && !list.some(item => item.isDefault)) {
          list[0].isDefault = true;
        }
        tools.setStorage('addressList', list);
        this.loadAddressList();
        wx.showToast({ title: '已删除', icon: 'success' });
      }
    });
  }
});