const { products } = require("../../data/products.js");

Page({
  data: {
    orderItems: [],

    address: {
      name: "黄zs",
      phone: "188****3731",
      detail: "安徽省蚌埠市蚌山区……"
    },

    deliveryText: "预计明日 18:00 前送达",
    deliveryType: "冷链配送",

    freight: 10.0,

    goodsAmount: "0.0",
    totalAmount: "0.0"
  },

  onLoad() {
    this.loadOrder();
  },

  loadOrder() {
    const checkoutItems =
      wx.getStorageSync("checkoutItems") || [];

    if (checkoutItems.length === 0) {
      wx.showToast({
        title: "暂无待结算商品",
        icon: "none"
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);

      return;
    }

    let goodsAmount = 0;

    const orderItems = checkoutItems
      .map(cartItem => {
        const product = products.find(item => {
          return item.id === cartItem.productId;
        });

        if (!product) {
          return null;
        }

        const quantity =
          Number(cartItem.quantity || 1);

        const subtotal =
          Number(product.price) * quantity;

        goodsAmount += subtotal;

        return {
          productId: product.id,
          name: product.name,
          shortSubtitle: product.shortSubtitle,
          price: Number(product.price),
          priceText: Number(product.price).toFixed(1),
          unit: product.unit,
          image: product.image,
          imageText: product.imageText,
          quantity,
          subtotalText: subtotal.toFixed(1)
        };
      })
      .filter(item => item !== null);

    const totalAmount =
      goodsAmount + Number(this.data.freight);

    this.setData({
      orderItems,
      goodsAmount: goodsAmount.toFixed(1),
      totalAmount: totalAmount.toFixed(1)
    });
  },

  // 地址页面后续由成员三负责时可以真正跳转
  chooseAddress() {
    wx.showToast({
      title: "收货地址由个人中心模块维护",
      icon: "none"
    });
  },

  submitOrder() {
    if (this.data.orderItems.length === 0) {
      return;
    }

    wx.showModal({
      title: "模拟订单",
      content: "本项目为暑期实践展示，不产生真实交易或微信支付。是否提交模拟订单？",

      confirmText: "提交",

      success: res => {
        if (!res.confirm) {
          return;
        }

        const orderNumber =
          "WB" + Date.now();

        const order = {
          orderNumber,
          status: "unshipped",
          createTime: Date.now(),
          items: this.data.orderItems,
          goodsAmount: this.data.goodsAmount,
          freight: Number(this.data.freight).toFixed(1),
          totalAmount: this.data.totalAmount,
          address: this.data.address
        };

        const orders =
          wx.getStorageSync("orderList") || [];

        orders.unshift(order);

        wx.setStorageSync("orderList", orders);
        wx.setStorageSync("latestOrder", order);

        this.removePurchasedItems();

        wx.removeStorageSync("checkoutItems");

        wx.navigateTo({
          url: "/pages/order-result/order-result"
        });
      }
    });
  },

  // 下单后，把已经购买的商品从购物车删除
  removePurchasedItems() {
    const cart =
      wx.getStorageSync("cart") || [];

    const purchasedIds =
      this.data.orderItems.map(item => {
        return item.productId;
      });

    const newCart = cart.filter(item => {
      return !purchasedIds.includes(item.productId);
    });

    wx.setStorageSync("cart", newCart);
  }
});