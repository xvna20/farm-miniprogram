Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onAgree() {
      wx.setStorageSync('privacyAgreed', true);
      this.triggerEvent('agree');
    },
    onReject() {
      this.triggerEvent('reject');
    },
    goToAgreement() {
      wx.navigateTo({ url: '/pages/agreement/agreement' });
    },
    goToPrivacy() {
      wx.navigateTo({ url: '/pages/privacy/privacy' });
    }
  }
});
