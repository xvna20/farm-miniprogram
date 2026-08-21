/**
 * utils/cloud.js - 云开发调用封装
 * -------------------------------------------------------------
 * 职责：
 *   1. 统一封装 wx.cloud.callFunction，约定返回结构 { code, msg, data }
 *   2. 云端不可用（未部署/无网络）时安全降级，不打断业务
 *
 * 使用示例：
 *   const cloud = require('../../utils/cloud')
 *   cloud.call('login').then(user => {...})
 *   cloud.safeCall('saveUserInfo', { userInfo })   // 失败静默
 * -------------------------------------------------------------
 */

/**
 * 调用云函数（失败会 reject）
 * @param {String} name  云函数名
 * @param {Object} data  入参
 * @returns {Promise}    resolve 云端 data / reject { code, msg }
 */
function call(name, data = {}) {
  return new Promise((resolve, reject) => {
    if (typeof wx.cloud === 'undefined' || !wx.cloud.callFunction) {
      reject({ code: -1, msg: '云开发不可用' })
      return
    }
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        const result = res.result || {}
        if (result.code === 0) {
          resolve(result.data)
        } else {
          reject({ code: result.code || -1, msg: result.msg || '请求失败' })
        }
      },
      fail: (err) => reject({ code: -2, msg: '网络异常', err })
    })
  })
}

/**
 * 安全调用：失败时 resolve(null)，业务不中断
 * @returns {Promise} 云端 data 或 null
 */
function safeCall(name, data = {}) {
  return call(name, data).catch(() => null)
}

module.exports = { call, safeCall }
