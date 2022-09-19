'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { login } from './puppeteer/index.js'
import { interval, timeout } from './utils'
import Update from './checkupdate'; // 引入上面的文件
import dayjs from 'dayjs'
import AdvancedFormat from 'dayjs/plugin/IsSameOrAfter'
import axios from 'axios'
// import { resolve } from 'path'
// import run from './utils/run'
// import api from '@/lib/api'
// require('@electron/remote/main').initialize()      // electron 10.0以下版本不兼容

dayjs.extend(AdvancedFormat)
// console.log(dayjs('2022-08-26').isSameOrAfter(dayjs(dayjs().format('YYYY-MM-DD'))))

const https = require('https');
const { machineIdSync, machineId } = require('node-machine-id');
const fs = require('fs')
const puppeteer = require("puppeteer");
const http = require('http');
const os = require("os");
const Store = require('electron-store');
const log = require('electron-log')
const path = require('path')
const { intercept, patterns } = require('puppeteer-interceptor');
const schedule = require("node-schedule");

log.transports.console.level = false;
log.transports.console.level = 'silly';
axios.defaults.headers['Connection'] = 'keep-alive'

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});
// const isDev = require('electron-is-dev');

const isDevelopment = process.env.NODE_ENV !== 'production'
let win, browser, page, lastPage, pageJumpCount = 0
let submit_cookie = ''
let executionParams = {
  executionFrequency: 500,
  limit: 5,
  model: 2
}
let curExecutionCount = 1 // 当前执行的次序
let executionSuccessCount = 0
const accept_ip_list = ['210.21.226.100', '121.231.26.20', '183.213.133.139', '113.99.149.165']
let user_status = null
let formDataList = []
let stopTaskFlag = false
let webPageTimerId = null
let inProgress = false
let has_auth = false

// let rule = new schedule.RecurrenceRule();
// 毫秒无效， 当秒间隔时间加上当前时间大于60的时候不会生效
// let job = schedule.scheduleJob('59/0.3 * * * * *', async function () {
//   console.log(dayjs().format('HH:mm:ss'))
// })

// console.log(isDev)

// 错误码,-100: 获取chrome路径失败;-200: 查询失败

const store = new Store();
store.set('unicorn', '🦄');
// store.set('users', [
//   // { username: '566', password: ' 666*' },
//   // { username: '666', password: '666!' },
// ])
global.browserPath = store.get('browserPath')
global.orderData = []
global.orderSubmitTime = ''
global.taskTimerId = null
global.balanceNum = 0
global.executionFrequency = 500

const STORE_PATH = app.getPath('userData')
console.log('用户目录', STORE_PATH)
global.STORE_PATH = STORE_PATH
global.CONFIG_PATH = STORE_PATH + '/' + 'config.json'
global.machineId = machineIdSync()    // e40c2e6224c173ffb4a8b332c49d4527cbd91e3b1d0f56c22b71dd1627d4f31d

;(async function() {
  try {
    let res = await axios.get('https://qdovo.com/api/patent/user/list')
    let codeList = res.data.data
    global.machineIdList = codeList
    console.log(codeList, global.machineId)
    has_auth = codeList.some(val => {
      return val.id === global.machineId
    })
    console.log('has_auth', has_auth)
  } catch (error) {
    console.log(error.message)
  }
}());
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
function getOuterNetIPAdress() {
  let url = 'https://ifconfig.me/ip'
  return axios.get(url).then(res => {
    let ip = res.data
    return ip
  })
}


function getUserInfo() {
  let url = 'http://www.qdovo.com/api/patent/user'
  return axios.get(url).then(res => {
    return res.data
  })
}
function diableUser() {
  let url = 'http://www.qdovo.com/api/patent/user/disable'
  return axios.post(url).then(res => {
    return res.data
  })
}

