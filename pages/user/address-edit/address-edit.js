/**
 * pages/user/address-edit/address-edit.js - 新增/编辑收货地址
 * 支持：手动输入
 */
const tools = require('../../../utils/tools');

Page({
  data: {
    statusBarHeight: 20,
    isEdit: false,         // 是否为编辑模式
    editId: '',            // 编辑时的地址ID
    form: {
      name: '',            // 收货人
      phone: '',           // 手机号
      region: '',          // 所在地区 (省/市/区)
      regionArr: [],       // 省市区数组 [省, 市, 区]
      detail: '',          // 详细地址 (街道门牌号)
      isDefault: false     // 是否默认
    }
  },

  onLoad(options) {
    const sysInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight || 20
    });

    if (options && options.id) {
      // 编辑模式：加载已有地址
      this.loadAddressForEdit(options.id);
    }
  },

  /* 加载要编辑的地址 */
  loadAddressForEdit(id) {
    const list = tools.getStorage('addressList', []);
    const target = list.find(item => item.id === id);
    if (!target) {
      wx.showToast({ title: '地址不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1000);
      return;
    }
    this.setData({
      isEdit: true,
      editId: id,
      form: {
        name: target.name || '',
        phone: target.phone || '',
        region: target.region || '',
        regionArr: target.regionArr || [],
        detail: target.detail || '',
        isDefault: !!target.isDefault
      }
    });
    wx.setNavigationBarTitle({ title: '编辑地址' });
  },

  /* 返回 */
  onGoBack() {
    wx.navigateBack({ delta: 1 });
  },

  /* ===== 表单输入 ===== */
  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value.trim() });
  },

  onPhoneInput(e) {
    this.setData({ 'form.phone': e.detail.value.trim() });
  },

  onDetailInput(e) {
    this.setData({ 'form.detail': e.detail.value.trim() });
  },

  /* 省市区选择器变化 */
  onRegionChange(e) {
    const value = e.detail.value;
    this.setData({
      'form.regionArr': value,
      'form.region': value.join('')
    });
  },

  /* 默认地址开关 */
  onDefaultToggle(e) {
    this.setData({ 'form.isDefault': e.detail.value });
  },

  /* ===== 保存 ===== */
  onSave() {
    const { form, isEdit, editId } = this.data;

    // 校验
    if (!form.name) {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' });
      return;
    }
    if (!tools.isPhone(form.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!form.regionArr || form.regionArr.length < 3 || !form.regionArr[0] || !form.regionArr[1] || !form.regionArr[2]) {
      wx.showToast({ title: '请选择所在地区', icon: 'none' });
      return;
    }
    if (!form.detail) {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return;
    }

    let list = tools.getStorage('addressList', []);

    if (isEdit) {
      // 编辑：更新对应项
      list = list.map(item => {
        if (item.id === editId) {
          return { ...item, ...form };
        }
        // 如果当前设为默认，其他全部取消默认
        if (form.isDefault) {
          return { ...item, isDefault: false };
        }
        return item;
      });
    } else {
      // 新增
      const newItem = {
        ...form,
        id: 'addr_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
      };
      // 如果是第一个地址或勾选了默认，设为默认
      if (list.length === 0 || form.isDefault) {
        list = list.map(item => ({ ...item, isDefault: false }));
        newItem.isDefault = true;
      }
      list.push(newItem);
    }

    tools.setStorage('addressList', list);
    wx.showToast({
      title: isEdit ? '修改成功' : '添加成功',
      icon: 'success',
      duration: 1200
    });
    setTimeout(() => wx.navigateBack({ delta: 1 }), 1200);
  },

  /* ===== 删除地址（仅编辑模式） ===== */
  onDelete() {
    if (!this.data.isEdit) return;
    wx.showModal({
      title: '提示',
      content: '确定要删除这个地址吗？',
      success: (res) => {
        if (!res.confirm) return;
        let list = tools.getStorage('addressList', []);
        list = list.filter(item => item.id !== this.data.editId);
        // 如果删的是默认地址，将第一个设为默认
        if (list.length > 0 && !list.some(item => item.isDefault)) {
          list[0].isDefault = true;
        }
        tools.setStorage('addressList', list);
        wx.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => wx.navigateBack({ delta: 1 }), 1000);
      }
    });
  }
});