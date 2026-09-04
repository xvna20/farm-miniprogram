const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * syncOrders - 同步该用户的全部订单
 * 每个用户一条记录（orders 集合），整体覆盖，方便跨设备保持一致
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { list } = event
  if (!OPENID) return { code: -1, msg: '无法获取用户身份' }
  if (!Array.isArray(list)) return { code: -1, msg: '订单数据格式错误' }

  const orders = db.collection('orders')
  const res = await orders.where({ _openid: OPENID }).limit(1).get()
  const data = { list: list.slice(0, 200), updatedAt: Date.now() }

  if (res.data.length > 0) {
    await orders.doc(res.data[0]._id).update({ data })
  } else {
    await orders.add({ data: { _openid: OPENID, ...data } })
  }

  return { code: 0, msg: 'ok' }
}