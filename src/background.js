'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { login } from './puppeteer/index.js'
import { getRecognition } from './lib/lianzhong.js'

// require('@electron/remote/main').initialize()      // electron 10.0以下版本不兼容
const fs = require('fs')
const path = require('path')
const puppeteer = require("puppeteer");
const { parseExcel } = require('./utils')
const http = require('http');

const isDevelopment = process.env.NODE_ENV !== 'production'
let win, browser, page

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

function getChromiumExecPath() {
  return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
}

// start puppeteer
async function startPuppeteer() {
  console.log("start up");
  try {
    browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 0,
        height: 0
      },
      ignoreDefaultArgs: ["--enable-automation"],
      executablePath:
        // '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        process.env.NODE_ENV === 'development'
        ? path.resolve(
          process.cwd(),
          "./node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
        ) :
        getChromiumExecPath(),
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
    login(page)
  } catch (error) {
    console.log(error.message)
    win.webContents.send('errorHandle', error)
    throw error;
  }
}

async function verifyCode () {
  const url = 'http://cpquery.sipo.gov.cn/freeze.main?txn-code=createImgServlet&freshStept=1&now=Wed%20Feb%2003%202021%2017:42:50%20GMT+0800%20(%E4%B8%AD%E5%9B%BD%E6%A0%87%E5%87%86%E6%97%B6%E9%97%B4)'
  let base64data = await getImgBase64Data(url)
  return base64data
}

async function searchPatent (applyNum) {
  // select-key:shenqingh是一个非法选择器名
  try {
    page.waitForSelector('tr td:first-child').then(async () => {
      await page.type('tr td:nth-child(2) input', applyNum, { delay: 100 })
      // 输入验证码
      let base64data = await verifyCode()
      const recognition = await getRecognition(base64data)
      console.log(recognition)
      // 开始查询
      // const button = await page.$('tr:last-child td:last-child a')
      // await button.click()
    })
  } catch (error) {
    console.log(error)
  }
}

// electron 从渲染进程访问主进程除ipc外可以使用remote，从主进程渲染进程使用webContents. executeJavascript 在页面执行脚本，如果是puppeteer,page本身也提供访问页面元素的api

async function createWindow () {
  // Menu.setApplicationMenu()
  // Create the browser window.
  win = new BrowserWindow({
    width: 820,
    height: 600,
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

  ipcMain.on('start', async (event, ans) => {
    await startPuppeteer()
    // 发送渲染进程
    event.reply('startSuccess', '来自主进程')
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
      const patentData = parseExcel(path[0])[0] // 因为excel有多个sheet
      event.reply('dialogSuccess', patentData)
    }
  })
  ipcMain.on('search', (event, ans) => {
    searchPatent(ans)
    event.returnValue = true
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
