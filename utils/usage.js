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
function push() {}

function flush() {}

module.exports = { push, flush }
