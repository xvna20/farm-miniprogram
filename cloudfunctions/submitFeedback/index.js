const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * submitFeedback - 提交意见反馈
 * 写入 feedbacks 集合（含 openid / 类型 / 内容 / 联系方式 / 状态）
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { type, typeLabel, content, contact } = event
  if (!OPENID) return { code: -1, msg: '无法获取用户身份' }
  if (!content || !String(content).trim()) return { code: -1, msg: '反馈内容不能为空' }

  const res = await db.collection('feedbacks').add({
    data: {
      _openid: OPENID,
      type: String(type || 'other'),
      typeLabel: String(typeLabel || '其他'),
      content: String(content).trim().slice(0, 500),
      contact: String(contact || '').slice(0, 50),
      status: 'pending',
      createTime: db.serverDate()
    }
  })

  return { code: 0, msg: 'ok', data: { id: res._id } }
}