const path = require("path");

function login(page, ans) {
  const { username, password } = ans
  page.waitForSelector('#username1').then(async () => {
    await page.evaluate(() => {
      document.getElementById('username1').value = ''
      document.getElementById('password1').value = ''
    })
    await page.type("#username1", username, { delay: 100 });
    await page.type("#password1", password, { delay: 100 });
  })
}

function getExecutablePath () {
  if(process.env.NODE_ENV === 'development') {
    if(osType === "windows") {
      return path.resolve(
        process.cwd(),
        "./node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
      )
    } else {
      path.resolve(
        process.cwd(),
        './node_modules/puppeteer/.local-chromium/mac-818858/chrome-mac/Chromium'
      )
    }
  } else {
    if(osType === "windows") {
      return './chrome.exe'
    } else {
      return './Chromium'
    }
  }
}

// 登陆验证码校验

async function getLoginVerify() {
  try {
    const text = await global.page.$eval('#selectyzm_text', node => node.innerText)
    console.log(text)
    return {
      flag: text.includes('验证成功'),
      text: text
    }
  } catch (error) {
    console.log('校验出错', error.message)
    return
  }
}

module.exports = {
  login,
  getLoginVerify
};
