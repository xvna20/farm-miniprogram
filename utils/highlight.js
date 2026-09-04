/**
 * 文本关键词高亮处理
 * @param {string} text - 原始文本
 * @param {string[]} keywords - 需要高亮的关键词数组
 * @param {string} color - 高亮颜色，默认品牌金色
 * @returns {string} 处理后的 HTML 字符串
 */
function highlightText(text, keywords, color = '#C49A52') {
  if (!text || !keywords || keywords.length === 0) return text

  let result = text
  // 按关键词长度降序排序，避免短词替换影响长词
  const sorted = [...keywords].sort((a, b) => b.length - a.length)

  sorted.forEach(kw => {
    // 转义正则特殊字符
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'g')
    result = result.replace(regex, `<span style="color:${color};font-weight:700">${kw}</span>`)
  })

  return result
}

module.exports = { highlightText }
