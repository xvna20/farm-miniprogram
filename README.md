# farm-miniprogram · 皖北珍菌助农小程序

> 3 人团队协作实训项目。本文档为**团队协作指南**：说明当前代码形态、仓库结构、公共底层能力，以及每位成员需要实现的部分。

---

## 一、当前进展

已完成**公共底层框架 + 首页 + 底部 tabBar + 商城/个人中心占位页**，可在微信开发者工具正常编译运行。

| 模块 | 状态 | 负责人 |
|---|---|---|
| 公共底层（app 配置 / 请求封装 / 工具库 / 全局样式） | ✅ 完成，已推至 dev | 成员三 |
| 首页（功能卡片网格 + 底部 tabBar） | ✅ 完成 | 成员三 |
| 助农商城 | 🕐 占位页 | 成员二 |
| 个人中心 | 🕐 占位页 | 成员三 |
| 六张功能内容页（首页卡片跳转目标） | 🕐 待建 | 成员一 |

---

## 二、开发环境准备

1. **拉取代码**（当前主线在 `dev`）：
   ```bash
   git clone https://github.com/xvna20/farm-miniprogram.git
   git checkout dev
   ```
2. **微信开发者工具**：`导入项目 → 选择仓库根目录`（是 `farm-miniprogram/` 目录本身，不是外层 `farm/`）。AppID 已配置好，可直接调试。

3. **团队 Git 约定（三线协作流，请务必按此执行）**：

   **分支角色**
   - `main`：**最终整合/发布**，平时不动，只在项目最终阶段由负责人合入；
   - `dev`：**各成员功能集成线**，所有功能都汇聚到这里，大家共享；
   - `feature/m1`、`feature/m2`、`feature/m3`：每人自己的开发分支，**从 `dev` 拉取**。

   **日常开发流程（以 feature/mX 为例）**
   ```bash
   # ① 从 dev 拉出自己分支（仅首次）
   git checkout -b feature/mX origin/dev

   # ② 每次动工前，先同步 dev 最新代码（避免冲突）
   git checkout feature/mX
   git fetch origin
   git merge origin/dev

   # ③ 写完代码：在 feature 分支提交并推送
   git add .
   git commit -m "feat: 完成 xxx"
   git push origin feature/mX

   # ④ 共享代码：在 GitHub 仓库页面发起 Pull Request（feature/mX → dev）
   #    base: dev  ←  compare: feature/mX → 确认后 Create 并 Merge
   #    PR 合入后，dev 即包含你的代码，其他成员 pull 即可使用
   ```

   **同步队友的代码（所有人都这样做）**
   ```bash
   git checkout dev
   git pull origin dev
   ```

   > 关键点：
   > - **你的代码进入 dev 的唯一途径是 PR（feature → dev）**，合完大家 `git pull origin dev` 就能用到；
   > - **不要直接 push 业务代码到 `dev` / `main`**，也不要直接在 dev 上开发；
   > - 每次合 PR 前先确保已同步 dev 最新（步骤②），减少冲突。

---

## 三、仓库结构

```
farm-miniprogram/
├── app.json              全局配置：页面注册、原生 tabBar、导航栏、网络超时、权限
├── app.js                全局逻辑：globalData(登录态/环境/用户信息)、showToast/showLoading 封装
├── app.wxss              全局公共样式：重置 + flex/卡片/圆角/间距 通用类
├── sitemap.json          搜索配置
├── static/tab/           tabBar 图标（当前为占位，可替换）
├── pages/
│   ├── index/index       首页（功能卡片入口，已完成）
│   ├── mall/mall         助农商城（占位，成员二）
│   └── user/user         个人中心（占位，成员三）
└── utils/
    ├── request.js        统一网络请求封装
    └── tools.js          通用工具库（日期/校验/防抖节流/存储）
```

---

## 四、公共底层能力（请务必复用！）

### 1. 网络请求 → `utils/request.js`
> 页面**禁止直接 `wx.request`**，统一走这里，会自动携带 token / loading / 错误提示 / 接口前缀。

