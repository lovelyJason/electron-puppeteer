// require('babel-register') ({
//   presets: [ 'env' ]
// })
// const api = require('./src/lib/api').default     // 导入es module的成员实际上是一个包含default的对象
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const axios = require('axios')

const env = process.env
const version = env.npm_package_version
const name = env.npm_package_name
// let tagName = 'v0.1.0';

// (async function () {
//   await axios.get('https://api.github.com/repos/lovelyJason/electron-puppeteer/releases/latest').then(res => {
//     const { data: { tag_name } } = res
//     tagName = tag_name
//   }).catch(err => {
//     console.log(err.message)
//   })
// })()

module.exports = {
  pluginOptions: {
    electronBuilder: {
      // preload: 'src/preload.js',
      nodeIntegration: true,
      builderOptions: {
        asar: true, // false可关闭压缩,源代码会放置到app目录下
        asarUnpack: 'node_modules/puppeteer/.local-chromium/**/*',
        productName: '科佑新创扫号助手特供版',
        artifactName: `${name}-setup-v${version}.exe`, // 此处应该是github release的最新版本
        copyright: 'Copyright © 2021 jasonhuang',
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          createDesktopShortcut: true
          // installerIcon: "./build/icons/shortcut.ico",
          // uninstallerIcon: "./build/icons/shortcut.ico",
          // installerHeaderIcon: "./build/icons/shortcut.ico",
          // shortcutName: 'shortcut.ico'
        },
        appId: 'patentTask',
        win: {
          icon: './build/icons/shortcut.ico',
          target: ['portable'] // setup文件免安装版本
        }
      },
      publish: {
        provider: 'github',
        owner: 'lovelyJason'
        // url: `https://github.com/lovelyJason/electron-puppeteer/releases/download/v${version}/`
      }
    }
  },
  configureWebpack: config => {
    config.plugins.forEach(val => {
      if (val instanceof HtmlWebpackPlugin) {
        val.options.title = '科佑新创扫号助手特供版'
      }
    })
  }
}