async function submitFormSerially() {
  if(stopTaskFlag) return
  inProgress = true
  let data = formDataList[0]

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
    data: data
  }
  // TODO:
  // config = {
  //   method: 'get',
  //   url: 'http://localhost:3000/api/test1'
  // }
  formDataList.push(formDataList.shift())
  return instance(config).then(async response => {
    log.info('接口调用成功', JSON.stringify(response.data));
    const { code, } = response.data
    if(code === 0) {
      win.webContents.send('message', {
        type: 'success',
        message: '恭喜您，预约成功 --- ' + dayjs().format('HH:mm:ss') + '：' + JSON.stringify(response.data)
      })
      win.webContents.send('log', '第' + curExecutionCount + '次执行：' + dayjs().format('HH:mm:ss') + '：' + JSON.stringify(response.data) + '预约成功，即刻终止任务')
      curExecutionCount = 1
      executionSuccessCount = 0
      inProgress = false
    } else {
      if(curExecutionCount > executionParams.limit) {
        log.info(`本次任务${executionParams.limit}条，成功数量：${executionSuccessCount}，失败数量：${executionParams.limit - executionSuccessCount}`)
        curExecutionCount = 1
        executionSuccessCount = 0
        inProgress = false
        return
      }
      win.webContents.send('log', '第' + curExecutionCount + '次执行：' + dayjs().format('HH:mm:ss') + '：' + JSON.stringify(response.data) + '------未预约成功，重新尝试中......')
      curExecutionCount++

      await submitFormSerially()
    }

  }).catch(async error => {
    log.error('接口调用错误', error.message);  // 404，504， 如果回应时间较长，可能长时间没有回应，但是定时器执行多次
    win.webContents.send('log', dayjs().format('HH:mm:ss') + '：' + error.message)
    if(error.message.includes('404')) {
      inProgress = false
      throw error   // 抛错会导致省局报错没后续了
    } else {
      await submitFormSerially()
    }
  })
}

function submitForm() {
  inProgress = true
  let data = formDataList[0]
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
    data: data
  }
  // TODO:
  // config = {
  //   method: 'get',
  //   url: 'http://localhost:3000/api/test1'
  // }
  formDataList.push(formDataList.shift())
  console.log(dayjs().format('HH:mm:ss'))
  return new Promise((resolve, reject) => {
    instance(config)
     .then(function (response) {
       //  {"msg":"请选择预约日期!!","code":-1,"success":false}
       log.info('接口调用成功', JSON.stringify(response.data));
       win.webContents.send('log', '第' + curExecutionCount + '次执行：' + dayjs().format('HH:mm:ss') + '：' + JSON.stringify(response.data))
       const { code } = response.data
       executionSuccessCount++
       if(code == 0) {  // 提交成功
        inProgress = false
        win.webContents.send('message', {
          type: 'success',
          message: '恭喜您，预约成功 --- ' + dayjs().format('HH:mm:ss') + '：' + JSON.stringify(response.data)
        })
        clearInterval(global.taskTimerId)
        resolve(1)
       } else { // 提交失败，如余额不足
         resolve(0)
       }

     }).catch(function (error) {
        log.error('接口调用错误', error.message);  // 404，504， 如果回应时间较长，可能长时间没有回应，但是定时器执行多次
        win.webContents.send('log', dayjs().format('HH:mm:ss') + '：' + error.message)
        if(error.message.includes('404')) {
          inProgress = false
          reject(error)
        }
     }).finally(() => {
        if(curExecutionCount === executionParams.limit) {
          inProgress = false
          log.info(`本次任务${executionParams.limit}条，成功数量：${executionSuccessCount}，失败数量：${executionParams.limit - executionSuccessCount}`)
        }
     })

  })

}


