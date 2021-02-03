import api from './api'

const softwareId = 4736, softwareSecret = '0nyn89M6un61Np48i8485UIUu0h6n8HjH868T4HT'
const username = 'sanshao520', password = 'hzj9154976@'

// 图片路径
// http://cpquery.sipo.gov.cn/freeze.main?txn-code=createImgServlet&freshStept=1&now=Wed%20Feb%2003%202021%2017:42:50%20GMT+0800%20(%E4%B8%AD%E5%9B%BD%E6%A0%87%E5%87%86%E6%97%B6%E9%97%B4)
// http://cpquery.sipo.gov.cn/freeze.main?txn-code=createImgServlet&freshStept=1

/**
 * 上传信息同时获取结果
 * @param {string} username 联众用户名
 * @param {string} password 联众密码
 * @param {string} captchaData 图片base64内容
 * @param {string} captchaType 图片识别类型,由联众平台分配，请查阅联众网站价格页面 1201:根据计算公式返回计算结果
 */


export function getRecognition(captchaData, captchaType=1201) {
  let params = {
    softwareId,
    softwareSecret,
    username,
    password,
    captchaData,
    captchaType: 1201
  }
  return api.post('https://v2-api.jsdama.com/upload', params).then(res => {
    const { data: { recognition } } = res
    console.log('打码结果', res)
    return recognition
  }).catch(error => {
    throw error
  })
}

/**
 * 查看可用点数
 * @param {string} _username 联众用户名
 * @param {string} _password 联众密码
 */
export function checkpoints(_username, _password) {
  let params = {
    username,
    password
  }
  api.post('https://v2-api.jsdama.com/check-points', params).then(res => {
    const { data: { recognition } } = res
    return recognition
  }).catch(error => {
    throw error
  })
}

// base64

