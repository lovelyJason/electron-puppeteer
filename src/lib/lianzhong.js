import api from './api'

const softwareId = 4736, softwareSecret

/**
 * 上传信息同时获取结果
 * @param {string} username 联众用户名
 * @param {string} password 联众密码
 * @param {string} captchaData 图片base64内容
 * @param {string} captchaType 图片识别类型,由联众平台分配，请查阅联众网站价格页面 1201:根据计算公式返回计算结果
 */


export function getRecognition(username, password, captchaData, captchaType) {
  let params = {
    softwareId,
    softwareSecret,
    username,
    password,
    captchaData,
    captchaType
  }
  api.post('https://v2-api.jsdama.com/upload', params).then(res => {
    const { data: { recognition } } = res
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