// 图片有防盗,直接请求不了,需要传入cookie,且浏览器如果刷新了这个图片,cookie也会更新
function getImgBase64Data(url) {
  return new Promise((resolve, reject) => {
    http.get(url, function (res) {
      var chunks = [];
      var size = 0;
      res.on('data', function (chunk) {
        chunks.push(chunk);
        size += chunk.length;　　//累加缓冲数据的长度
      });
      res.on('end', function (err) {
        var data = Buffer.concat(chunks, size);
        var base64Img = data.toString('base64');
        resolve(`data:image/jpeg;base64,${base64Img}`)
        // console.log(`data:image/png;base64,${base64Img}`);
      });
    });
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
          console.log('你的路径下没有chrome')
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
      console.log('default chrome path', defaultPath)
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
  let res = await page.evaluate(() => {
   return document.querySelector('.navContent-loginUser') && document.querySelector('.navContent-loginUser').innerHTML
 })
 // 这里如果不return， 那么一直会是undefined， 虽然是会阻塞执行，但没有返回值
 return res
}

if (!isDevelopment) {
  Menu.setApplicationMenu(null)
}
// electron 从渲染进程访问主进程除ipc外可以使用remote，从主进程渲染进程使用webContents. executeJavascript 在页面执行脚本，如果是puppeteer,page本身也提供访问页面元素的api

function validateForm() {
  return new Promise(async (resolve, reject) => {
    try {
      let lastPage = global.lastPage
      let res = await Promise.all([
        lastPage.$eval('.layui-form .layui-form-item:nth-child(1) input[name="patentName"]', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(2) input[type="text"]', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(3) input[name="appointPhone"]', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(5) input', el => el.value),
        lastPage.$eval('.layui-form .layui-form-item:nth-child(6) input[id="applyClassifyCode"]', el => el.value),
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
      win.webContents.send('log', '出错了' + error.message)
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
      // console.log('设置orderSubmitTime', orderSubmitTime, typeof orderSubmitTime)
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
async function postTask(event, ans) {
  try {
    // 获取一个加密参数，目前看来是hardcode的
    //let res = await api.post('https://ip.jsipp.cn/ZSCQ/app/zscq.app/action/ssoServer.action?method=getSSOLoginUrl')
    let url1 = 'https://zlys.jsipp.cn/toPage/auth/getYS' + '?login_key=' + 'F5B3D8963940E757DCF57F636DD3039CF8979B8DE5EC056B0DD4B4DC87DCF9E1'
    let url2 = 'https://zlys.jsipp.cn/auth/patent/general/toAppointmentPage?appId=yushen'
    let page1 = await browser.newPage()
    await page1.goto(url1)
    console.log(await page1.$('#main-message'))
    let lastPage = await browser.newPage()
    await lastPage.goto(url2)
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
    // 回填数据

    // win.webContents.send('log', 'cookies抓取成功：' + JSON.stringify(cookies))
    await lastPage.waitForSelector('#onSubmit', { timeout: 3000 })

    let checkRes = await interval(validateForm, 20000, 50000)
    if(checkRes) {
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
      let job = schedule.scheduleJob('59 59 10 * * *', async function () {
        let count = 1
        webPageTimerId = setInterval(() => {
          if(count >= 5) {
            clearInterval(webPageTimerId)
            job.cancel()
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
async function stopTask() {
  stopTaskFlag = true
  inProgress = false
  if(executionParams.model === 2) {
    if(global.taskTimerId) {
      clearInterval(global.taskTimerId)
    }
  }
  win.webContents.send('log', '任务已停止，可再次恢复启动')
}
async function restore(event, ans) {
  const { balanceNum, executionFrequency } = ans
  if(balanceNum) {
    global.balanceNum = balanceNum
  }
  if(executionFrequency) {
    global.executionFrequency = executionFrequency
  }
  if(global.lastPage) {
    interval(setOrderTime, global.executionFrequency || 800, 0, function(timerId) {
      global.taskTimerId = timerId
    })
  } else {
    postTask()
  }
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
// console.log(path.join(__static,"./"))  // D:\projects\electron-puppeteer\public\
async function createWindow() {
  // Menu.setApplicationMenu()
  // Create the browser window.
  // let self_ip = await getOuterNetIPAdress()
  // user_status = await getUserInfo()
  // console.log(self_ip, user_status)
  // if(!accept_ip_list.includes(self_ip) || user_status == '0') {
  //   new BrowserWindow({
  //     width: 200,
  //     height: 200
  //   })
  //   return
  // }
  win = new BrowserWindow({
    width: 780,
    height: 760,
    resizable: false,
    icon: path.join(__static, "./icon64.ico"),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  })
  // 注册更新检查
  Update(win, log);

  if (process.env.WEBPACK_DEV_SERVER_URL) {     // http://localhost:8080/
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  global.win = win

  win.webContents.send('setCookies', store.get('cookies'))
  ipcMain.handle('getData', (event, ans) => {
    let list = []
    ans = ans || []
    ans.forEach(val => {
      list.push(store.get(val))
    })
    return list
  })
  ipcMain.handle('setData', (event, ans) => {
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
      win.webContents.send('message', {
        type: 'error',
        message: '未经授权，禁止操作，请联系作者'
      })
      return false
    }
    executionParams = ans
    return true
  })
  // 开始提交任务
  ipcMain.handle('submit', async (event, ans) => {
    if(!has_auth) {
      win.webContents.send('message', {
        type: 'error',
        message: '未经授权，禁止操作，请联系作者'
      })
      return
    }
    if(inProgress) {
      win.webContents.send('log', '已经有任务在进行了，请勿重复操作......')
      return
    }
    stopTaskFlag = false
    formDataList = ans
    curExecutionCount = 1
    executionSuccessCount = 0
    try {
      win.webContents.send('log', '任务执行中，请耐心等待......')
      // 并行执行
      if(executionParams.model === 2 || !executionParams.model) {
        let res = await interval(() => {
          return submitForm()
        }, executionParams.executionFrequency || 800, executionParams.limit, function(timerId, count) {
          global.taskTimerId = timerId
          curExecutionCount = count
        })
        if(res) {
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
      const { username, password, balanceNum, executionFrequency } = ans
      store.set('users', [
        { username, password }
      ])
      store.set('users', [
        { username, password }
      ])
      if(balanceNum) {
        global.balanceNum = balanceNum
      }
      if(executionFrequency) {
        global.executionFrequency = executionFrequency
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
  log.error('Unhandled Rejection:', reason.message || '系统异常')
  win.webContents.send('errorHandle', reason)
})
