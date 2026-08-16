/**
 * pages/user/edit-profile/avatar-crop.js - 自写精简头像裁剪页
 * 单指拖动定位、双指捏合/按钮缩放，全程图片盖满方形裁剪框；
 * 完成时用 Canvas 2D 按显示区域反推原图像素区域导出 520x520 方形头像。
 */
const app = getApp();

const MAX_SCALE = 3;        // 用户最大缩放倍率（相对初始覆盖比例）
const EXPORT_SCALE = 2;     // 导出尺寸相对裁剪框的倍率

Page({
  data: {
    statusBarHeight: 20,
    safeBottom: 0,
    src: '',
    stageSize: 0,
    stageTop: 0,
    imgBaseW: 0,
    imgBaseH: 0,
    dispW: 0,
    dispH: 0,
    imgLeft: 0,
    imgTop: 0,
    scale: 1,
    zoomLabel: '1.0×',
    ready: false
  },

  onLoad(options) {
    const src = options.src ? decodeURIComponent(options.src) : '';
    if (!src) {
      wx.showToast({ title: '未获取到图片', icon: 'none' });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 600);
      return;
    }

    const sys = wx.getWindowInfo();
    const statusBarHeight = sys.statusBarHeight || 20;
    const safeBottom = sys.safeArea
      ? Math.max(0, sys.screenHeight - sys.safeArea.bottom)
      : 0;

    // 裁剪框尺寸：留出两行顶栏与底部缩放区
    const headH = statusBarHeight + 44 + 64;
    const reserve = 150 + safeBottom;
    const remain = sys.windowHeight - headH - reserve;
    const stageSize = Math.max(200, Math.min(sys.windowWidth - 32, remain - 16));
    const stageTop = headH + (remain - stageSize) / 2;

    this.setData({ src, statusBarHeight, safeBottom, stageSize, stageTop });

    // 读取原图自然尺寸，按 aspectFill 计算初始显示尺寸（scale=1 时盖满裁剪框）
    wx.getImageInfo({
      src,
      success: (res) => {
        const imgW = res.width;
        const imgH = res.height;
        const cover = Math.max(stageSize / imgW, stageSize / imgH);
        const imgBaseW = imgW * cover;
        const imgBaseH = imgH * cover;
        this._imgW = imgW;
        this._imgH = imgH;
        this._scale = 1;
        this._stageLeftX = (sys.windowWidth - stageSize) / 2;
        this._stageTopY = stageTop;
        this.setData({
          imgBaseW,
          imgBaseH,
          dispW: imgBaseW,
          dispH: imgBaseH,
          imgLeft: (stageSize - imgBaseW) / 2,
          imgTop: (stageSize - imgBaseH) / 2,
          scale: 1,
          ready: true
        });
      },
      fail: () => {
        wx.showToast({ title: '图片读取失败', icon: 'none' });
        setTimeout(() => wx.navigateBack({ delta: 1 }), 600);
      }
    });
  },

  /* ===== 手势：拖动 / 双指缩放 ===== */
  onTouchStart(e) {
    const t = e.touches;
    this._t0 = t[0] ? { x: t[0].clientX, y: t[0].clientY } : null;
    this._t1 = t[1] ? { x: t[1].clientX, y: t[1].clientY } : null;
    this._startLeft = this.data.imgLeft;
    this._startTop = this.data.imgTop;
    this._lastDist = this._t0 && this._t1
      ? this._dist(this._t0, this._t1)
      : 0;
  },

  onTouchMove(e) {
    const t = e.touches;
    if (!this.data.ready) return;

    if (t.length >= 2) {
      // 两指：每次 move 用 与上一次的距离比 增量缩放（不依赖手势起始 touchstart）
      const cur0 = { x: t[0].clientX, y: t[0].clientY };
      const cur1 = { x: t[1].clientX, y: t[1].clientY };
      const dist = this._dist(cur0, cur1);
      if (this._lastDist > 0 && dist > 0) {
        const mx = (cur0.x + cur1.x) / 2;
        const my = (cur0.y + cur1.y) / 2;
        const nextScale = this._clampScale(this._scale * dist / this._lastDist);
        if (nextScale !== this._scale) {
          this._setScale(nextScale, mx - this._stageLeftX, my - this._stageTopY);
        }
      }
      this._lastDist = dist;
    } else if (t.length === 1) {
      const cur = { x: t[0].clientX, y: t[0].clientY };
      if (this._t0) {
        this._moveTo(this._startLeft + cur.x - this._t0.x, this._startTop + cur.y - this._t0.y);
      }
    }
  },

  onTouchEnd() {
    this._t0 = null;
    this._t1 = null;
    this._lastDist = 0;
  },

  /* ===== 按钮缩放 ===== */
  onZoomIn() {
    this._zoomDelta(0.25);
  },

  onZoomOut() {
    this._zoomDelta(-0.25);
  },

  /* ===== 确认：Canvas 2D 导出裁剪窗口 ===== */
  onConfirm() {
    if (!this.data.ready) {
      wx.showToast({ title: '图片加载中，请稍候', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '裁剪中...', mask: true });

    const d = this.data;
    const exportSize = Math.min(1024, Math.round(d.stageSize * EXPORT_SCALE));
    // 裁剪框（舞台）对应原图区域：屏幕坐标 -> 原图像素
    // （stage 左上角在图片显示坐标系中位于 (-imgLeft, -imgTop)，再按显示比例换算回原图）
    const dispScaleX = this._imgW / d.dispW;
    const dispScaleY = this._imgH / d.dispH;
    const sx = -d.imgLeft * dispScaleX;
    const sy = -d.imgTop * dispScaleY;
    const sw = d.stageSize * dispScaleX;
    const sh = d.stageSize * dispScaleY;

    wx.createSelectorQuery()
      .select('#crop-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0] || !res[0].node) {
          wx.hideLoading();
          wx.showToast({ title: '画布初始化失败', icon: 'none' });
          return;
        }
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        canvas.width = exportSize;
        canvas.height = exportSize;

        const img = canvas.createImage();
        img.onload = () => {
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, exportSize, exportSize);
          wx.canvasToTempFilePath({
            canvas,
            x: 0,
            y: 0,
            width: exportSize,
            height: exportSize,
            destWidth: exportSize,
            destHeight: exportSize,
            fileType: 'png',
            success: (res2) => {
              wx.hideLoading();
              app.globalData.croppedAvatar = res2.tempFilePath;
              wx.navigateBack({ delta: 1 });
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: '裁剪失败，请重试', icon: 'none' });
            }
          });
        };
        img.onerror = () => {
          wx.hideLoading();
          wx.showToast({ title: '图片加载失败', icon: 'none' });
        };
        img.src = this.data.src;
      });
  },

  /* ===== 取消 ===== */
  onCancel() {
    wx.navigateBack({ delta: 1 });
  },

  /* ===== 内部方法 ===== */
  _dist(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  },

  _clampScale(s) {
    return Math.max(1, Math.min(MAX_SCALE, s));
  },

  /* 设置新缩放（以 stage 内一点为锚点，保持该点下的图片内容不动） */
  /* 直接改变图片元素的实际宽高（dispW/dispH），实现真正的照片大小缩放 */
  _setScale(nextScale, anchorX, anchorY) {
    const d = this.data;
    const s = this._clampScale(nextScale);
    if (s === this._scale) return;

    const dispW = d.imgBaseW * s;
    const dispH = d.imgBaseH * s;
    const fx = (anchorX - d.imgLeft) / d.dispW;
    const fy = (anchorY - d.imgTop) / d.dispH;
    this._scale = s;
    this._moveTo(
      anchorX - fx * dispW,
      anchorY - fy * dispH,
      dispW,
      dispH
    );
    this._syncZoomLabel();
  },

  /* 按倍率增量缩放（按钮：±0.25），以裁剪框中心为锚点 */
  _zoomDelta(delta) {
    const nextScale = this._clampScale(this._scale + delta);
    if (nextScale === this._scale) return;
    this._setScale(nextScale, this.data.stageSize / 2, this.data.stageSize / 2);
  },

  /* 移动图片（钳制在图片始终盖满裁剪框，绝不露出黑底） */
  _moveTo(left, top, dispW, dispH) {
    const d = this.data;
    dispW = dispW || d.dispW;
    dispH = dispH || d.dispH;
    const maxLeft = 0;
    const minLeft = d.stageSize - dispW;
    const maxTop = 0;
    const minTop = d.stageSize - dispH;
    const imgLeft = Math.min(maxLeft, Math.max(minLeft, left));
    const imgTop = Math.min(maxTop, Math.max(minTop, top));
    this.setData({ imgLeft, imgTop, dispW, dispH });
  },

  _syncZoomLabel() {
    this.setData({
      zoomLabel: this._scale.toFixed(1) + '×'
    });
  }
});