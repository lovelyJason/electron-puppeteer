import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'
import axios from 'axios'

// const version = process.env.npm_package_version     // build后似乎获取不到此值
const version = require('../package.json').version // 注意package为保留关键字
let log

// console.log(tagName)    // 这里会先于异步函数自调用执行

function getFeedUrl () {
  return axios.get('https://api.github.com/repos/lovelyJason/electron-puppeteer/releases/latest').then(res => {
    const { data: { tag_name } } = res
    const tagName = tag_name
    const feedUrl = `https://github.com/lovelyJason/electron-puppeteer/releases/download/${tagName}/`
    return feedUrl
  }).catch(err => {
    console.log(err.message)
  })
}

/**
 * -1 检查更新失败 0 正在检查更新 1 检测到新版本，准备下载 2 未检测到新版本 3 下载中 4 下载完成
 **/
// 负责向渲染进程发送信息
function Message (mainWindow, type, data) {
  const sendData = {
    state: type,
    msg: data || ''
  }
  log.info(`type---${type}`)
  mainWindow.webContents.send('UpdateMsg', sendData)
}

async function main (mainWindow, _log) {
  log = _log
  // 在下载之前将autoUpdater的autoDownload属性设置成false，通过渲染进程触发主进程事件来实现这一设置(将自动更新设置成false)
  autoUpdater.autoDownload = false
  // 设置版本更新地址，即将打包后的latest.yml文件和exe文件同时放在
  // http://xxxx/test/version/对应的服务器目录下,该地址和package.json的publish中的url保持一致
  const feedUrl = await getFeedUrl()
  autoUpdater.setFeedURL(feedUrl)
  // 当更新发生错误的时候触发。
  autoUpdater.on('error', (err) => {
    if (err.message.includes('sha512 checksum mismatch')) {
      Message(mainWindow, -1, 'sha512校验失败')
    }
    log.error(err.message || '系统异常')
  })
  // 当开始检查更新的时候触发
  autoUpdater.on('checking-for-update', (event, arg) => {
    Message(mainWindow, 0)
  })
  // 发现可更新数据时
  autoUpdater.on('update-available', (event, arg) => {
    Message(mainWindow, 1)
  })
  // 没有可更新数据时
  autoUpdater.on('update-not-available', (event, arg) => {
    Message(mainWindow, 2)
  })
  // 下载监听
  autoUpdater.on('download-progress', (progressObj) => {
    Message(mainWindow, 3, progressObj)
  })
  // 下载完成
  autoUpdater.on('update-downloaded', () => {
    Message(mainWindow, 4)
  })
  // 执行更新检查
  ipcMain.handle('check-update', () => {
    console.log('执行更新检查')
    autoUpdater.checkForUpdates().then(res => {
      // console.log('检查结果', res)
    }).catch(err => {
      console.log('网络连接问题', err)
    })
  })
  // 退出并安装
  ipcMain.handle('confirm-update', () => {
    autoUpdater.quitAndInstall()
  })

  // 手动下载更新文件
  ipcMain.handle('confirm-downloadUpdate', () => {
    autoUpdater.downloadUpdate()
  })
}

export default main
