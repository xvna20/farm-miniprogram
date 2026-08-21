const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * login - 静默登录
 * 通过 openid 识别用户，在 users 集合 upsert 一条用户记录，返回用户资料
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { code: -1, msg: '无法获取用户身份' }

  const users = db.collection('users')
  const res = await users.where({ _openid: OPENID }).limit(1).get()
  const now = Date.now()

  if (res.data.length > 0) {
    const user = res.data[0]
    const loginCount = (user.loginCount || 0) + 1
    await users.doc(user._id).update({
      data: { lastLoginAt: now, loginCount }
    })
    return {
      code: 0,
      msg: 'ok',
      data: { ...user, lastLoginAt: now, loginCount }
    }
  }

  const addRes = await users.add({
    data: {
      _openid: OPENID,
      nickname: '',
      avatar: '',
      gender: '保密',
      region: '',
      regionArr: [],
      bio: '',
      phone: '',
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1
    }
  })

  return {
    code: 0,
    msg: 'ok',
    data: {
      _id: addRes._id,
      _openid: OPENID,
      nickname: '',
      avatar: '',
      gender: '保密',
      region: '',
      regionArr: [],
      bio: '',
      phone: '',
      createdAt: now,
      lastLoginAt: now,
      loginCount: 1
    }
  }
}
