/**
 * pages/user/address-edit/address-edit.js - 新增/编辑收货地址
 * 支持：手动输入 + 地图选择定位(wx.chooseLocation)
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

  /* ===== 地图选择定位 ===== */
  onChooseLocation() {
    // 前置权限校验
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] === false) {
          // 用户曾拒绝过，引导开启
          wx.showModal({
            title: '需要定位权限',
            content: '请在设置中开启位置信息权限，以便获取当前位置',
            confirmText: '去设置',
            success: (r) => {
              if (r.confirm) wx.openSetting();
            }
          });
          return;
        }
        this.openLocationPicker();
      },
      fail: () => this.openLocationPicker()
    });
  },

  /* 打开地图选点 */
  openLocationPicker() {
    wx.chooseLocation({
      success: (res) => {
        // res.name: POI名称   res.address: 详细地址(含省市区)
        // 使用逆地址解析思路：简单拆分 + 手动修正
        const { name, address, latitude, longitude } = res;
        console.log('[地图选点]', res);

        // 尝试从 address 中提取省市区
        const parsed = this.parseAddress(address || '');
        let regionArr = parsed.regionArr;
        let region = parsed.region;
        let remainDetail = parsed.remain;

        // 如果解析不出省市区，兜底用 name + address
        if (!region && !regionArr.length) {
          // 让用户通过省市区选择器补选
          wx.showToast({ title: '请补充选择所在地区', icon: 'none' });
          this.setData({
            'form.detail': (name ? name + ' ' : '') + (remainDetail || address || '')
          });
          return;
        }

        // 详细地址 = POI名称 + 剩余部分(去掉省市区后)
        let detail = '';
        if (name && remainDetail && !remainDetail.includes(name)) {
          detail = name + ' ' + remainDetail;
        } else if (name) {
          detail = name;
        } else {
          detail = remainDetail || '';
        }

        this.setData({
          'form.regionArr': regionArr,
          'form.region': region,
          'form.detail': detail.trim()
        });

        wx.showToast({ title: '已填入地址', icon: 'success' });
      },
      fail: (err) => {
        console.warn('[地图选点失败]', err);
        if (err.errMsg && err.errMsg.indexOf('cancel') > -1) return;
        wx.showToast({ title: '获取位置失败，请检查定位权限', icon: 'none' });
      }
    });
  },

  /**
   * 简单的地址解析：从地址字符串提取省/市/区
   * 返回 { regionArr: [省,市,区], region: '省市县', remain: 剩余详细地址 }
   */
  parseAddress(fullAddr) {
    const addr = String(fullAddr || '').trim();
    const result = { regionArr: [], region: '', remain: addr };

    if (!addr) return result;

    // 正则匹配：省 / 自治区 / 直辖市
    const provMatch = addr.match(/^(.+?(?:省|自治区|北京市|上海市|天津市|重庆市))/);
    let province = provMatch ? provMatch[1] : '';
    let rest = province ? addr.slice(province.length) : addr;

    // 匹配市 / 自治州 / 盟 / (直辖市下的区)
    let city = '';
    const cityMatch = rest.match(/^(.+?(?:市|自治州|盟|地区))/);
    if (cityMatch) {
      city = cityMatch[1];
      rest = rest.slice(city.length);
    } else if (province && /北京市|上海市|天津市|重庆市/.test(province)) {
      // 直辖市：省=市
      city = province;
    }

    // 匹配区 / 县 / 旗
    const distMatch = rest.match(/^(.+?(?:区|县|旗|市))/);
    let district = distMatch ? distMatch[1] : '';
    let remain = district ? rest.slice(district.length) : rest;

    // 组装结果
    if (province || city || district) {
      result.regionArr = [province, city, district].filter(Boolean);
      result.region = result.regionArr.join('');
      result.remain = remain.trim();
    }

    return result;
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