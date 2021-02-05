<template>
  <div class="select-browser">
    <div style="margin-bottom: 10px;">输入你的浏览器路径</div>
    <br />
    <el-input :clearable="true" v-model="path" placeholder="输入浏览器路径,如C:\Program Files\Google\Chrome\Application\chrome.exe"></el-input>
    <el-button type="primary" @click="onConfirmClick">确定</el-button>
    <br />
    <div class="describe">
      不支持杂牌浏览器,请使用原装chrome
    </div>
    <div style="width: 398px;margin: 0 auto;">
      另外,如果使用我提供的浏览器,确保resources/app.asar.unpacked/.local-chromium/win64-818858/chrome-win/chrome.exe存在;或者你可以把文件路径填充到以上文本框也可
    </div>
    <br />
    <div class="bg"></div>
    <el-button class="back-home" type="success" @click="backHome">返回</el-button>
  </div>
</template>

<script>
const { ipcRenderer, remote } = require('electron')
// 只会执行一次,后续再进来时不会再执行

console.log(remote)

export default {
  data () {
    return {
      path: ''
    }
  },
  methods: {
    backHome () {
      this.$router.push('/')
    },
    onConfirmClick () {
      const path = this.path.trim()
      if (!path) {
        this.$message({
          type: 'success',
          message: '路径已恢复默认状态'
        })
      } else {
        this.$message({
          type: 'success',
          message: '路径添加成功,即将从该路径下寻找chrome浏览器'
        })
      }
      ipcRenderer.send('setPath', path)
    }
  },
  mounted () {
    console.log('browserpath mounted')
    const browserPath = remote.getGlobal('browserPath')
    this.path = browserPath
  },
  watch: {
    path (value) {
      this.$store.commit('editPath', value)
    }
  }
}
</script>

<style lang="less" scoped>
  .select-browser {
    height: calc(~"100% - 44px");
    position: relative;
  }
  .el-input {
    width: 500px;
    margin-bottom: 8px;
    margin-right: 6px;
  }
  .describe {
    width: 500px;
    margin-bottom: 20px;
    color: rgb(206, 134, 134);
  }
  .bg {
    width: 100%;
    height: calc(~"100% - 269px");
    background: url('https://tva1.sinaimg.cn/large/0072Vf1pgy1foxkiztofjj31hc0u07g2.jpg') no-repeat center;
    background-size: cover;
  }
  .back-home {
    position: absolute;
    bottom: 10px;
  }
</style>
