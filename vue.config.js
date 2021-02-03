module.exports = {
  pluginOptions: {
    electronBuilder: {
      // preload: 'src/preload.js',
      nodeIntegration: true,
      asar: true,
      asarUnpack: 'node_modules/puppeteer/.local-chromium/**/*'
    }
  }
}
