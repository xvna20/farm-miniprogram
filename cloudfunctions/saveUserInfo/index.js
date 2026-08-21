const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * saveUserInfo - 保存/更新用户资料
 * 只更新白名单字段，避免客户端覆盖 _openid/_id 等系统字段
 */
const ALLOWED = ['nickname', 'avatar', 'gender', 'region', 'regionArr', 'bio', 'phone']

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { userInfo } = event
  if (!OPENID) return { code: -1, msg: '无法获取用户身份' }
  if (!userInfo || typeof userInfo !== 'object') return { code: -1, msg: '参数错误' }

  const updateData = { updatedAt: Date.now() }
  for (const key of ALLOWED) {
    if (userInfo[key] !== undefined) updateData[key] = userInfo[key]
  }

  const users = db.collection('users')
  const res = await users.where({ _openid: OPENID }).limit(1).get()

  if (res.data.length > 0) {
    await users.doc(res.data[0]._id).update({ data: updateData })
  } else {
    const now = Date.now()
    await users.add({
      data: {
        _openid: OPENID,
        ...updateData,
        createdAt: now,
        lastLoginAt: now,
        loginCount: 1
      }
    })
  }

  return { code: 0, msg: 'ok' }
}