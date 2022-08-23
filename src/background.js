'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { login, getLoginVerify, getResponseBody } from './puppeteer/index.js'
import { getRecognition } from './lib/lianzhong.js'
import { insertDataFromExcel, interval } from './utils'
import Update from './checkupdate'; // 引入上面的文件
// import run from './utils/run'
// import api from '@/lib/api'
// require('@electron/remote/main').initialize()      // electron 10.0以下版本不兼容

const fs = require('fs')
const path = require('path')
const puppeteer = require("puppeteer");
const { parseExcel } = require('./utils')
const http = require('http');
const os = require("os");
const Store = require('electron-store');
const log = require('electron-log')

log.transports.console.level = false;
log.transports.console.level = 'silly';

// const isDev = require('electron-is-dev');

const isDevelopment = process.env.NODE_ENV !== 'production'
let win, browser, page, lastPage, excelPath, pageJumpCount = 0, searchCount = 1

// console.log(isDev)

// 错误码,-100: 获取chrome路径失败;-200: 查询失败

const store = new Store();
store.set('unicorn', '🦄');
store.set('users', [
  // { username: '566', password: ' 666*' },
  // { username: '666', password: '666!' },
])
console.log(store.get('users'))
global.browserPath = store.get('browserPath')

const STORE_PATH = app.getPath('userData')
console.log('用户目录', STORE_PATH)

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

const osType = checkOperatingSystem(os.type())

console.log(osType)

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
  console.log("start up");
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
    console.log(error.message)
    throw error;      // throw error不要同时和webContents.send同时存在,否则重复报错
  }
}
let initPageAndLogin = async (page, event, ans) => {
  try {
    await page.goto("https://ip.jsipp.cn/");
    await page.waitForTimeout(1000)
    const loginBtn = await page.$('.nav-login')
    await loginBtn.click() // 登录按钮
    // await browser.close()
    // win.webContents.send('errorHandle', '呵呵哒')      // ipcMain没有send方法,使用win的属性webContents调用send,该属性负责渲染和控制web页面
    // await page.evaluate(() => {
    //   alert(1)
    // })
    await login(page, ans) // 弹框登录按钮
    await page.waitForTimeout(1000)
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

// electron 从渲染进程访问主进程除ipc外可以使用remote，从主进程渲染进程使用webContents. executeJavascript 在页面执行脚本，如果是puppeteer,page本身也提供访问页面元素的api

async function postTask(event, ans) {
  try {
    // pageNavigation
    // let page1 = await browser.newPage();
    // await page1.goto('https://ip.jsipp.cn/ZSCQ/app/zscq.app/pages/patent.html')
    // await page1.waitForNavigation({ waitUntil: 'load', timeout: 0 })
    // await page.setRequestInterception(true)
    // page.on('request', interceptedRequest => {
    //   if (
    //     interceptedRequest.url().endsWith('getSSOLoginUrl')
    //   )
    //     interceptedRequest.abort();
    //   else interceptedRequest.continue();
    // });

    // 获取一个加密参数，目前看来是hardcode的
    //let res = await api.post('https://ip.jsipp.cn/ZSCQ/app/zscq.app/action/ssoServer.action?method=getSSOLoginUrl')
    if (!lastPage) {
      win.webContents.send('log', '正在为您导航至最终页面，请自行填写表单信息')
      let url1 = 'https://zlys.jsipp.cn/toPage/auth/getYS' + '?login_key=' + 'F5B3D8963940E757DCF57F636DD3039CF8979B8DE5EC056B0DD4B4DC87DCF9E1'
      let url2 = 'https://zlys.jsipp.cn/auth/patent/general/toAppointmentPage?appId=yushen'
      let page1 = await browser.newPage()
      await page1.goto(url1)
      let lastPage = await browser.newPage()
      await lastPage.goto(url2)
      global.lastPage = lastPage
      await lastPage.waitForNavigation({ waitUntil: 'load', timeout: 0 })
    }
  } catch (error) {
    console.log('出错了', error.message)
    throw error
  }
}

const loginCheck = async () => {
  let res = await page.evaluate(() => {
   return document.querySelector('.navContent-loginUser') && document.querySelector('.navContent-loginUser').innerHTML
 })
 // 这里如果不return， 那么一直会是undefined， 虽然是会阻塞执行，但没有返回值
 return res
}

if (!isDevelopment) {
  Menu.setApplicationMenu(null)
}

async function createWindow() {
  // Menu.setApplicationMenu()
  // Create the browser window.
  win = new BrowserWindow({
    width: 860,
    height: 750,
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
  ipcMain.on('get-users', (event, ans) => {
    const users = store.get('users') || []
    event.reply('get-users-success', users)
  })
  ipcMain.on('start', async (event, ans) => {
    try {
      // 没效果？
      // win.webContents.send('log', '正在为您初始化页面，将自动登录账号，但是需要自己拖动滑块')
      await loadPage(event, ans)
      await initPageAndLogin(page, event, ans)
      console.log('页面启动成功')

      let checkRes = await interval(loginCheck, 1000, 20)
      if(checkRes) {
        await postTask(event, ans)
        // win.webContents.send('log', '登录成功，正在为您导航')
      } else {
        // win.webContents.send('log', '请滑动验证码')
      }
      event.returnValue = {
        code: 0,
        message: '页面启动成功'
      }
      console.log(1111111111)
    } catch (error) {
      console.log('error', error.message)
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
  ipcMain.on('postTask', async (event, ans) => {
    postTask(event, ans)
  })
  // 数据持久化
  ipcMain.on('setStore', (event, ans) => {
    const { key, value } = ans
    store.set(key, value)
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
  console.log('Unhandled Rejection:', reason)
  log.error(reason.message || '系统异常')
  win.webContents.send('errorHandle', reason)
})
