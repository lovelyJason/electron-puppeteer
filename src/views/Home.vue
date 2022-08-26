<template>
  <div class="home clearfix">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div class="left">
      <div style="margin-bottom: 8px">
        <a href="javascript:void(0)" style="color: #42b983" @click="jump"
          >选择浏览器路径</a
        >
      </div>
      <div class="account section">
        <span>选择账号</span>
        <el-form ref="form" >
          <el-form-item>
            <el-row>
              <el-col :span="11">
                <el-input v-model="username" placeholder="账号"></el-input>
                <!-- <el-autocomplete
                  class="inline-input"
                  v-model="state"
                  :fetch-suggestions="querySearch"
                  placeholder="请输入账号名"
                  @select="handleSelect"
                ></el-autocomplete> -->
              </el-col>
              <el-col class="line" :span="2">-</el-col>
              <el-col :span="11">
                <el-input v-model="password" placeholder="密码"></el-input>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item class="text-left" label="是否篡改预约量">
            <el-checkbox v-model="checked"></el-checkbox>
            <span style="margin-left: 12px;color: #f72525;;">谨慎！除非你知道做什么</span>
          </el-form-item>
          <el-form-item class="text-left flex" label="余额">
            <el-input v-model="balanceNum"></el-input>
          </el-form-item>
          <el-form-item class="text-left flex" label="频率">
            <el-input v-model="executionFrequency"></el-input>
            <span style="margin-left: 10px;">毫秒</span>
          </el-form-item>
        </el-form>
      </div>
      <div class="btns-wrapper">
        <el-button
          type="primary"
          @click="startPuppeteer"
          v-loading="loadBrowser"
        >
          {{ startText }}
        </el-button>
        <el-button
          v-if="isDev"
          type="primary"
          @click="debug"
        >
          debug
        </el-button>
        <el-button
          type="danger"
          @click="stopTask"
        >
          停止
        </el-button>
      </div>
      <div class="remind">
        注意事项: <br />
        <ul>
          <li>
            不要连续点击恢复启动，先停止再恢复启动
          </li>
        </ul>
      </div>
    </div>
    <div class="right">
      <div class="operate-log">
        <div class="header">操作日志</div>
        <div class="content" id="logContent">
          <ul>
            <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
          </ul>
        </div>
      </div>
    </div>
    <check-update class="check-update"></check-update>
    <router-link to="/changelog">
      <div class="update-log"><i  style="margin-right: 6px;" class="el-icon-chat-line-round"></i>更新日志</div>
    </router-link>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import CheckUpdate from './CheckUpdate'
const { ipcRenderer, clipboard } = require('electron')