```js
const { get, post, put, del, upload } = require('../../utils/request')

get('/goods/list', { page: 1 })                              // 默认无 loading
post('/order/create', { id: 1 }, { showLoading: true })      // 开启 loading
```

- 基础域名与接口前缀在 `app.js` 的 `ENV_CONFIG` 中统一维护，后端对接只需改那里。
- 接口约定返回格式：`{ code: 200, msg, data }`。

### 2. 通用工具库 → `utils/tools.js`

```js
const tools = require('../../utils/tools')
tools.formatTime(new Date(), 'YYYY-MM-DD')       // 日期格式化
tools.isPhone('138...') / tools.isAmount('10')   // 常用校验
tools.debounce(fn, 300) / tools.throttle(fn, 300) // 防抖/节流
tools.getStorage('token') / tools.setStorage(key, val) // 同步存储
```

### 3. 全局方法 → `getApp()`

```js
const app = getApp()
app.showToastSuccess('成功')   // 成功提示
app.showToastError('失败')     // 失败提示
app.showLoading('加载中') / app.hideLoading()
app.globalData.userInfo        // 用户信息
app.globalData.token           // 登录态
```

### 4. 全局样式 → `app.wxss`
> 公共类以 `gp-` 前缀开头，请优先复用，保持整体风格统一。

| 类别 | 示例类 |
|---|---|
| flex 布局 | `gp-flex` `gp-flex-center` `gp-flex-between` `gp-flex-col` |
| 卡片 | `gp-card` `gp-radius` `gp-radius-lg` |
| 间距 | `gp-mt-sm` `gp-mb-md` `gp-plr-md` `gp-p-md` |
| 文本 | `gp-text-bold` `gp-text-primary` `gp-text-secondary` `gp-ellipsis` |

主题色：`--primary-color: #1FAE5A`（助农绿），样式里可用 `var(--primary-color)`。

---

## 五、成员分工与待实现内容

### 成员一 —— 功能内容页（`feature/m1`）

首页 6 张卡片已配置好跳转路由，点击会提示"建设中"。请按下列路径实现**内容展示页**（路径已在 `pages/index/index.js` 的 `cards.url` 中设定）：

| 卡序号 | 页面路径 | 内容 |
|---|---|---|
| 2 | `/pages/article/history/history` | 红铸初心·机场新村振兴奋斗史（图文纪实） |
| 3 | `/pages/article/mushroom/mushroom` | 皖北珍菌·菌种辨识（菌类科普） |
| 4 | `/pages/article/grow/grow` | 科创兴农·种植流程（双基地讲解） |
| 5 | `/pages/article/recipe/recipe` | 食养安康·家常食谱（菌类食谱） |
| 6 | `/pages/article/news/news` | 助农资讯（惠农政策/行业动态） |
| 7 | `/pages/article/about/about` | 关于项目 |

> 注意：这些多为图文、排版、文案、交互。**大量图片请放后端/CDN 用 URL 引用，不要打进代码包**。每新建一个页面，记得在 `app.json` 的 `pages` 中注册。

### 成员二 —— 交易链路（`feature/m2`）

将 `pages/mall/mall` 占位页替换为真实商城。

| 页序号 | 内容 |
|---|---|
| 12 | 助农商城（商品列表） |
| 13–14 | 商品详情 |
| 15–16 | 购物车及空状态 |
| 17 | 确认订单 |
| 18 | 订单提交结果 |

> **重点：数据必须由程序统一计算**。价格、数量、购物车总额、订单金额统一维护在 `data` 中动态更新，禁止每页手写死数据。

### 成员三 —— 个人中心（`feature/m3`）

将 `pages/user/user` 占位页替换为真实个人中心。

| 页序号 | 内容 |
|---|---|
| 19 | 个人中心 |
| 20 | 编辑资料（头像可复用 `upload`） |
| 21 | 意见反馈 |
| 22 | 收货地址 |
| 23–26 | 订单页：**用一个页面 + 状态切换**（待付款/待发货/待收货/已完成），不做四套页面 |

