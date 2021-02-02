const puppeteer = require('puppeteer')

async function login (page) {
  await page.type('#username1', '13685231955', { delay: 100 })
  await page.type('#password1', 'Ky131328!', { delay: 100 })
}

async function start () {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: 0,
        height: 0
      },
      ignoreDefaultArgs: ['--enable-automation'],
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--allow-running-insecure-content',
        '--disable-web-security',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    })
    const page = await browser.newPage()
    await page.evaluateOnNewDocument(() => {
      // 在每个新页面打开前执行以下脚本
      const newProto = navigator.__proto__
      delete newProto.webdriver // 删除navigator.webdriver字段
      navigator.__proto__ = newProto
      window.chrome = {} // 添加window.chrome字段，为增加真实性还需向内部填充一些值
      window.chrome.app = {
        InstallState: 'hehe',
        RunningState: 'haha',
        getDetails: 'xixi',
        getIsInstalled: 'ohno'
      }
      window.chrome.csi = function () {}
      window.chrome.loadTimes = function () {}
      window.chrome.runtime = function () {}

      Object.defineProperty(navigator, 'userAgent', {
        // userAgent在无头模式下有headless字样，所以需覆写
        get: () =>
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36'
      })
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: {
              type: 'application/x-google-chrome-pdf',
              suffixes: 'pdf',
              description: 'Portable Document Format',
              enabledPlugin: Plugin
            },
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            length: 1,
            name: 'Chrome PDF Plugin'
          },
          {
            0: {
              type: 'application/pdf',
              suffixes: 'pdf',
              description: '',
              enabledPlugin: Plugin
            },
            description: '',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
            length: 1,
            name: 'Chrome PDF Viewer'
          },
          {
            0: {
              type: 'application/x-nacl',
              suffixes: '',
              description: 'Native Client Executable',
              enabledPlugin: Plugin
            },
            1: {
              type: 'application/x-pnacl',
              suffixes: '',
              description: 'Portable Native Client Executable',
              enabledPlugin: Plugin
            },
            description: '',
            filename: 'internal-nacl-plugin',
            length: 2,
            name: 'Native Client'
          }
        ]
      })
      Object.defineProperty(navigator, 'languages', {
        // 添加语言
        get: () => ['zh-CN', 'zh', 'en']
      })
      const originalQuery = window.navigator.permissions.query // notification伪装
      window.navigator.permissions.query = parameters => parameters.name === 'notifications' ? Promise.resolve({ state: Notification.permission }) : originalQuery(parameters)

      // alert(navigator.webdriver)
      Object.defineProperties(navigator, { webdriver: { get: () => undefined } })
      // alert(navigator.webdriver)
      // var attr = window.navigator,
      //   result = [];
      // do {
      //   Object.getOwnPropertyNames(attr).forEach(function(a) {
      //     result.push(a);
      //   });
      // } while ((attr = Object.getPrototypeOf(attr)));
      // result = result.filter(function(item) {
      //   return item != "webdriver";
      // });
    })
    await page.goto('http://cpquery.sipo.gov.cn/')
    return {
      browser,
      page
    }
    // await browser.close()
  } catch (error) {}
}

module.exports = {
  start,
  login
}
