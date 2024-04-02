'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
// import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { login } from './puppeteer/index.js'
import { interval, timeout, getImgBase64Data } from './utils'
import Update from './checkupdate'; // 引入上面的文件
import dayjs from 'dayjs'
import AdvancedFormat from 'dayjs/plugin/IsSameOrAfter'
import axios from 'axios'
// import run from './utils/run'
// import api from '@/lib/api'
// require('@electron/remote/main').initialize()      // electron 10.0以下版本不兼容
import { Window } from './windows.js'

const { name } = require('../package.json')
const { exec } = require('child_process');
// const https = require('https');
const { machineIdSync } = require('node-machine-id');
const fs = require('fs')
const puppeteer = require("puppeteer");
const os = require("os");
const Store = require('electron-store');
// on Linux: ~/.config/{app name}/logs/{process type}.log
// on macOS: ~/Library/Logs/{app name}/{process type}.log
// on Windows: %USERPROFILE%\AppData\Roaming\{app name}\logs\{process type}.log
const log = require('electron-log')
const path = require('path')
const { intercept, patterns } = require('puppeteer-interceptor');
const schedule = require("node-schedule");
// var Mutex = require('async-mutex').Mutex;
const Semaphore = require('async-mutex').Semaphore;
const cheerio = require('cheerio')
const { getUserInfo, getRecognition } = require('./lib/ym')
const https = require('follow-redirects').https;
var advancedFormat = require('dayjs/plugin/advancedFormat')
var isToday = require('dayjs/plugin/isToday')

dayjs.extend(AdvancedFormat)
dayjs.extend(isToday)
// console.log(dayjs('2022-08-26').isSameOrAfter(dayjs(dayjs().format('YYYY-MM-DD'))))

let window = new Window()

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});
const store = new Store();
const semaphore  = new Semaphore(2);
const CancelToken = axios.CancelToken;

log.transports.console.level = false;
log.transports.console.level = 'silly';
axios.defaults.headers['Connection'] = 'keep-alive'

// const isDev = require('electron-is-dev');

const isDevelopment = process.env.NODE_ENV !== 'production'
let win, browser, page, lastPage, pageJumpCount = 0
let submit_cookie = ''
let executionParams = {
  executionFrequency: 500,
  limit: 5,
  model: 2,
  successLimit: 5
}
let executionSuccessCount = 0
let subscribeSuccessCount = 0
let formDataList = []
let webPageTimerId = null
let has_auth = false
let whiteList = [{ ip: '127.0.0.1' }]
let requestCancelFns = []
let release = void(0)

// let rule = new schedule.RecurrenceRule();
// 毫秒无效， 当秒间隔时间加上当前时间大于60的时候不会生效
// let job = schedule.scheduleJob('59/0.3 * * * * *', async function () {
//   console.log(dayjs().format('HH:mm:ss'))
// })

// console.log(isDev)

// 错误码,-100: 获取chrome路径失败;-200: 查询失败

store.set('unicorn', '🦄');
// store.set('users', [
//   // { username: '566', password: ' 666*' },
//   // { username: '666', password: '666!' },
// ])

global.browserPath = store.get('browserPath')
global.orderData = []
global.orderSubmitTime = ''
// global.taskTimerId = null
global.taskTimerIds = []
global.balanceNum = 0

const STORE_PATH = app.getPath('userData')
console.log('用户目录', STORE_PATH)
global.LOG_PATH = process.platform !== 'darwin' ? path.resolve(STORE_PATH, './logs') : `~/Library/Logs/${name}`
// console.log(global.LOG_PATH)
global.STORE_PATH = STORE_PATH
global.CONFIG_PATH = path.resolve(STORE_PATH, './config.json')
global.machineId = machineIdSync()    // e40c2e6224c173ffb4a8b332c49d4527cbd91e3b1d0f56c22b71dd1627d4f31d
global.ip = '127.0.0.1'
global.inWhitelist = false
global.ym_score = 0


async function getYmScore() {
  try {
    let data = await getUserInfo()
    console.log('ym-data', data)
    let { score } = data.data
    global.ym_score = score
    return score
  } catch (error) {
  }
}
getYmScore()

;(async function() {
  try {
    let res = await axios.get('https://qdovo.com/api/patent/user/whitelist')
    whiteList = res.data.data
    let res1 = await axios.get('https://ifconfig.me/ip')
    let ip = res1 ? res1.data : '127.0.0.1'
    global.ip = ip
    global.inWhitelist = (ip === '127.0.0.1' || whiteList.some(val => {
      return val.ip === ip
    }))
  } catch (error) {
    global.ip = '127.0.0.1'
    global.inWhitelist = true
  }
}());

async function getHistory () {
  var config = {
    method: 'get',
    url: 'https://zlys.jsipp.cn/auth/patent/getAppointHistoryPageData?appId=yushen&pageNo=1&pageSize=10',
    headers: {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Connection': 'keep-alive',
      'Cookie': (global.browser && global.lastPage) ? submit_cookie : store.get('cookies'),
      'Referer': 'https://zlys.jsipp.cn/auth/patent/getAppointHistoryPage?appId=yushen',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    }
  };

  return axios(config)
  .then(function (response) {
    return response.data
  })
  .catch(function (error) {
    return error
  });

}

;(async function() {
  await checkMachineAuth()
}());
async function checkMachineAuth() {
  try {
    let res = await axios.get('https://qdovo.com/api/patent/user/list')
    let codeList = res.data.data
    global.machineIdList = codeList
    has_auth = codeList.some(val => {
      return val.id === global.machineId
    })
  } catch (error) {
    has_auth = false
    throw error
  }
  win.webContents.send('checkAuth', has_auth)
}
let checkAuthJob = schedule.scheduleJob('00 58 10 * * *', async function () {
  await checkMachineAuth()
})
let webPageJob = null
// console.log(22222) // 此处先于上面执行

// log.error('Hello, log error');
// log.warn('Hello, log warn');
// log.info('Hello, log info');
// log.verbose('Hello, log verbose');
// log.debug('Hello, log debug');
// log.silly('Hello, log silly');
// log.info('中文');

const osType = checkOperatingSystem(os.type())

console.log(osType)

function formatCookies(cookies) {
  let list = []
  cookies.forEach(val => {
    list.push(`${val.name}=${val.value}`)
  })
  return list.join('; ')
}

