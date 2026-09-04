const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * logUsage - 批量写入使用行为日志
 * events: Array<{ event, page, extra, time }>，最多 20 条
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { events } = event
  if (!Array.isArray(events) || events.length === 0) return { code: 0, msg: 'ok', data: { logged: 0 } }

  const col = db.collection('usage_logs')
  const batch = events.slice(0, 20).map((e) => {
    return col.add({
      data: {
        _openid: OPENID,
        event: String(e.event || 'unknown').slice(0, 50),
        page: String(e.page || '').slice(0, 100),
        extra: e.extra && typeof e.extra === 'object' ? e.extra : {},
        time: Number(e.time) || Date.now()
      }
    })
  })

  await Promise.all(batch)
  return { code: 0, msg: 'ok', data: { logged: batch.length } }
}