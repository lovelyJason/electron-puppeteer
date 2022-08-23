import { timeout } from './index'

let btn_position = null
let times = 0 // 执行重新滑动的次数
const distanceError = [-10, 2, 3, 5] // 距离误差

async function run(page) {
  btn_position = await getBtnPosition(page);
  // 滑动
  drag(page, null)
}

/**
* 计算按钮需要滑动的距离
* */
async function calculateDistance(page) {
  const distance = await page.evaluate(() => {
    function convertImageToCanvas(src) {
      var canvas = document.createElement("canvas");
      const img = new Image()
      img.src = src
      const myctx = canvas.getContext('2d')
      img.onload = () => {
        myctx.drawImage(img, 0, 0, 300, 150);
      }
      return canvas;
    }
    // 比较像素,找到缺口的大概位置
    function compare() {
      const img_full = document.querySelector('.verify-img2').src; // 完整图片
      const img_part = document.querySelector('.verify-img1').src; // 带缺口图片
      let ctx1 = convertImageToCanvas(img_full)
      let ctx2 = convertImageToCanvas(img_part)
      const pixelDifference = 30; // 像素差
      let res = []; // 保存像素差较大的x坐标
      // 对比像素
      for (let i = 57; i < 260; i++) {
        for (let j = 1; j < 160; j++) {
          const imgData1 = ctx1.getContext("2d").getImageData(1 * i, 1 * j, 1, 1)
          const imgData2 = ctx2.getContext("2d").getImageData(1 * i, 1 * j, 1, 1)
          const data1 = imgData1.data;
          const data2 = imgData2.data;
          console.log(data1, data2)
          const res1 = Math.abs(data1[0] - data2[0]);
          const res2 = Math.abs(data1[1] - data2[1]);
          const res3 = Math.abs(data1[2] - data2[2]);
          if (!(res1 < pixelDifference && res2 < pixelDifference && res3 < pixelDifference)) {
            if (!res.includes(i)) {
              res.push(i);
            }
          }
        }
      }
      // 返回像素差最大值跟最小值，经过调试最小值往左小7像素，最大值往左54像素
      return { min: res[0] - 7, max: res[res.length - 1] - 54 }
    }
    return compare()
  })
  console.log('distance', distance)
  return distance;
}
/**
* 计算滑块位置
*/
async function getBtnPosition(page) {
  const btn_position = await page.evaluate(() => {
    const { clientWidth, clientHeight } = document.querySelector('.operate-slider')
    return { btn_left: clientWidth / 2 - 104, btn_top: clientHeight / 2 + 59 }
  })
  return btn_position;
}
 /**
 * 尝试滑动按钮
 * @param distance 滑动距离
 * */
async function tryValidation(page, distance) {
  //将距离拆分成两段，模拟正常人的行为
  const distance1 = distance - 10
  const distance2 = 10
  page.mouse.click(btn_position.btn_left, btn_position.btn_top, { delay: 2000 })
  page.mouse.down(btn_position.btn_left, btn_position.btn_top)
  page.mouse.move(btn_position.btn_left + distance1, btn_position.btn_top, { steps: 30 })
  await timeout(800);
  page.mouse.move(btn_position.btn_left + distance1 + distance2, btn_position.btn_top, { steps: 20 })
  await timeout(800);
  page.mouse.up()
  await timeout(4000);
  // 判断是否验证成功
  const isSuccess = await page.evaluate(() => {
    return document.querySelector('.navContent-loginUser') && document.querySelector('.navContent-loginUser').innerHTML
  })
  await timeout(1000);
  // 判断是否需要重新计算距离
  const reDistance = await page.evaluate(() => {
    return document.querySelector('.opetate-text') && document.querySelector('.opetate-text').innerHTML
  })
  await timeout(1000);
  return { isSuccess: isSuccess === '验证成功', reDistance: reDistance.includes('验证失败') }
}
/**
* 拖动滑块
* @param distance 滑动距离
* */
async function drag(page,distance) {
  distance = distance || await calculateDistance(page);
  const result = await tryValidation(page, distance.min)
  if (result.isSuccess) {
    await timeout(1000);
    //登录
    console.log('验证成功')
    // page.click('#modal-member-login button')
  } else if (result.reDistance) {
    console.log('重新计算滑距离录，重新滑动')
    times = 0
    await drag(page, null)
  } else {
    if (distanceError[times]) {
      times++
      console.log('重新滑动')
      await drag(page,{ min: distance.max, max: distance.max + distanceError[times] })
    } else {
      console.log('滑动失败')
      times = 0
      run(page)
    }
  }
}
module.exports = run