export default {
  name: 'Home',
  components: {
    CheckUpdate
  },
  data () {
    return {
      height: 280,
      rowHeight: 50,
      patentData: [],
      columns: Array.from({ length: 10 }, (_, idx) => {
        return {
          prop: 'address',
          id: idx,
          label: '地址' + idx,
          width: 200,
          showOverflow: true
        }
      }),
      state: '',
      users: [],
      username: '',
      password: '',
      options: [{ value: 0, label: '666' }],
      openBowser: false,
      loadBrowser: false,
      startText: '一键启动',
      hasData: false,
      count: 0,
      tableData: [],
      dataLength: 0,
      stopApp: false,
      pageJumpCount: 0,
      puppeteerPageUrl: '',
      recordSearchSuccess: false,
      logs: [],
      checked: false,
      balanceNum: 500,
      executionFrequency: 500
    }
  },
  computed: {
    isDev () {
      return process.env.NODE_ENV === 'development'
    }
  },
  methods: {
    async getUsers () {
      const users = await ipcRenderer.invoke('get-users')
      console.log(users)
      if (users && users.length) {
        const user = users[0]
        this.username = user.username
        this.password = user.password
      }
    },
    querySearch (queryString, cb) {
      const users = this.users
      console.log(users)
      const results = queryString
        ? users.filter(this.createFilter(queryString))
        : users
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      console.log(queryString)
      return (restaurant) => {
        console.log(restaurant)
        return (
          restaurant.username.indexOf(queryString) ===
          0
        )
      }
    },
    handleSelect () {

    },
    copy (text) {
      clipboard.writeText(text)
      this.$message({
        type: 'success',
        message: '已复制到剪切板'
      })
    },
    testEmpty (str) {
      if (str && str.trim()) return false
      return true
    },
    debug () {
      ipcRenderer.send('debug')
    },
    stopTask () {
      ipcRenderer.send('stopTask')
    },
    startPuppeteer () {
      if (this.testEmpty(this.username) || this.testEmpty(this.password)) {
        this.$message({
          type: 'error',
          message: '请先输入账号和密码'
        })
        return
      }
      if (this.openBowser) {
        this.restore()
        return
      }
      const options = {
        username: this.username,
        password: this.password,
        executionFrequency: Number.parseInt(this.executionFrequency)
      }
      if (this.checked) {
        options.balanceNum = this.balanceNum
      }
      ipcRenderer.send('start', options)
      this.openBowser = true
      this.startText = '恢复启动'
    },
    renderOperateLog () {
      // document.getElementById('logContent')
    },
    repeatSearch (applyNum) {
      // 同步,会堵塞渲染进程
      // const done = ipcRenderer.sendSync('search', applyNum)     // 有可能卡住,因为是同步的,会导致按钮点不了
      this.recordSearchSuccess = false
      ipcRenderer.send('search', applyNum)
    },
    restore () {
      this.$message({
        type: 'success',
        message: '准备好了,双手离开键盘'
      })
      ipcRenderer.send('restore', {
        executionFrequency: Number.parseInt(this.executionFrequency)
      })
    },
    jump () {
      this.$router.push('/path')
    }
  },
  created () {
    // this.getUsers()
  },
  mounted () {
    console.log('home mounted')
    setTimeout(() => {
      this.getUsers()
    }, 0)
    ipcRenderer.on('log', (event, ans) => {
      this.logs.push(ans)
      console.log(this.logs)
    })
    ipcRenderer.on('closePage', (event, ans) => {
      console.log('page closed')
      this.openBowser = false
      this.startText = '一键启动'
    })
    ipcRenderer.on('pageJump', (event, ans) => {
      const { pageJumpCount, url } = ans
      this.pageJumpCount = pageJumpCount
      this.puppeteerPageUrl = url
    })
    ipcRenderer.on('errorHandle', (event, ans) => {
      const { message } = ans
      console.log('全局错误', message)
      this.$message({
        type: 'error',
        message: message
      })
    })
  },
  beforeDestroy () {
    // 大坑,当出现页面跳转时,不卸载会重复监听
    ipcRenderer.removeAllListeners()
  }
}
</script>

<style lang="less">
.home {
  height: calc(~"100% - 44px");
  .left {
    width: 332px;
    height: 100%;
    float: left;
    .section {
      width: 90%;
      border: 1px solid #ebeef5;
      margin: 0 auto 12px;
      padding: 6px 8px 0;
      input {
        height: 30px;
      }
      .el-form-item {
        margin-bottom: 8px;
        .el-form-item__content {
          display: flex;
        }

        &.flex {
          display: flex;
          height: 40px;
          .el-input {
            width: 120px;
          }
        }
        &.text-left {
          text-align: left;
        }
      }
      .confirm-account {
        margin-bottom: 8px;
      }
    }
    .btns-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 36px;
      .el-button {
        width: 200px;
        margin-bottom: 8px;
        &:first-child {
          margin-left: 10px;
        }
      }
    }
    .remind {
      width: 200px;
      margin-left: 8px;
      margin-top: 8px;
      text-align: left;
      font-size: 14px;
    }
  }
  .right {
    float: left;
    width: 400px;
    height: 80%;
    position: relative;
    tbody {
      tr {
        &:first-child {
          background-color: #f0f9eb;
        }
      }
    }
    .operate-log {
      position: absolute;
      width: 100%;
      min-height: 160px;
      height: 100%;
      border: 1px solid #ebeef5;
      text-align: left;
      font-size: 14px;
      .header {
        padding: 8px;
        border-bottom: 1px dashed#ebeef5;
      }
      #logContent {
        height: calc(~"100% - 40px");
        overflow: scroll;
        padding-top: 6px;
        li {
          margin-top: 8px;
        }
      }
    }
  }
  .check-update {
    position: absolute;
    bottom: 50px;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
  .update-log {
    position: fixed;
    bottom: 10px;
    left: 50%;
    margin-left: -43px;
    cursor: pointer;
    color: #26b1e7;
  }
}
</style>