function checkOperatingSystem(type) {
  switch (type) {
    case "Windows_NT":
      return "windows";
    case "Darwin":
      return "darwin";
    case "Linux":
      return linux;
    default:
      return "windows";
  }
}
function getLocalAreaNetworkIPAdress() {
  var interfaces = os.networkInterfaces();
  for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
          var alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              return alias.address;
          }
      }
  }
}
function requestVcode() {
  return new Promise((resolve) => {
    var options = {
      'method': 'GET',
      'hostname': 'zlys.jsipp.cn',
      'path': '/toPage/vcode?rand=' + new Date().getMilliseconds(),
      'headers': {
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'Cookie': (global.browser && global.lastPage) ? submit_cookie : store.get('cookies'),
        'Referer': 'https://zlys.jsipp.cn/auth/patent/general/toAppointmentPage?appId=yushen',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      },
      'maxRedirects': 20
    };

    var req = https.request(options, function (res) {
      var chunks = []
      var size = 0
      res.on('data', function (chunk) {
        chunks.push(chunk)
        size += chunk.length
      })
      res.on('end', function (chunk) {
        var data = Buffer.concat(chunks, size);
        var base64Img = data.toString('base64')
        resolve(base64Img)
      })

      res.on("error", function (error) {
        console.error('请求验证码出错', error)
        reject(error)
      })
    })

    req.end()

  })
}
// 省局生成验证码的逻辑
// function setVcode(){
//   $("#vcode .sendout").attr("src","/toPage/vcode?rand="+new Date().getMilliseconds());
// }
async function submitFormSerially() {
  for(let order = 1;order <= executionParams.limit;order++) {
    let data = formDataList[0]
    if(!data) {
      win.webContents.send('log', '当前所有单据均已预约成功，提前终止任务...')
      break
    }
    if(executionParams.successLimit === subscribeSuccessCount) {
      win.webContents.send('log', '已达到预约成功上限，终止任务...')
      break
    }
    let code

    let base64Data = await requestVcode()
    let codeRes = await getRecognition(base64Data) // {"msg":"识别成功","code":10000,"data":{"code":0,"data":"9033","time":0.010438203811645508,"unique_code":"ammu43nCeFgF4KuHE+TYYcKYpnqhp0BddZxqxBszors"}}
    code = codeRes.data && codeRes.data.data
    console.log('打码结果', code)
    if(!code) {
      win.webContents.send('log', '图片验证码识别失败')
      continue
    }

    formDataList.push(formDataList.shift())
    let body = Object.assign(data, { code })
    let config = {
      method: 'post',
      url: 'https://zlys.jsipp.cn/auth/patent/general/appoint/general',
      headers: {
        'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://zlys.jsipp.cn/auth/patent/general/toAppointmentPage?appId=yushen',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua-platform': '"Windows"',
        'token_2': 'token_2_2',
        'Cookie': (global.browser && global.lastPage) ? submit_cookie : store.get('cookies')
      },
      data: body,
      cancelToken: new CancelToken(function executor(c) {
        requestCancelFns.push(c)
      })
    }
    // config = {
    //   method: 'get',
    //   url: 'http://127.0.0.1:3000/api/test',
    //   cancelToken: new CancelToken(function executor(c) {
    //     requestCancelFns.push(c)
    //   })
    // }
    try {
      console.log('当前请求参数', body)
      let response = await instance(config)
      log.info('接口调用成功', JSON.stringify(response.data));
      const { code } = response.data
      executionSuccessCount++
      win.webContents.send('log', '第' + order + '次执行：' + dayjs().format('HH:mm:ss') + '：' + JSON.stringify(response.data))
      if(code === 0) {
        console.log('data.patentName:', data ? data.patentName : '')
        subscribeSuccessCount++
        win.webContents.send('message', {
          type: 'success',
          message: '恭喜您，预约成功 --- ' + dayjs().format('HH:mm:ss')
        })
        // 把队列末尾的项删除，防止重复, 此时如果所有案子全部预约成功，但是任务如果还在执行，data为undefined
        formDataList.pop()
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('request abort')
        return
      }
      log.error('接口调用错误', error.message);  // 404，504， 如果回应时间较长，可能长时间没有回应，但是定时器执行多次
      win.webContents.send('log', dayjs().format('HH:mm:ss') + '：' + error.message)
      if(error.message && error.message.includes('404')) {
        throw error   // 抛错会导致省局报错没后续了
      } else {
      }
    } finally {
      let score = await getYmScore()
      win.webContents.send('setClientData', { key: 'score', value: score })
    }
  }
  log.info(`本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，其中预约成功数量${subscribeSuccessCount}条,操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
  win.webContents.send('log', `本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，<span style="color: #fc5531;">其中预约成功数量${subscribeSuccessCount}条</span>, 操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
  return true
}

function submitForm(timerId, order, close) {
  return new Promise(async (resolve, reject) => {
    // 要放置在打码开头，否则打码也会耗时导致定时器走多次；并且不能中断请求，因为尚在请求中的也在次数之内
    if(order > executionParams.limit) {
      close()
      clearTask(false)
      return resolve(0)
    }
    let data = formDataList[0]
    if(!data) {
      win.webContents.send('log', '当前所有单据均已预约成功，提前终止任务...')
      log.info(`本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，其中预约成功数量${subscribeSuccessCount}条，操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
      win.webContents.send('log', `本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，<span style="color: #fc5531;">其中预约成功数量${subscribeSuccessCount}条</span>, 操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
      close()
      clearTask()
      return resolve(0)
    }
    if(executionParams.successLimit === subscribeSuccessCount) {
      win.webContents.send('log', '已达到预约成功上限，终止任务...')
      log.info(`本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，其中预约成功数量${subscribeSuccessCount}条，操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
      win.webContents.send('log', `本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，<span style="color: #fc5531;">其中预约成功数量${subscribeSuccessCount}条</span>, 操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
      close()
      clearTask()
      return resolve(0)
    }
    // 读取验证码 https://zlys.jsipp.cn/toPage/vcode?rand=837
    // let base64Data = await getImgBase64Data(codeUrl) // 这么直接的好像省局不通过，应该是与头部信息有关

    let code

    let base64Data = await requestVcode()
    let codeRes = await getRecognition(base64Data) // {"msg":"识别成功","code":10000,"data":{"code":0,"data":"9033","time":0.010438203811645508,"unique_code":"ammu43nCeFgF4KuHE+TYYcKYpnqhp0BddZxqxBszors"}}
    code = codeRes.data && codeRes.data.data
    console.log('打码结果', code)
    if(!code) {
      win.webContents.send('log', '图片验证码识别失败')
      return resolve(0)
    }

    let body = Object.assign(data, { code })
    let config = {
      method: 'post',
      url: 'https://zlys.jsipp.cn/auth/patent/general/appoint/general',
      headers: {
        'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
        'sec-ch-ua-mobile': '?0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://zlys.jsipp.cn/auth/patent/general/toAppointmentPage?appId=yushen',
        'X-Requested-With': 'XMLHttpRequest',
        'sec-ch-ua-platform': '"Windows"',
        'token_2': 'token_2_2',
        'Cookie': (global.browser && global.lastPage) ? submit_cookie : store.get('cookies')
      },
      data: body,
      cancelToken: new CancelToken(function executor(c) {
        requestCancelFns.push(c)
      })
    }
    // config = {
    //   method: 'get',
    //   url: 'http://127.0.0.1:3000/api/test',
    //   cancelToken: new CancelToken(function executor(c) {
    //     requestCancelFns.push(c)
    //   })
    // }
    formDataList.push(formDataList.shift())

    console.log('当前请求参数', body)
    instance(config)
     .then(function (response) {
        //  {"msg":"请选择预约日期!!","code":-1,"success":false}
        log.info('接口调用成功', JSON.stringify(response.data));
        win.webContents.send('log', '第' + order + '次执行：' + dayjs().format('HH:mm:ss') + '：' + JSON.stringify(response.data))
        const { code } = response.data
        // curExecutionCount++   // 此处问题是如果接口越慢，然后频率给的低的时候，此处定时器已经会走了很多回
        executionSuccessCount++
        if(code == 0) {  // 提交成功
          console.log('data.patentName:', data ? data.patentName : '')
          subscribeSuccessCount++
          win.webContents.send('message', {
            type: 'success',
            message: '恭喜您，预约成功 --- ' + dayjs().format('HH:mm:ss')
          })
          // 此处因为是并发执行，如果请求已经发送出去了，此时的删除不起作用
          formDataList.pop()
        }
      }).catch(function (error) {
        // curExecutionCount++
        if (axios.isCancel(error)) {

        } else {
          if(error.message) {
            log.error('接口调用错误', error.message);  // 404，504， 如果回应时间较长，可能长时间没有回应，但是定时器执行多次
            win.webContents.send('log', dayjs().format('HH:mm:ss') + '：' + error.message)
            if(error.message.includes('404')) {
              reject(error)
            }
          }
        }
     }).finally(async () => {
       if(order >= executionParams.limit) {
         log.info(`本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，其中预约成功数量${subscribeSuccessCount}条，操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
         win.webContents.send('log', `本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，<span style="color: #fc5531;">其中预约成功数量${subscribeSuccessCount}条</span>, 操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
         resolve(2)
        } else {
          resolve(0)
        }

     })

  })

}


// 渲染进程调用会报错Cannot find module './puppeteer' Require stack:
// var myPuppeteer = require('./puppeteer')
// console.log(myPuppeteer)

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

function getChromeDefaultPath() {
  return new Promise((resolve, reject) => {
    if (global.browserPath) {
      fs.stat(global.browserPath, (err, stat) => {
        if (err) {
          win.webContents.send('errorHandle', { message: '你的路径下没有chrome', code: -100 })
          reject({
            ...err,
            code: -100
          })
        } else {
          resolve(global.browserPath)
        }

      })
    } else {
      fs.stat('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', (err1, stat) => {
        if (err1) {
          resolve('')     // 不能抛错,不然无法执行后续的chrome路径查找
        } else {
          resolve('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
        }
      })
    }

  })
}

function getChromiumExecPath(event) {
  return new Promise(async (resolve, reject) => {
    try {
      let defaultPath = await getChromeDefaultPath()
      if (isDevelopment) {
        if (osType === "windows") {
          resolve(defaultPath || path.resolve(
            process.cwd(),
            "./node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
          ))
        } else {
          resolve('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        }
      } else {
        if (osType === "windows") {
          resolve(defaultPath || puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'));
        } else {
          resolve('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        }
      }
    } catch (error) {
      event.returnValue = error
      throw error
    }

  })
}

// start puppeteer
async function loadPage(event, ans) {
  let chromeExecPath = await getChromiumExecPath(event)
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        // 不生效？
        width: 0,
        height: 0
      },
      ignoreDefaultArgs: ["--enable-automation"],
      executablePath:
        // '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        // isDevelopment
        // ? path.resolve(
        //   process.cwd(),
        //   "./node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
        // ) :
        chromeExecPath,
      args: [
        "--disable-blink-features=AutomationControlled",
        "--allow-running-insecure-content",
        "--disable-web-security",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--window-size=1280,1040"
      ]
    });
    global.browser = browser
    page = await browser.newPage();
    global.page = page
    await page.evaluateOnNewDocument(() => {
      // 在每个新页面打开前执行以下脚本
      const newProto = navigator.__proto__;
      delete newProto.webdriver; // 删除navigator.webdriver字段
      navigator.__proto__ = newProto;
      window.chrome = {}; // 添加window.chrome字段，为增加真实性还需向内部填充一些值
      window.chrome.app = {
        InstallState: "hehe",
        RunningState: "haha",
        getDetails: "xixi",
        getIsInstalled: "ohno"
      };
      window.chrome.csi = function () { };
      window.chrome.loadTimes = function () { };
      window.chrome.runtime = function () { };

      Object.defineProperty(navigator, "userAgent", {
        // userAgent在无头模式下有headless字样，所以需覆写
        get: () =>
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [
          {
            0: {
              type: "application/x-google-chrome-pdf",
              suffixes: "pdf",
              description: "Portable Document Format",
              enabledPlugin: Plugin
            },
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          },
          {
            0: {
              type: "application/pdf",
              suffixes: "pdf",
              description: "",
              enabledPlugin: Plugin
            },
            description: "",
            filename: "mhjfbmdgcfjbbpaeojofohoefgiehjai",
            length: 1,
            name: "Chrome PDF Viewer"
          },
          {
            0: {
              type: "application/x-nacl",
              suffixes: "",
              description: "Native Client Executable",
              enabledPlugin: Plugin
            },
            1: {
              type: "application/x-pnacl",
              suffixes: "",
              description: "Portable Native Client Executable",
              enabledPlugin: Plugin
            },
            description: "",
            filename: "internal-nacl-plugin",
            length: 2,
            name: "Native Client"
          }
        ]
      });
      Object.defineProperty(navigator, "languages", {
        // 添加语言
        get: () => ["zh-CN", "zh", "en"]
      });
      const originalQuery = window.navigator.permissions.query; // notification伪装
      window.navigator.permissions.query = parameters =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);

      // alert(navigator.webdriver)
      Object.defineProperties(navigator, {
        webdriver: { get: () => undefined }
      });
    });
    // event.reply('log', '启动成功------来自主进程，正在自动填写账号密码')
  } catch (error) {
    throw error;      // throw error不要同时和webContents.send同时存在,否则重复报错
  }
}
let initPageAndLogin = async (page, event, ans) => {
  try {
    await page.goto("https://ip.jsipp.cn/");
    await page.waitForTimeout(1000)
    await page.waitForSelector('.nav-login')
    const loginBtn = await page.$('.nav-login')
    await loginBtn.click() // 登录按钮
    // await browser.close()
    // win.webContents.send('errorHandle', '呵呵哒')      // ipcMain没有send方法,使用win的属性webContents调用send,该属性负责渲染和控制web页面
    // await page.evaluate(() => {
    //   alert(1)
    // })
    await login(page, ans) // 弹框登录按钮
    // await page.waitForTimeout(1000)
    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    // run(page)
    // event.reply('log', '请手动滑动验证码，目前无法帮您自动完成')
  } catch (error) {
    throw error;
  }
}

async function verifyCode() {
  const url = 'http://cpquery.sipo.gov.cn/freeze.main?txn-code=createImgServlet&freshStept=1'
  let base64data = await getImgBase64Data(url)
  return base64data
}
const configPage = async (page) => {
  await page.setViewport({ width: 1280, height: 1040 });
}

// 这个方法绝了
async function shot(page, imgSelector, type = "png", ifAddPrefix) {
  // 先创建并绘制canvas。
  let canvasId = await page.evaluate(function (select) {
    let target = document.querySelector(select);
    if (!target) {
      throw new Error("未找到选择器：" + select);
    }
    if (target.tagName.toLowerCase() !== "img") {
      throw new Error("本截图只支持命中img节点的选择器，请重新设定选择器。");
    }
    let id = "ca_" + String(Math.random()).split(".")[1];
    let width = target.clientWidth;
    let height = target.clientHeight;
    /**
     * @type {HTMLCanvasElement}
     */
    let canvasElement = document.createElement("canvas");
    canvasElement.style.position = "fixed";
    canvasElement.style.zIndex = "999999";
    canvasElement.style.top = "0";
    canvasElement.style.left = "0";
    canvasElement.style.width = width + "px";
    canvasElement.style.height = height + "px";
    canvasElement.id = id;
    document.body.append(canvasElement);
    canvasElement.style.display = "block";
    canvasElement.width = width;
    canvasElement.height = height;
    /**
     * @type {CanvasRenderingContext2D}
     */
    let context = canvasElement.getContext("2d");
    // 绘制白色背景，有些验证码可能是透明背景。
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);
    context.drawImage(target, 0, 0, target['naturalWidth'], target['naturalHeight'], 0, 0, width, height);
    return id;
  }, imgSelector);
  /**
   * 添加并绘制好了之后，再截图绘制好了的canvas。
   * @type {Base64ScreenShotOptions}
   */
  let shotOption = { type: type, encoding: "base64" };
  let element = await page.$(`#${canvasId}`);
  shotOption.clip = await element.boundingBox();
  let base64 = await page.screenshot(shotOption);
  if (isDevelopment) {
    fs.writeFile('./base64.txt', base64, 'utf-8', (error) => {
    })
  }
  let result = ifAddPrefix ? "data:image/" + type + ";base64," + base64.toString() : base64.toString();
  // 图截好了，把这个canvas移除。
  await page.$eval(`#${canvasId}`, function (element) {
    element.remove();
  });
  return result;
}

const loginCheck = async () => {
  let page = global.page
  await page.evaluate(() => {
   return document.querySelector('.navContent-loginUser') && document.querySelector('.navContent-loginUser').innerHTML
 })
 // 这里如果不return， 那么一直会是undefined， 虽然是会阻塞执行，但没有返回值
 return 1
}

if (!isDevelopment) {
  Menu.setApplicationMenu(null)
}
// electron 从渲染进程访问主进程除ipc外可以使用remote，从主进程渲染进程使用webContents. executeJavascript 在页面执行脚本，如果是puppeteer,page本身也提供访问页面元素的api

function validateForm() {
  return new Promise(async (resolve, reject) => {
    try {
      let lastPage = global.lastPage
      if(!lastPage) {
        win.webContents.send('log', '检测到页面已经关闭')
        resolve(1)
        return
      }
      // 抓取网页端数据回填
      fetchDataFromPage()
      let res = await Promise.all([
        lastPage.$eval('.layui-form .layui-form-item:nth-child(1) input[name="patentName"]', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(2) input[type="text"]', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(3) input[name="appointPhone"]', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(5) input', el => el.value),
        lastPage.$eval('.layui-form input[id="applyClassifyCode"]', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(7) input[id="orderSubmitTime"]', el => el.value)
      ])
      let [patentName, applyCompanyId, appointPhone, typeCode, applyClassifyCode] = res
      // if(patentName) {
      //   win.webContents.send('get-form', {
      //     patentName
      //   })
      // }
      // if(applyCompanyId) {
      //   win.webContents.send('get-form', {
      //     applyCompanyId
      //   })
      // }
      // if(appointPhone) {
      //   win.webContents.send('get-form', {
      //     appointPhone
      //   })
      // }
      // if(typeCode) {
      //   win.webContents.send('get-form', {
      //     typeCode
      //   })
      // }
      // if(applyClassifyCode) {
      //   win.webContents.send('get-form', {
      //     applyClassifyCode
      //   })
      // }
      if(patentName && applyCompanyId && appointPhone && typeCode && applyClassifyCode) {
        resolve(1)
      } else {
        resolve(0)
      }
    } catch (error) {
      win.webContents.send('log', '检测到本页面某些元素丢失，可能更改了页面结构（不影响客户端操作）' + error.message)
      reject(error)
    }

  })
}
function interceptOrderData() {
  // {num: 0, typeCode: "1", balanceNum: 0, sendDay: "2022-08-01", usedNum: 0}
  // post
  // {"patentName":"5666","appId":"yushen","applyFieldId":"3887f4dbf7fe4097903ce8055ba24496","applyFieldCode":"2","applyFieldName":"新型功能和结构材料","applyCompanyId":"aba8a1af48dc423cb74b98ee2766ac31","appointPhone":"13951101409","typeCode":"1","applyClassifyCode":"C23F","orderSubmitTime":"2022-08-25","typeText":"发明","applyCompanyName":"江苏瑞耀纤维科技有限公司"}
  let lastPage = global.lastPage
  intercept(lastPage, patterns.XHR('*getCalendarMargin*'), {
    // 失败的canceled拦截不到
    onResponseReceived: event => {
      let data = JSON.parse(event.response.body).data
      if(global.balanceNum > 0) {
        data.forEach(val => {
          if(dayjs(val.sendDay).isSameOrAfter(dayjs(dayjs().format('YYYY-MM-DD')))) {
            val.balanceNum = global.balanceNum
          }
        })
      }
      global.orderData = data
      data.some(val => {
        if(val.balanceNum > 0) {
          global.orderSubmitTime = val.sendDay
          return true
        }
      })
      let body = Object.assign({
        msg: 'success',
        code: 0,
        success: true
      }, { data })
      let content = JSON.stringify(body)
      event.response.body = content
      return event.response
      // XXX:其他有地方没有resolve或reject导致处于pennding
    },
    // 失败的canceled拦截不到
    onInterception: (event, obj) => {
    }
  })
  intercept(lastPage, patterns.XHR('*general'), {
    onResponseReceived: event => {
    let lastPage = global.lastPage
      let data = JSON.parse(event.response.body).data
      log.info('提交预约的接口返回值：', data)
      let { code } = data
      if(code === 0) {
        clearInterval(webPageTimerId)
        lastPage.close()
      }
      return event.response
    }
  })

}
function setOrderTime() {
  return new Promise(async (resolve, reject) => {
    try {
      let lastPage = global.lastPage
      let orderSubmitTime = global.orderSubmitTime
      if(orderSubmitTime) {
        // lastPage.evaluate(() => {
        //   document.querySelector('#orderSubmitTime').value = orderSubmitTime
        // })
        // lastPage.$eval('input[name=orderSubmitTime]', el => el.value = orderSubmitTime.toString())
        await lastPage.focus('#orderSubmitTime')
        await lastPage.keyboard.type(orderSubmitTime)
        let submitBtn = await lastPage.$('#onSubmit')
        win.webContents.send('log', '发现有余量可选，已为您提交，本次任务完成, 请为作者点颗小红心❤')
        await submitBtn.click()
        resolve(1)
        return
      } else {
        await lastPage.waitForSelector('.layui-btn[onclick="cardNumber()"]', { visible: true })
        let selectTimeButton = await lastPage.$('.layui-btn[onclick="cardNumber()"]')
        // await selectTimeButton.click() // 点击是为了调用接口，重新拦截
        await lastPage.evaluate((element) => {
          element.click()
        }, selectTimeButton)
        await lastPage.waitForSelector('.layui-layer-btn1', { visible: true })
        let closeTimeModalButton = await lastPage.$('.layui-layer-btn1')
        // let closeTimeModalIcon = await lastPage.$('.layui-layer-close1')
        await timeout(300)
        // 貌似是请求过快会导致请求失败查不到数据从而弹框没有关闭
        // await closeTimeModalButton.click()
        // await lastPage.evaluate((element) => {
        //   element.click()
        // }, closeTimeModalButton)
        await lastPage.evaluate(() => {
          Array.from(document.querySelectorAll('.layui-layer-close1')).forEach(item => {
            item.click()
          })
        })
        resolve(0)
      }
    } catch (error) {
      win.webContents.send('log', '系统出错了，请重新恢复执行' + error.message)
      reject(error)
    }
  })
}
function getApplyClassifyHtml(cookies) {
  var config = {
    method: 'get',
    url: 'https://zlys.jsipp.cn/auth/patent/common/classificationCaseData?appId=yushen&typeCode=1&applyFieldCode=&code=',
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Connection': 'keep-alive',
      'Cookie': cookies,
      'Referer': 'https://zlys.jsipp.cn/auth/patent/classifyPage?typeCode=1',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
      'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    }
  };

  return axios(config)
  .then(function (response) {
    return response.data
  })
  .catch(function (error) {
    return error
  });


}
async function fetchDataFromPage(cookies) {
  let lastPage = global.lastPage
  let formHtml = await lastPage.$eval('.layui-form', el => el.innerHTML)
  // console.log(111, await page.$('select[name="applyCompanyId"]'))  // 企业账号此字段为null
  const $ = cheerio.load(formHtml, { ignoreWhitespace: true, });
  let applyCompanySelect = $('select[name="applyCompanyId"]')
  let companyList = []
  console.log(applyCompanySelect, '------')
  if(applyCompanySelect) {
    companyList = $('select[name="applyCompanyId"] option').map(function() {
      return {
        label: $(this).text().trim(),
        value: $(this).attr('value')
      }
    }).toArray()
  } else {
    companyList.push({
      label: $('input[name="applyCompanyName"]').attr('value'),
      value: $('input[name="applyCompanyId"]').attr('value')
    })
  }
  console.log(companyList, 'companyList')
  // console.log(companyList)
  let typeList = $('select[name="typeCode"] option').map(function() {
    return {
      label: $(this).text().trim(),
      value: $(this).attr('value')
    }
  }).toArray().filter(val => val.value)

  win.webContents.send('setSelectList', {
    companyList,
    typeList
  })
}
async function fetchApplyClassify(cookies) {
  let applyClassifyList = []
  let applyClassifyHtml = await getApplyClassifyHtml(cookies)
  if(applyClassifyHtml) {
    const $1 = cheerio.load(applyClassifyHtml, { ignoreWhitespace: true })
    applyClassifyList = $1('input[type="radio"]').map(function() {
      return {
        label: $1(this).attr('vname'),
        value: $1(this).attr('value')
      }
    }).toArray()
  }
  // console.log('applyClassifyList', applyClassifyList)
  win.webContents.send('setSelectList', {
    applyClassifyList
  })
}
/*
S = "{"project":"ZLYSXT","moduleId":"quick"}"
S = o.LZString.compressToBase64(S)
*/
const t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
let o = {
  LZString: {
    compressToBase64: function(r) {
      if (null == r)
          return "";
      var n = o.LZString._compress(r, 6, function(r) {
          return t.charAt(r)
      });
      switch (n.length % 4) {
      default:
      case 0:
          return n;
      case 1:
          return n + "===";
      case 2:
          return n + "==";
      case 3:
          return n + "="
      }
    },
    _compress: function(r, o, n) {
      if (null == r)
          return "";
      var t, e, i, s = {}, p = {}, c = "", u = "", a = "", l = 2, f = 3, h = 2, d = [], m = 0, g = 0;
      for (i = 0; i < r.length; i += 1)
          if (c = r.charAt(i),
          Object.prototype.hasOwnProperty.call(s, c) || (s[c] = f++,
          p[c] = !0),
          u = a + c,
          Object.prototype.hasOwnProperty.call(s, u))
              a = u;
          else {
              if (Object.prototype.hasOwnProperty.call(p, a)) {
                  if (a.charCodeAt(0) < 256) {
                      for (t = 0; t < h; t++)
                          m <<= 1,
                          g == o - 1 ? (g = 0,
                          d.push(n(m)),
                          m = 0) : g++;
                      for (e = a.charCodeAt(0),
                      t = 0; t < 8; t++)
                          m = m << 1 | 1 & e,
                          g == o - 1 ? (g = 0,
                          d.push(n(m)),
                          m = 0) : g++,
                          e >>= 1
                  } else {
                      for (e = 1,
                      t = 0; t < h; t++)
                          m = m << 1 | e,
                          g == o - 1 ? (g = 0,
                          d.push(n(m)),
                          m = 0) : g++,
                          e = 0;
                      for (e = a.charCodeAt(0),
                      t = 0; t < 16; t++)
                          m = m << 1 | 1 & e,
                          g == o - 1 ? (g = 0,
                          d.push(n(m)),
                          m = 0) : g++,
                          e >>= 1
                  }
                  0 == --l && (l = Math.pow(2, h),
                  h++),
                  delete p[a]
              } else
                  for (e = s[a],
                  t = 0; t < h; t++)
                      m = m << 1 | 1 & e,
                      g == o - 1 ? (g = 0,
                      d.push(n(m)),
                      m = 0) : g++,
                      e >>= 1;
              0 == --l && (l = Math.pow(2, h),
              h++),
              s[u] = f++,
              a = String(c)
          }
      if ("" !== a) {
          if (Object.prototype.hasOwnProperty.call(p, a)) {
              if (a.charCodeAt(0) < 256) {
                  for (t = 0; t < h; t++)
                      m <<= 1,
                      g == o - 1 ? (g = 0,
                      d.push(n(m)),
                      m = 0) : g++;
                  for (e = a.charCodeAt(0),
                  t = 0; t < 8; t++)
                      m = m << 1 | 1 & e,
                      g == o - 1 ? (g = 0,
                      d.push(n(m)),
                      m = 0) : g++,
                      e >>= 1
              } else {
                  for (e = 1,
                  t = 0; t < h; t++)
                      m = m << 1 | e,
                      g == o - 1 ? (g = 0,
                      d.push(n(m)),
                      m = 0) : g++,
                      e = 0;
                  for (e = a.charCodeAt(0),
                  t = 0; t < 16; t++)
                      m = m << 1 | 1 & e,
                      g == o - 1 ? (g = 0,
                      d.push(n(m)),
                      m = 0) : g++,
                      e >>= 1
              }
              0 == --l && (l = Math.pow(2, h),
              h++),
              delete p[a]
          } else
              for (e = s[a],
              t = 0; t < h; t++)
                  m = m << 1 | 1 & e,
                  g == o - 1 ? (g = 0,
                  d.push(n(m)),
                  m = 0) : g++,
                  e >>= 1;
          0 == --l && (l = Math.pow(2, h),
          h++)
      }
      for (e = 2,
      t = 0; t < h; t++)
          m = m << 1 | 1 & e,
          g == o - 1 ? (g = 0,
          d.push(n(m)),
          m = 0) : g++,
          e >>= 1;
      for (; ; ) {
          if (m <<= 1,
          g == o - 1) {
              d.push(n(m));
              break
          }
          g++
      }
      return d.join("")
    }
  }
}


function getSSOLoignUrl(cookies) {
  // var data = 'N4IgDgTg9gVgpgYwC4gFwgFoBkCaBlADQBUQAaEAWygBMBXAGzgElq0QBHWgSwQGsQAvkA==';
  var data = o.LZString.compressToBase64('{"project":"ZLYSXT","moduleId":"quick"}')
  console.log('加密数据', data)
  var config = {
    method: 'post',
    url: 'https://ip.jsipp.cn/ZSCQ/app/zscq.app/action/ssoServer.action?method=getSSOLoginUrl',
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'zh-CN,zh;q=0.9',
      'Connection': 'keep-alive',
      'Content-type': 'application/json',
      'Cookie': cookies,
      'Referer': 'https://ip.jsipp.cn/ZSCQ/app/zscq.app/pages/patent.html',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.102 Safari/537.36',
      'X-Encrypt-Request': 'true',
      'X-Requested-With': 'XMLHttpRequest',
      'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"'
    },
    data: data
  };

  return axios(config)
  .then(function (response) {
    return response.data
  })
  .catch(function (error) {
    return error
  });

}

async function postTask(event, ans) {
  try {
    // 获取一个加密参数，目前看来是hardcode的
    //let res = await api.post('https://ip.jsipp.cn/ZSCQ/app/zscq.app/action/ssoServer.action?method=getSSOLoginUrl')
    let temp1 = await browser.newPage()
    await temp1.goto('https://ip.jsipp.cn/ZSCQ/app/zscq.app/pages/patent.html')
    let cookies1 = await temp1.cookies()
    cookies1 = formatCookies(cookies1)
    let res1 = await getSSOLoignUrl(cookies1)
    let login_key = res1.params && res1.params.login_key
    console.log('login_key', login_key)

    let url1 = 'https://zlys.jsipp.cn/toPage/auth/getYS' + '?login_key=' + login_key
    let url2 = 'https://zlys.jsipp.cn/auth/patent/general/toAppointmentPage?appId=yushen'
    let page1 = await browser.newPage()
    await page1.goto(url1)
    let lastPage = await browser.newPage()
    await lastPage.goto(url2)
    lastPage.evaluate(() => {
      layer.msg('页面已被安全接管，请返回客户端操作', {icon: 6, time: 6000});
    })
    // 在这之前 error Execution context was destroyed, most likely because of a navigatio
    win.webContents.send('log', '正在为您导航至最终页面，请自行填写除预约时间以外的表单信息，之后，本程序会开启定时任务自动为您提交；同时，您也可在本客户端直接开始提交，速度会更快')
    lastPage.on('close', () => {
      // win.webContents.send('closePage')
      global.lastPage = null
    })
    global.lastPage = lastPage
    let cookies = await lastPage.cookies()
    submit_cookie = formatCookies(cookies)
    store.set('cookies', submit_cookie)
    win.webContents.send('setCookies', submit_cookie)
    // store.set('cookies', cookies)
    // win.webContents.send('log', 'cookies抓取成功：' + JSON.stringify(cookies))
    await lastPage.waitForSelector('#onSubmit', { timeout: 3000 })

    fetchDataFromPage(submit_cookie)
    fetchApplyClassify(submit_cookie)
    let checkRes = await interval(validateForm, 10000, 100000)
    if(checkRes === 1) {
      // 要先点击按钮触发一次，否则此promise 出于pendding
      interceptOrderData()    // 拦截一次就够了, 如果await 由于没有拦截时内部没有reolve或reject导致处于pendding
      // await lastPage.waitForSelector('.layui-btn[onclick="cardNumber()"]', { visible: true })
      // let selectTimeButton = await lastPage.$('.layui-btn[onclick="cardNumber()"]')
      // // await selectTimeButton.click() // 点击是为了调用接口，重新拦截
      // await lastPage.evaluate((element) => {
      //   element.click()
      // }, selectTimeButton)
      // await lastPage.waitForSelector('.layui-layer-btn1', { visible: true })
      // let closeTimeModalButton = await lastPage.$('.layui-layer-btn1')
      // await timeout(300)
      // // await closeTimeModalButton.click()
      // await lastPage.evaluate((element) => {
      //   element.click()
      // }, closeTimeModalButton)
      // await timeout(500)
      // // 重复查询预约时间，有则提交
      // interval(setOrderTime, global.executionFrequency || 800, 0, function(timerId) {
      //   global.taskTimerId = timerId
      // })

      // 不如直接手输日期，等待倒计时提交
      let submitBtn = await lastPage.$('#onSubmit')
      webPageJob = schedule.scheduleJob('59 59 10 * * *', async function () {
        let count = 1
        webPageTimerId = setInterval(() => {
          if(count >= 5) {
            clearInterval(webPageTimerId)
            webPageJob.cancel()
          }
          count++
          submitBtn.click()
        }, 300)
      })
    }

  } catch (error) {
    throw error
  }
}
function clearTask(abortRequest=true) {
  if(typeof release === 'function') {
    release()
  }
  semaphore.setValue(2)
  if(abortRequest) {
    requestCancelFns.forEach(fn => {
      if(typeof fn === 'function') {
        fn()
      }
    })
  }
  if(executionParams.model === 2) {
    if(global.taskTimerIds && global.taskTimerIds.length) {
      global.taskTimerIds.forEach(taskTimerId => {
        clearInterval(taskTimerId)
      })
    }
    global.taskTimerIds = []
  } else {

  }
  requestCancelFns = []
  win.webContents.send('log', '当前队列所有任务已终止，如还有任务在排队中，可继续点击停止')
}
async function stopTask() {
  clearTask()
}
async function debug(event) {
  let lastPage = global.lastPage
  await lastPage.waitForSelector('.layui-btn[onclick="cardNumber()"]', { visible: true })
  let selectTimeButton = await lastPage.$('.layui-btn[onclick="cardNumber()"]')
  await selectTimeButton.click() // 点击是为了调用接口，重新拦截
  await lastPage.waitForSelector('.layui-layer-btn1', { visible: true })
  let closeTimeModalButton = await lastPage.$('.layui-layer-btn1')
  await timeout(300)
  await closeTimeModalButton.click()
}

async function createWindow() {
  // win = new BrowserWindow({
  //   width: 780,
  //   height: 760,
  //   resizable: false,
  //   icon: path.join(__static, "./icon64.ico"),
  //   webPreferences: {
  //     // Use pluginOptions.nodeIntegration, leave this alone
  //     // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
  //     nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
  //     enableRemoteModule: true
  //   }
  // })

  // if (process.env.WEBPACK_DEV_SERVER_URL) {     // http://localhost:8080/
  //   // Load the url of the dev server if in development mode
  //   await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
  //   if (!process.env.IS_TEST) win.webContents.openDevTools()
  // } else {
  //   createProtocol('app')
  //   // Load the index.html when not in development
  //   win.loadURL('app://./index.html')
  // }
  window.listen()
  window.createWindows({ isMainWin: true, width: 780, height: 760, fullscreenable: false})
  win = window.main

  // 注册更新检查
  Update(win, log);
  global.win = win
  win.webContents.send('setCookies', store.get('cookies'))

  ipcMain.on('getHistory', (async event => {
    try {
      let res = await getHistory()
      let list = res && res.data && res.data.list || []
      list = list.filter(val => {
        return dayjs(val.createTime).isToday()
      })
      event.reply('getHistoryReply', list)
    } catch (error) {

    }
  }))
  ipcMain.handle('openLog', (event) => {
    let cmd = ''
    if(process.platform !== 'darwin') {
      cmd = 'start ' + path.resolve(global.STORE_PATH, './logs/main.log')
    } else {
      console.log(1111)
      cmd = 'open ' + path.join(global.LOG_PATH, 'main.log')
    }
    exec(cmd)
    return true
  })
  ipcMain.handle('closeBrowser', (event, ans) => {
    if(global.browser && global.browser.close) {
      global.browser.close()
    }
  })
  ipcMain.handle('getStoreData', (event, ans) => {
    let list = []
    ans = ans || []
    ans.forEach(val => {
      list.push(store.get(val))
    })
    return list
  })
  ipcMain.handle('setStoreData', (event, ans) => {
    ans.forEach(val => {
      const { key, value } = val
      store.set(key, value)
    })
    return 'success'
  })
  ipcMain.handle('open-config', (event, ans) => {
    shell.openPath(global.CONFIG_PATH)
    return true
  })
  ipcMain.handle('delete-case', (event, ans) => {
    let index = ans
    let caseList = store.get('caseList')
    caseList.splice(index, 1)
    store.set('caseList', caseList)
    return true
  })
  ipcMain.handle('destroy', (event, ans) => {
    diableUser()
    return true
  })
  ipcMain.handle('set-execution-params', (event, ans) => {
    if (!has_auth) {
      return { code: -1, msg: '未经授权，禁止操作，请联系作者' }
    }
    // if(!global.inWhitelist) {
    //   return { code: -1, msg: '不在ip白名单中，禁止操作' }
    // }
    executionParams = ans
    return true
  })
  // 开始提交任务
  ipcMain.handle('submit', async (event, ans) => {
    // console.log(semaphore.isLocked())   // 终止程序可能会导致还在锁定
    const [value, releaseFn] = await semaphore.acquire()
    release = releaseFn
    try {
      if(!has_auth) {
        return { code: -1, msg: '未经授权，禁止操作，请联系作者' }
      }
      // if(!global.inWhitelist) {
      //   return { code: -1, msg: '不在ip白名单中，禁止操作' }
      // }

      formDataList = ans
      executionSuccessCount = 0
      subscribeSuccessCount = 0
      requestCancelFns = []
      global.taskTimerIds = []
      win.webContents.send('log', '任务执行中，如果下方没有输出日志，是因为还在提交中，请耐心等待......')
      // 并行执行
      if(executionParams.model === 2 || !executionParams.model) {
        let res = await interval((timerId, order, close) => {
          return submitForm(timerId, order, close)
        }, executionParams.executionFrequency || 800, executionParams.limit, function(timerId, count) {
          global.taskTimerIds.push(timerId)
          // curExecutionCount = count
        })
        // log.info(`本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，其中预约成功数量${subscribeSuccessCount}条，操作失败数量：${executionParams.limit - executionSuccessCount}\n`)
        // win.webContents.send('log', `本次任务${executionParams.limit}条，操作成功数量：${executionSuccessCount}，<span style="color: #fc5531;">其中预约成功数量${subscribeSuccessCount}条</span>, 操作失败数量：${executionParams.limit - executionSuccessCount}\n`)

        let score = await getYmScore()
        win.webContents.send('setClientData', { key: 'score', value: score })
        if(res === 1) {
          return { code: 0, msg: '本次任务操作完成' }
        } else {
          return { code: -1, msg: '超出调用次数限制，本次任务完成' }
        }
      } else {
        await submitFormSerially()
        return { code: 0, msg: '本次任务操作完成' }
      }
    } catch (error) {
      return error
    } finally {
      release()
      let position = win.getPosition()
      let size = win.getSize()
      const [width] = size
      const [x, y] = position
      window.createWindows(
        {
          parentId: win.id,
          isMainWin: false,
          title: '今日预约历史',
          isMainWin: false,
          route: 'subpage',
          width: 500,
          height: 400,
          resizable: false,
          modal: false,
          maximize: false,
          minimizable: false,
          fullscreenable: false,
          x: x + width,
          y
        }
      )
    }
  })
  ipcMain.on('start', async (event, ans) => {
    try {
      if(!has_auth) {
        win.webContents.send('message', {
          type: 'error',
          message: '未经授权，禁止操作，请联系作者'
        })
        return
      }
      // 都有效果
      event.sender.send('log', '正在为您初始化页面，将自动登录账号，但是需要自己拖动滑块；如果出错了没有打开最终预约页面，需要自己导入cookies，教程：http://cdn.qdovo.com/doudou.gif')
      // win.webContents.send('log', '正在为您初始化页面，将自动登录账号，但是需要自己拖动滑块')
      const { username, password, balanceNum } = ans
      store.set('users', [
        { username, password }
      ])
      store.set('users', [
        { username, password }
      ])
      if(balanceNum) {
        global.balanceNum = balanceNum
      }
      await loadPage(event, ans)
      await initPageAndLogin(page, event, ans)
      // 回应异步消息 event.sender.send

      let checkRes = await interval(loginCheck, 1000, 30)
      if(checkRes) {
        // let appointPhone = '13951101409'
        // win.webContents.send('get-form', {
        //   appointPhone
        // })
        await postTask(event, ans)
        // 为啥没效果？是因为页面跳转了？waitForNavigation原因
        // console.log('登录成功，正在导航中')
        // win.webContents.send('log', '登录成功，正在为您导航')
      } else {
        // win.webContents.send('log', '请滑动验证码')
      }
    } catch (error) {
      log.error('error', error.message)
      event.returnValue = error
    }

    page.on('load', async (e) => {
      let url = await page.url()
      // console.log('puppeteer page loaded', e, url)
      pageJumpCount++
      win.webContents.send('pageJump', {
        pageJumpCount,
        url
      })
    })
    page.on('close', () => {
      console.log('puppeteer page closed')
      win.webContents.send('closePage')
    })
    event.returnValue = {
      code: 0,
      message: '页面启动成功'
    }
  })
  ipcMain.on('setPath', (event, ans) => {
    console.log('用户修改的path', ans)
    global.browserPath = ans
    store.set('browserPath', ans)
  })
  ipcMain.on('restore', async (event, ans) => {
    restore(event, ans)
  })
  ipcMain.on('stopTask', async (event, ans) => {
    if (!has_auth) {
      win.webContents.send('message', {
        type: 'error',
        message: '未经授权，禁止操作，请联系作者'
      })
      return false
    }
    // if(!global.inWhitelist) {
    //   win.webContents.send('message', {
    //     type: 'error',
    //     message: '不在ip白名单中，禁止操作'
    //   })
    //   return false
    // }
    stopTask()
  })
  // 数据持久化
  ipcMain.on('setStore', (event, ans) => {
    const { key, value } = ans
    store.set(key, value)
  })
  ipcMain.on('debug', (event) => {
    debug(event)
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
    checkAuthJob.cancel()
    webPageJob && webPageJob.cancel()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

process.on('unhandledRejection', (reason, promise) => {
  const { code } = reason
  if (code === -100) return
  console.error(reason)
  log.error('Unhandled Rejection:', reason.message || '系统异常')
  if(win && win.webContents) {
    win.webContents.send('errorHandle', reason)
  }
})
