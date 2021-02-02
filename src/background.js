'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { start, login } from './puppeteer/index.js'

const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs')
const { parseExcel } = require('./utils')

// 渲染进程调用会报错Cannot find module './puppeteer' Require stack:
var myPuppeteer = require('./puppeteer')
console.log(myPuppeteer)

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
async function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 820,
    height: 600,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
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

  let browser, page
  ipcMain.on('start', async (event, ans) => {
    const res = await start() || {}
    browser = res.browser
    page = res.page
    process.env.mypage = page
    // 发送渲染进程
    event.reply('startSuccess', '来自主进程')
  })
  ipcMain.on('debug', (event, ans) => {
    login(page)
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
