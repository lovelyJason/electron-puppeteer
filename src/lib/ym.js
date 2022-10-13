var axios = require('axios');
var instance = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
})
//识别类型

//数英汉字识别类型 对于参量里的type 参数,请使用者自行修改对应类型
//  # 数英汉字类型
//  # 通用数英1-4位 10110
//  # 通用数英5-8位 10111
//  # 通用数英9~11位 10112
//  # 通用数英12位及以上 10113
//  # 通用数英1~6位plus 10103 该类型识别率较高
//  # 定制-数英5位~qcs 9001
//  # 定制-纯数字4位 193
//  # 中文类型
//  # 通用中文字符1~2位 10114
//  # 通用中文字符 3~5位 10115
//  # 通用中文字符6~8位 10116
//  # 通用中文字符9位及以上 10117
//  # 定制-XX西游苦行中文字符 10107
//  # 计算类型
//  # 通用数字计算题 50100
//  # 通用中文计算题 50101
//  ## 定制-计算题 cni 452

// # 通用任意点选1~4个坐标 30009, 具体参数需要根据具体类型修改,点选具体类型某些需要 extra参数,请使用者自行修改对应类型
// #   # 通用文字点选1(extra,点选文字逗号隔开,原图) 30100
// #   # 定制-文字点选2(extra="click",原图) 30103
// #   # 定制-单图文字点选 30102
// #   # 定制-图标点选1(原图) 30104
// #   # 定制-图标点选2(原图,extra="icon") 30105
// #   # 定制-语序点选1(原图,extra="phrase") 30106
// #   # 定制-语序点选2(原图) 30107
// #  # 定制-空间推理点选1(原图,extra="请点击xxx") 30109
// #  # 定制-空间推理点选1(原图,extra="请_点击_小尺寸绿色物体。") 30110
// #   # 定制-tx空间点选(extra="请点击侧对着你的字母") 50009
// #   # 定制-tt_空间点选 30101
// #  # 定制-推理拼图1(原图,extra="交换2个图块") 30108
// #  # 定制-xy4九宫格点选(原图,label_image,image) 30008
const token = "SmKn9hdMWOKbE7mNnwQcKWQkB3Te/vGU/LgiNOGhq8U"

function getRecognition(captchaData, captchaType="10110") {
  var data = JSON.stringify({
    token,
    type: captchaType,
    image: captchaData
  });
  var config = {
    method: 'post',
    url: 'https://www.jfbym.com/api/YmServer/customApi',
    data: data
  };
  return instance(config).then(res => {
    let data = res.data
    return data
  })
}

function getUserInfo() {
  var data = JSON.stringify({
    token,
    type: "score"
  });
  var config = {
    method: 'post',
    url: 'https://www.jfbym.com/api/YmServer/getUserInfoApi',
    data: data
  };
  return instance(config).then(res => {
    let data = res.data
    return data
  })
}

module.exports = {
  getRecognition,
  getUserInfo
}
