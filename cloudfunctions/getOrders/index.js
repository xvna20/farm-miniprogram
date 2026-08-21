const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * getOrders - 获取该用户的全部订单
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { code: 0, msg: 'ok', data: { list: [] } }

  const res = await db.collection('orders').where({ _openid: OPENID }).limit(1).get()
  const list = res.data.length > 0 ? (res.data[0].list || []) : []

  return { code: 0, msg: 'ok', data: { list } }
}