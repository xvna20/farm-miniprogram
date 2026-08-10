const { products } = require("../../data/products.js");

Page({
  data: {
    cartItems: [],
    allSelected: true,
    selectedCount: 0,
    totalPrice: "0.0"
  },

  onShow() {
    this.loadCart();
  },

  loadCart() {
    const cart = wx.getStorageSync("cart") || [];

    const cartItems = cart
      .map(cartItem => {
        const product = products.find(item => {
          return item.id === cartItem.productId;
        });

        if (!product) {
          return null;
        }

        return {
          productId: product.id,
          name: product.name,
          shortSubtitle: product.shortSubtitle,
          price: Number(product.price),
          priceText: Number(product.price).toFixed(1),
          unit: product.unit,
          image: product.image,
          imageText: product.imageText,
          quantity: Number(cartItem.quantity || 1),
          selected: true
        };
      })
      .filter(item => item !== null);

    this.setData({
      cartItems,
      allSelected: cartItems.length > 0
    });

    this.calculateTotal();
  },

  saveCart() {
    const cart = this.data.cartItems.map(item => {
      return {
        productId: item.productId,
        quantity: item.quantity
      };
    });

    wx.setStorageSync("cart", cart);
  },

  toggleItem(e) {
    const productId = Number(e.currentTarget.dataset.id);

    const cartItems = this.data.cartItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          selected: !item.selected
        };
      }

      return item;
    });

    const allSelected =
      cartItems.length > 0 &&
      cartItems.every(item => item.selected);

    this.setData({
      cartItems,
      allSelected
    });

    this.calculateTotal();
  },

  toggleAll() {
    const nextSelected = !this.data.allSelected;

    const cartItems = this.data.cartItems.map(item => {
      return {
        ...item,
        selected: nextSelected
      };
    });

    this.setData({
      cartItems,
      allSelected: nextSelected
    });

    this.calculateTotal();
  },

  increaseQuantity(e) {
    const productId = Number(e.currentTarget.dataset.id);

    const cartItems = this.data.cartItems.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: item.quantity + 1
        };
      }

      return item;
    });

    this.setData({
      cartItems
    });

    this.saveCart();
    this.calculateTotal();
  },

  decreaseQuantity(e) {
    const productId = Number(e.currentTarget.dataset.id);

    const cartItems = this.data.cartItems.map(item => {
      if (item.productId === productId) {
        if (item.quantity <= 1) {
          wx.showToast({
            title: "商品数量不能少于1",
            icon: "none"
          });

          return item;
        }

        return {
          ...item,
          quantity: item.quantity - 1
        };
      }

      return item;
    });

    this.setData({
      cartItems
    });

    this.saveCart();
    this.calculateTotal();
  },

  deleteItem(e) {
    const productId = Number(e.currentTarget.dataset.id);

    wx.showModal({
      title: "删除商品",
      content: "确定从购物车中删除该商品吗？",

      success: res => {
        if (!res.confirm) {
          return;
        }

        const cartItems = this.data.cartItems.filter(item => {
          return item.productId !== productId;
        });

        const allSelected =
          cartItems.length > 0 &&
          cartItems.every(item => item.selected);

        this.setData({
          cartItems,
          allSelected
        });

        this.saveCart();
        this.calculateTotal();
      }
    });
  },

  calculateTotal() {
    let selectedCount = 0;
    let totalPrice = 0;

    this.data.cartItems.forEach(item => {
      if (item.selected) {
        selectedCount += item.quantity;
        totalPrice += item.price * item.quantity;
      }
    });

    this.setData({
      selectedCount,
      totalPrice: totalPrice.toFixed(1)
    });
  },

  goToMall() {
    wx.switchTab({
      url: "/pages/mall/mall"
    });
  },

  goToCheckout() {
    const selectedItems = this.data.cartItems.filter(item => {
      return item.selected;
    });

    if (selectedItems.length === 0) {
      wx.showToast({
        title: "请选择要结算的商品",
        icon: "none"
      });
      return;
    }

    const checkoutItems = selectedItems.map(item => {
      return {
        productId: item.productId,
        quantity: item.quantity
      };
    });

    wx.setStorageSync("checkoutItems", checkoutItems);

    wx.navigateTo({
      url: "/pages/confirm-order/confirm-order"
    });
  }
});