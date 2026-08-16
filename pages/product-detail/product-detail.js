const { products } = require("../../data/products.js");

Page({
  data: {
    product: null,
    cartCount: 0
  },

  onLoad(options) {
    const id = Number(options.id);

    const foundProduct = products.find(item => {
      return item.id === id;
    });

    if (!foundProduct) {
      wx.showToast({
        title: "商品不存在",
        icon: "none"
      });

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);

      return;
    }

    // 给价格统一保留一位小数
    const product = {
      ...foundProduct,
      priceText: Number(foundProduct.price).toFixed(1)
    };

    this.setData({
      product
    });

    this.updateCartCount();
  },

  onShow() {
    this.updateCartCount();
  },

  // 统计购物车商品总数量
  updateCartCount() {
    const cart = wx.getStorageSync("cart") || [];

    const count = cart.reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, 0);

    this.setData({
      cartCount: count
    });
  },

  // 加入购物车
  addToCart() {
    const product = this.data.product;

    if (!product) {
      return;
    }

    const cart = wx.getStorageSync("cart") || [];

    const existingItem = cart.find(item => {
      return item.productId === product.id;
    });

    if (existingItem) {
      existingItem.quantity =
        Number(existingItem.quantity || 0) + 1;
    } else {
      cart.push({
        productId: product.id,
        quantity: 1
      });
    }

    wx.setStorageSync("cart", cart);

    this.updateCartCount();

    wx.showToast({
      title: "已加入购物车",
      icon: "success"
    });
  },

  // 进入购物车
  goToCart() {
    wx.navigateTo({
      url: "/pages/cart/cart"
    });
  }
});