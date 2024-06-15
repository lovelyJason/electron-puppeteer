# electron-puppeteer

这是一个将electron与puppeteer结合的项目，功能是类似于注册机之类的，并综合爬虫操作，当时靠这个卖钱了

## 技术栈

Vue2 + Electron + Puppeteer + element-ui + umy-ui

使用vue-cli-plugin-electron-builder插件将Vue项目扩展为electron项目
也可以使用simulatedgreg/electron-vue初始化项目，只是这个包有点年头没更新了...


![微信图片编辑_20230517225955](https://github.com/lovelyJason/electron-puppeteer/assets/50656459/c92d16e2-e92f-421b-82c1-d66a2eca9a62)

主要有一些使用经验：
- electron的基础使用，包括主进程和渲染进程之间的通信等
- 反爬虫机制和爬虫自动化操作
- 如何模拟网页操作以及如何解决登录验证之类的问题
- 接口拦截，网页注入等hack操作


## Project setup
```
npm install
```
chromium程序过大，可能要配置镜像下载

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

### Lints and fixes files
```
npm run lint
```

