const UNPAID_TIMEOUT = 60 * 60 * 1000
const SHIP_TO_RECEIVE = 8 * 60 * 60 * 1000
const RECEIVE_TO_DONE = 24 * 60 * 60 * 1000

function deriveOrderStatus(order, now) {
  const t = now || Date.now()
  const createTime = Number(order.createTime || 0)
  if (!createTime) return order.status

  const elapsed = t - createTime
  const s = order.status || 'unpaid'

  if (s === 'unpaid') {
    return elapsed >= UNPAID_TIMEOUT ? 'cancelled' : 'unpaid'
  }

  if (s === 'unshipped') {
    if (elapsed >= SHIP_TO_RECEIVE + RECEIVE_TO_DONE) return 'done'
    if (elapsed >= SHIP_TO_RECEIVE) return 'unreceived'
    return 'unshipped'
  }

  return s
}

module.exports = {
  UNPAID_TIMEOUT,
  SHIP_TO_RECEIVE,
  RECEIVE_TO_DONE,
  deriveOrderStatus
}