> **注意约束**：每个人只改自己负责的页面与模块，公共文件（`utils/*`、`app.*`）若有需求先沟通再走分支修改。

---

## 六、常用命令

```bash
git checkout -b feature/mX origin/dev   # 从 dev 拉个人分支
git add .                               # 暂存
git commit -m "feat: 完成 xxx"           # 提交
git push origin feature/mX              # 推分支
```

> 提交信息建议带简单前缀：`feat`(新功能) / `fix`(修复) / `chore`(杂项) / `docs`(文档)。

---

## 七、云开发（云函数 / 数据库）约定

> 项目已接入微信云开发（`wx.cloud`），以下约定**所有成员通用**，请照做，避免踩坑。

### 1. 打开项目的目录

- **统一用开发者工具打开仓库根目录 `farm-miniprogram/`**（不是外层 `farm/`）。该目录的 `project.config.json` 已配置 `cloudfunctionRoot: "cloudfunctions/"` 与 AppID。
- 若左侧 `cloudfunctions` 没有显示☁图标、右键函数文件夹没有「上传并部署」选项，基本都是打开目录不对或 `cloudfunctionRoot` 未生效，重开项目即可。

### 2. 云环境

- 环境 ID：`cloud1-d5gmj24xffe354a63`（与 `app.js` 中 `wx.cloud.init({ env })` 一致）。
- 部署云函数、查看数据库/日志时，请确保工具选中的就是该环境；选错会报 `env not found`。

### 3. 上传部署云函数

- 六个云函数在 `cloudfunctions/` 下：`login`、`getOrders`、`syncOrders`、`submitFeedback`、`saveUserInfo`、`logUsage`。
- 部署方式：在对应云函数文件夹上**右键 → 上传并部署：云端安装依赖**（本地无需 node_modules）。
- 云函数内统一 `cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })`，自动跟随当前环境，新增云函数时请沿用。
- 小程序端调用统一走 `utils/cloud.js` 的 `call / safeCall`，禁止直接 `wx.cloud.callFunction`。

### 4. 数据库集合（需手动创建）

微信云数据库**集合不会自动创建**，首次联调前请在「云开发控制台 → 数据库」手动新建以下 4 个集合：

| 集合 | 用途 | 写入方 |
|---|---|---|
| `users` | 用户资料（登录 upsert） | login / saveUserInfo |
| `orders` | 每个用户一条，`list` 字段存全部订单 | syncOrders / getOrders |
| `feedbacks` | 意见反馈 | submitFeedback |
| `usage_logs` | 行为埋点 | logUsage |

> 不建 `users` 时 `login` 会失败，但 app.js 已做降级、小程序仍可运行，注意别漏建。

#### 4.1 各集合含义与字段

**`users` — 用户资料表**（login / saveUserInfo 写入）
- 每个用户一条记录，靠 `_openid` 识别。
- 主要字段：`nickname` 昵称、`avatar` 头像、`gender` 性别、`region` 地区、`bio` 简介、`phone` 手机号、`createdAt` / `lastLoginAt` 时间、`loginCount` 登录次数。

**`orders` — 订单表**（syncOrders 写入 / getOrders 读取）
- 每个用户一条记录，`list` 字段存该用户全部订单数组，另加 `updatedAt` 更新时间。

**`feedbacks` — 意见反馈表**（submitFeedback 写入）
- 每次提交新增一条。主要字段：`_openid`、`type` / `typeLabel` 反馈类型、`content` 内容（限 500 字）、`contact` 联系方式（限 50 字）、`status` 状态（默认 `pending`）、`createTime` 提交时间。

**`usage_logs` — 行为埋点日志表**（logUsage 批量写入）
- 一个事件一条，批量插入。主要字段：`_openid`、`event` 事件名（如 `launch` / `page_view`）、`page` 页面路径、`extra` 附加信息、`time` 时间戳。

### 5. 数据模型约定（orders）

- `orders` 集合按「每用户一条记录」设计：`syncOrders` 整体覆盖该用户文档，`getOrders` 读回 `list` 字段。**不要改成每笔订单一条文档**，否则两个云函数需同步改造。