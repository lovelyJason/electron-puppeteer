'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { login, getLoginVerify } from './puppeteer/index.js'
import { getRecognition } from './lib/lianzhong.js'
import { insertDataFromExcel } from './utils'
// import axios from 'axios'
import { autoUpdater } from 'electron-updater'

// require('@electron/remote/main').initialize()      // electron 10.0以下版本不兼容
const fs = require('fs')
const path = require('path')
const puppeteer = require("puppeteer");
const { parseExcel } = require('./utils')
const http = require('http');
const os = require("os");
const Store = require('electron-store');
const feedUrl = ''

const isDevelopment = process.env.NODE_ENV !== 'production'
let win, browser, page, excelPath, pageJumpCount = 0, searchCount = 1
global.startRow = 3

// 错误码,-100: 获取chrome路径失败;-200: 查询失败

const store = new Store();
store.set('unicorn', '🦄');
store.set('users', [
  { username: '13775637795', password: '1988909db，' },
  { username: '13685231955', password: 'Ky131328!' },
])
console.log(store.get('users'))
global.browserPath = store.get('browserPath')

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
function getImgBase64Data (url) {
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

function getChromeDefaultPath () {
  return new Promise((resolve, reject) => {
    if(global.browserPath) {
      fs.stat(global.browserPath, (err, stat) => {
        if(err) {
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
        if(err1) {
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
      if(isDevelopment) {
        if(osType === "windows") {
          resolve(defaultPath || path.resolve(
            process.cwd(),
            "./node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
          ))
        } else {
          resolve('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
        }
      } else {
        if(osType === "windows") {
          resolve(defaultPath || puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked'));
        } else {
        }
      }
      event.returnValue = {
        code: 0,
        message: 'success'
      }
    } catch (error) {
      event.returnValue = error
      throw error
    }

  })
}

// start puppeteer
async function startPuppeteer(event, ans) {
  console.log("start up");
  let chromeExecPath = await getChromiumExecPath(event)
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
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
        "--disable-setuid-sandbox"
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
      window.chrome.csi = function() {};
      window.chrome.loadTimes = function() {};
      window.chrome.runtime = function() {};

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
    await page.goto("http://cpquery.sipo.gov.cn/");
    // await browser.close()
    // win.webContents.send('errorHandle', '呵呵哒')      // ipcMain没有send方法,使用win的属性webContents调用send,该属性负责渲染和控制web页面
    // await page.evaluate(() => {
    //   alert(1)
    // })
    login(page, ans)
  } catch (error) {
    console.log(error.message)
    throw error;      // throw error不要同时和webContents.send同时存在,否则重复报错
  }
}

async function verifyCode () {
  const url = 'http://cpquery.sipo.gov.cn/freeze.main?txn-code=createImgServlet&freshStept=1'
  let base64data = await getImgBase64Data(url)
  return base64data
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
      let id = "ca_"+String(Math.random()).split(".")[1];
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
      context.fillRect(0,0, width, height);
      context.drawImage(target,0, 0, target['naturalWidth'], target['naturalHeight'],0,0, width, height);
      return id;
  }, imgSelector);
  /**
   * 添加并绘制好了之后，再截图绘制好了的canvas。
   * @type {Base64ScreenShotOptions}
   */
  let shotOption = {type: type, encoding: "base64"};
  let element = await page.$(`#${canvasId}`);
  shotOption.clip = await element.boundingBox();
  let base64 = await page.screenshot(shotOption);
  if(isDevelopment) {
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

// TODO:验证码错误处理
async function searchPatent (applyNum, event) {
  // select-key:shenqingh是一个非法选择器名
  return new Promise(async (resolve, reject) => {
    try {
      // 限定必须从搜索页开始执行, cn/txnPantentInfoList, cn/txnQueryOrdinaryPatents
      // 注意此处可能是txnQueryFeeData,难道没有导航过来?
      const currentUrl = await page.url()
      // console.log('开始搜索前url', currentUrl)
      if(!currentUrl.includes('cpquery.sipo.gov.cn/txnPantentInfoList.do') && !currentUrl.includes('cpquery.sipo.gov.cn/txnQueryOrdinaryPatents.do')) {
        throw new Error('你必须从搜索页面开始执行脚本')
      }
      // 输入前清空申请号和验证码
      await page.evaluate(() => {
        document.querySelector('tr td:nth-child(2) input').value = ''
        document.getElementById('very-code').value = ''
      })
      // if(searchCount >= 2) {    // 非首次
      // }
      await page.type('tr td:nth-child(2) input', applyNum, { delay: 100 })
      // 输入验证码
      let base64data
      // let base64data = await verifyCode()    // 请求不到
      // 提示加载中
      await page.type('#very-code', '拼命计算')

      // #authImg截屏
      base64data = await shot(page, '#authImg', 'png', false)

      const recognition = await getRecognition(base64data)
      console.log('验证码识别结果', recognition)
      await page.evaluate(() => {
        document.getElementById('very-code').value = ''
      })
      await page.type('#very-code', recognition, { delay: 1000 })
      const button = await page.$('tr:last-child td:last-child a')
      await button.click()

      // 点击费用信息,实际上跳往
      // http://cpquery.sipo.gov.cn/txnQueryFeeData.do?select-key:shenqingh=2010101476746&select-key:zhuanlilx=1&select-key:gonggaobj=&select-key:backPage=http://cpquery.sipo.gov.cn/txnQueryOrdinaryPatents.do?select-key:sortcol=&select-key:sort=&select-key:shenqingh=2010101476746&select-key:zhuanlimc=&select-key:shenqingrxm=&select-key:zhuanlilx=&select-key:shenqingr_from=&select-key:shenqingr_to=&verycode=3&inner-flag:open-type=window
      // &inner-flag:flowno=1612505970499&token=A6A2784C08124078B64EA408ABE7F0FC&inner-flag:open-type=window&inner-flag:flowno=1612505984636
      let feeInfo = await page.waitForSelector('.content_boxx > ul > li:nth-child(3) a', { timeout: 0 })
      console.log('已找到费用信息按钮')     // 后面动作总是未触发,难道是因为js文件没加载过来?
      await page.waitForTimeout(1000)
      await feeInfo.click()
      // 复制查询后的结果
      await page.waitForSelector('.imfor_table', { timeout: 0 })
      // ['种类', '600', '2020-01-17', '未缴费']
      copySearchResult().then(feeData => {
        console.log('copy result', feeData)     // 'pos||'什么意思?
        resolve({
          feeType: feeData[0],
          payableAmount: +feeData[1],
          deadline: feeData[2],
          feeStatus: feeData[3]
        })
      })
    } catch (error) {
      console.log('搜索出错', error.message)
      reject(error)
    }
  })
}

function copySearchResult () {
  return Promise.all([
    page.$eval('.imfor_table_grid tbody > tr:nth-child(2) td:nth-child(1) > span', el => el.title),
    page.$eval('.imfor_table_grid tbody > tr:nth-child(2) td:nth-child(2) > span', el => el.title),
    page.$eval('.imfor_table_grid tbody > tr:nth-child(2) td:nth-child(3) > span', el => el.title),
    page.$eval('.imfor_table_grid tbody > tr:nth-child(2) td:nth-child(4) > span', el => el.title)
  ])

}

function formataFeeData (data={}) {
  const { feeType, payableAmount, deadline, feeStatus } = data
  // 第九和第十列,第三行为第一条数据
  return [
    { row: global.startRow, cell: 9, data: feeType },
    { row: global.startRow, cell: 10, data: payableAmount },
    { row: global.startRow, cell: 11, data: deadline },
    { row: global.startRow, cell: 12, data: feeStatus },
  ]
}

// electron 从渲染进程访问主进程除ipc外可以使用remote，从主进程渲染进程使用webContents. executeJavascript 在页面执行脚本，如果是puppeteer,page本身也提供访问页面元素的api

if(!isDevelopment) {
  Menu.setApplicationMenu(null)
}

async function createWindow () {
  // Menu.setApplicationMenu()
  // Create the browser window.
  win = new BrowserWindow({
    width: 860,
    height: 730,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  ipcMain.on('get-users', (event, ans) => {
    const users = store.get('users') || []
    event.reply('get-users-success', users)
  })
  ipcMain.on('start', async (event, ans) => {
    await startPuppeteer(event, ans)
    page.on('load', async (e) => {
      // http://cpquery.sipo.gov.cn/
      // http://cpquery.sipo.gov.cn/txnDisclaimerDetail.do?time=1612493729094&select-key:yuzhong=zh&select-key:gonggaolx=3
      // http://cpquery.sipo.gov.cn/txnPantentInfoList.do?inner-flag:open-type=window&inner-flag:flowno=1612493805730
      // http://cpquery.sipo.gov.cn/txnQueryFeeData.do?select-key:shenqingh=2010101476746&select-key:zhuanlilx=1&select-key:gonggaobj=&select-key:backPage=http%3A%2F%2Fcpquery.sipo.gov.cn%2FtxnQueryOrdinaryPatents.do%3Fselect-key%3Asortcol%3D%26select-key%3Asort%3D%26select-key%3Ashenqingh%3D2010101476746%26select-key%3Azhuanlimc%3D%26select-key%3Ashenqingrxm%3D%26select-key%3Azhuanlilx%3D%26select-key%3Ashenqingr_from%3D%26select-key%3Ashenqingr_to%3D%26verycode%3D2%26inner-flag%3Aopen-type%3Dwindow%26inner-flag%3Aflowno%3D1612515215121&token=81CDF18CB5E947F6B6A7C89B40AF95AF&inner-flag:open-type=window&inner-flag:flowno=1612515216427
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
    // 发送渲染进程
    event.reply('start-success', '来自主进程')
  })
  ipcMain.on('setPath', (event, ans) => {
    console.log('用户修改的path', ans)
    global.browserPath = ans
    store.set('browserPath', ans)
  })
  ipcMain.on('dialog', (event, ans) => {
    const path = dialog.showOpenDialogSync({
      filters: [
        {
          name: 'excel',
          extensions: 'xlsx'
        }
      ],
      properties: ['openFile'],
      message: '请选择要导入的文件',
      buttonLabel: '导入'
    })
    if (path && path.length) {
      // let content = fs.readFileSync(path[0])
      // fs.writeFileSync('./data.xlsx',content, 'utf-8')   打包后这个操作报错,只读文件不能写入
      excelPath = path[0]
      const patentData = parseExcel(path[0])[0] // 因为excel有多个sheet
      event.reply('dialog-success', patentData)
    }
  })
  // 登录验证
  ipcMain.on('loginCheck', async (event, ans) => {
    try {
      const { flag, text } = await getLoginVerify()
      event.returnValue = { flag, text }
    } catch (error) {   // 页面跳转时不好判断,因此给true
      event.returnValue = {
        flag: true,
        text: error.message
      }
    }
  })
  // 查询专利
  ipcMain.on('search', async (event, ans) => {
    try {
      // 如果在费用查询页点击返回
      const currentUrl = await page.url()
      // console.log('currentUrl', currentUrl)
      if(currentUrl.includes('txnQueryFeeData')) {
        const backPage = await page.$('#backToPage a')
        await backPage.click()
        await page.waitForNavigation({ waitUntil: 'load', timeout: 0 })
      }
      const data = await searchPatent(ans, event)
      searchCount++
      // console.log('查询后的费用数据', data)
      // 将查询结果插入新列另存,为防止同时多次写入文件,按顺序执行
      const newExcelDataArr = formataFeeData(data)
      await insertDataFromExcel(excelPath, 1, newExcelDataArr)
      global.startRow++
      // event.returnValue = true     // 渲染界面会卡住
      event.reply('search-success', {
        done: true,
        code: 0
      })
    } catch (error) {
      // try中报错这里要处理或者抛出,让全局错误回调处理,否则没有结果
      console.log(error.message)
      throw error
      // event.reply('search-success', {
      //   done: true,
      //   ...error,
      //   code: -200
      // })
    }
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
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
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
  if(code === -100) return
  console.log('Unhandled Rejection:', reason)
  win.webContents.send('errorHandle', reason)
})
