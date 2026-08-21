/**
 * utils/usage.js - 使用行为埋点
 * -------------------------------------------------------------
 * 策略：事件先攒在本地队列，攒够一批或定时/退出时批量上报 logUsage，
 *       避免高频写库。云端不可用时自动丢弃，不影响业务。
 *
 * 使用示例：
 *   const usage = require('../../utils/usage')
 *   usage.push('page_view', { page: 'home' })
 *   usage.push('pay_order', { orderNumber })
 * -------------------------------------------------------------
 */
const cloud = require('./cloud')

const QUEUE_KEY = 'usageQueue'
const BATCH_SIZE = 10
const FLUSH_INTERVAL = 30000
const MAX_QUEUE = 50

let timer = null

function loadQueue() {
  try {
    return wx.getStorageSync(QUEUE_KEY) || []
  } catch (e) {
    return []
  }
}

function persist(list) {
  try {
    wx.setStorageSync(QUEUE_KEY, list.slice(0, MAX_QUEUE))
  } catch (e) { /* 忽略 */ }
}

function getPage() {
  try {
    const pages = getCurrentPages()
    const cur = pages[pages.length - 1]
    return cur ? cur.route || '' : ''
  } catch (e) {
    return ''
  }
}

/**
 * 记录一个使用事件
 * @param {String} event  事件名，如 'launch' / 'page_view' / 'pay_order'
 * @param {Object} [extra] 附加信息
 */
function push(event, extra = {}) {
  const queue = loadQueue()
  queue.push({
    event,
    page: getPage(),
    extra,
    time: Date.now()
  })
  persist(queue)
  if (queue.length >= BATCH_SIZE) {
    flush()
  } else {
    ensureTimer()
  }
}

/** 批量上报（外部可主动调用，如 app.onHide） */
function flush() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  const queue = loadQueue()
  if (queue.length === 0) return
  const events = queue.splice(0, BATCH_SIZE)
  persist(queue)
  cloud.safeCall('logUsage', { events })
}

function ensureTimer() {
  if (timer) return
  timer = setInterval(flush, FLUSH_INTERVAL)
}

module.exports = { push, flush }
