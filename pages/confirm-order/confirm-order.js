const { products } = require("../../data/products.js");
const tools = require("../../utils/tools");
const cloud = require("../../utils/cloud");
const usage = require("../../utils/usage");
const { deriveOrderStatus } = require("../../utils/order");

Page({
  data: {
    orderItems: [],

    address: null,

    deliveryText: "预计明日 18:00 前送达",
    deliveryType: "冷链配送",

    freight: 10.0,

    goodsAmount: "0.0",
    totalAmount: "0.0"
  },

  onLoad() {
    this.loadOrder();
    this.ensureUnpaidOrder();
  },

  onShow() {
    this.loadAddress();
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

  // 加载收货地址：优先用刚选的地址 → 已生成的待付款订单里的地址 → 默认地址
  loadAddress() {
    const selected =
      tools.getStorage("selectedOrderAddress", null);

    if (selected && selected.id) {
      tools.removeStorage("selectedOrderAddress");
      this.setAddress(selected);
      return;
    }

    // 复用待付款订单时，沿用上次已选的地址
    if (this.orderNumber) {
      const order = this.findOrder(this.orderNumber);
      if (order && order.address && order.address.id) {
        this.setData({ address: order.address });
        return;
      }
    }

    const list = tools.getStorage("addressList", []);

    if (list.length === 0) {
      this.setData({ address: null });
      return;
    }

    const defaultAddr =
      list.find(item => item.isDefault) || list[0];

    this.setAddress(defaultAddr);
  },

  // 设置地址并同步写入待付款订单，保证退出再进来地址不变
  setAddress(item) {
    const address = this.formatAddress(item);
    this.setData({ address });

    if (!this.orderNumber) return;
    const orders = tools.getStorage("orderList", []);
    const idx = orders.findIndex(o => o.orderNumber === this.orderNumber);
    if (idx > -1) {
      orders[idx] = { ...orders[idx], address };
      tools.setStorage("orderList", orders);
      this.syncOrdersToCloud();
    }
  },

  // 转为确认页展示用结构（保留原始字段，便于下单时一并写入订单）
  formatAddress(item) {
    return {
      id: item.id,
      name: item.name,
      phone: item.phone,
      region: item.region || "",
      detail: (item.region || "") + (item.detail || ""),
      fullDetail: item.detail || "",
      isDefault: !!item.isDefault,
      phoneDisplay: this.maskPhone(item.phone)
    };
  },

  /* 手机号脱敏 */
  maskPhone(phone) {
    const str = String(phone || "");
    if (str.length < 7) return str;
    return str.slice(0, 3) + "****" + str.slice(-4);
  },

  // 点击收货地址：有地址则进入选择，无地址则去新增
  chooseAddress() {
    const list = tools.getStorage("addressList", []);

    if (list.length === 0) {
      wx.navigateTo({
        url: "/pages/user/address-edit/address-edit"
      });
      return;
    }

    wx.navigateTo({
      url: "/pages/user/address/address?select=1"
    });
  },

  // 进入结算页即生成/复用一笔待付款订单
  ensureUnpaidOrder() {
    if (this.data.orderItems.length === 0) return;

    const checkoutItems =
      wx.getStorageSync("checkoutItems") || [];

    const orders = tools.getStorage("orderList", []);

    // 商品与当前结算一致时复用，避免重复生成
    const existed = orders.find(o => {
      return deriveOrderStatus(o) === "unpaid" &&
        this.sameItems(o.items, checkoutItems);
    });

    if (existed) {
      this.orderNumber = existed.orderNumber;
      return;
    }

    const order = {
      orderNumber: "WB" + Date.now() + Math.floor(Math.random() * 100),
      status: "unpaid",
      createTime: Date.now(),
      items: this.data.orderItems,
      goodsAmount: this.data.goodsAmount,
      freight: Number(this.data.freight).toFixed(1),
      totalAmount: this.data.totalAmount,
      address: null
    };

    orders.unshift(order);
    tools.setStorage("orderList", orders);
    this.orderNumber = order.orderNumber;
    this.syncOrdersToCloud();
    usage.push("unpaid_order", { orderNumber: order.orderNumber });
  },

  /* 按单号查找订单 */
  findOrder(orderNumber) {
    const orders = tools.getStorage("orderList", []);
    return orders.find(o => o.orderNumber === orderNumber);
  },

  /* 把最新订单列表同步到云端（失败静默） */
  syncOrdersToCloud() {
    const orders = tools.getStorage("orderList", []);
    cloud.safeCall("syncOrders", { list: orders });
  },

  /* 比较两批商品是否一致（productId + quantity） */
  sameItems(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;

    const normalize = arr => {
      return arr
        .map(i => String(i.productId) + ":" + String(i.quantity))
        .sort()
        .join(",");
    };

    return normalize(a) === normalize(b);
  },

  submitOrder() {
    if (this.data.orderItems.length === 0) {
      return;
    }

    if (!this.data.address) {
      wx.showToast({
        title: "请先添加收货地址",
        icon: "none"
      });
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
          this.orderNumber || ("WB" + Date.now());

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

        // 待付款订单存在则原地更新，避免重复单
        const idx = orders.findIndex(o => {
          return o.orderNumber === orderNumber;
        });

        if (idx > -1) {
          orders[idx] = order;
        } else {
          orders.unshift(order);
        }

        wx.setStorageSync("orderList", orders);
        wx.setStorageSync("latestOrder", order);

        this.syncOrdersToCloud();
        usage.push("pay_order", { orderNumber });

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