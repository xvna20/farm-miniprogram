const { products } = require("../../data/products.js");

Page({
  data: {
    keyword: "",

    categories: [
      { id: "fresh", name: "鲜菌" },
      { id: "dry", name: "干货" },
      { id: "gift", name: "礼盒" },
      { id: "health", name: "食养" }
    ],

    activeCategory: "",

    products: [],

    displayProducts: [],

    cartCount: 0
  },

  onLoad() {
    this.setData({
      products
    });

    this.updateProductList();
  },

  onShow() {
    this.updateCartCount();
  },

  onSearchInput(e) {
    this.setData({
      keyword: e.detail.value
    });

    this.updateProductList();
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;

    const nextCategory =
      this.data.activeCategory === category ? "" : category;

    this.setData({
      activeCategory: nextCategory
    });

    this.updateProductList();
  },

  updateProductList() {
    const {
      products,
      keyword,
      activeCategory
    } = this.data;

    const text = keyword.trim().toLowerCase();

    const result = products.filter(item => {
      const matchSearch =
        !text ||
        item.name.toLowerCase().includes(text) ||
        item.shortSubtitle.toLowerCase().includes(text);

      const matchCategory =
        !activeCategory ||
        item.category === activeCategory;

      return matchSearch && matchCategory;
    });

    this.setData({
      displayProducts: result
    });
  },

  goToProductDetail(e) {
    const id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`
    });
  },

  goToCart() {
    wx.navigateTo({
      url: "/pages/cart/cart"
    });
  },

  updateCartCount() {
    const cart = wx.getStorageSync("cart") || [];

    const count = cart.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);

    this.setData({
      cartCount: count
    });
  }
});