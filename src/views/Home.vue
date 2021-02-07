<template>
  <div class="home clearfix">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div class="left">
      <div style="margin-bottom: 8px">
        <a href="javascript:void(0)" style="color: #42b983" @click="jump"
          >选择浏览器路径</a
        >
      </div>
      <div class="account">
        <span>选择账号</span>
        <el-form ref="form">
          <el-form-item>
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
          </el-form-item>
        </el-form>
      </div>
      <div class="btns-wrapper">
        <el-button
          type="primary"
          @click="startPuppeteer"
          v-loading="loadBrowser"
          >{{ startText }}</el-button
        >
        <el-button v-if="isDev" type="success" @click="debug">debug</el-button>
        <el-button type="danger" @click="onStopClick">停止</el-button>
        <el-button type="warning" @click="openDialog">导入excel</el-button>
      </div>
      <div class="remind">
        注意事项: <br />
        <ul>
          <li>
            一键启动后会自动帮你输入账号密码,但是图形验证码要你自己手动点,然后再回来点第一个按钮
          </li>
          <li>我将从你的表格第三行开始取数据,并在第九列之后添加查询结果</li>
        </ul>
      </div>
    </div>
    <div class="right">
      <!-- <el-table :data="patentData" style="width: 100%">
        <el-table-column prop="0" label="流水号">
        </el-table-column>
        <el-table-column prop="1" label="申请日期">
        </el-table-column>
        <el-table-column prop="applyNum" label="申请号"> </el-table-column>
        <el-table-column prop="3" label="发明名称"> </el-table-column>
        <el-table-column prop="4" label="申请人"> </el-table-column>
        <el-table-column prop="5" label="费用"> </el-table-column>
        <el-table-column prop="6" label="月份"> </el-table-column>
        <el-table-column prop="7" label="年份"> </el-table-column>
      </el-table> -->
      <u-table
        ref="plTable"
        :max-height="height"
        use-virtual
        showBodyOverflow="title"
        showHeaderOverflow="title"
        :row-height="rowHeight"
        border
        @row-click="onRowClick"
      >
        <u-table-column prop="number" label="流水号"> </u-table-column>
        <u-table-column prop="applyDate" label="申请日期"> </u-table-column>
        <u-table-column prop="applyNum" label="申请号" width="150">
        </u-table-column>
        <u-table-column prop="inventName" label="发明名称"> </u-table-column>
        <u-table-column prop="applyPerson" label="申请人"> </u-table-column>
        <u-table-column prop="fee" label="费用"> </u-table-column>
        <u-table-column prop="month" label="月份"> </u-table-column>
        <u-table-column prop="year" label="年份"> </u-table-column>
        <u-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="copy(scope.row.applyNum)"
              >复制</el-button
            >
          </template>
        </u-table-column>
        <!-- <u-table-column
          v-for="item in columns"
          :key="item.id"
          :resizable="item.resizable"
          :show-overflow-tooltip="item.showOverflow"
          :prop="item.prop"
          :label="item.label"
          :fixed="item.fixed"
          :width="item.width"
        /> -->
      </u-table>
      <div class="operate-log">
        <div class="header">操作日志</div>
        <div class="content" id="logContent"></div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
const { ipcRenderer, clipboard } = require('electron')

export default {
  name: 'Home',
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
      username: '13775637795',
      password: '1988909db，',
      options: [{ value: 0, label: '13775637795' }],
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
      recordSearchSuccess: false
    }
  },
  computed: {
    isDev () {
      return process.env.NODE_ENV === 'development'
    }
  },
  methods: {
    getUsers () {
      ipcRenderer.send('get-users')
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
    startPuppeteer () {
      if (this.testEmpty(this.username) || this.testEmpty(this.password)) {
        this.$message({
          type: 'error',
          message: '请先输入账号和密码'
        })
        return
      }
      if (this.openBowser) {
        this.resume()
        return
      }
      const { code } = ipcRenderer.sendSync('start', {
        username: this.username,
        password: this.password
      })
      if (code !== 0) {
        return
      }
      this.openBowser = true
      this.loadBrowser = true
      console.log('start up')
      setTimeout(() => {
        this.loadBrowser = false
        this.startText = '点我继续启动'
      }, 3000)
    },
    renderOperateLog (currentApplyNum) {
      const count = this.count
      const logContent = document.getElementById('logContent')
      const text = logContent.innerText
      logContent.innerText =
        text +
        `> 第${count}条数据${currentApplyNum}操作完成,正在保存数据并开始下一条...\n`
    },
    repeatSearch (applyNum) {
      // 同步,会堵塞渲染进程
      // const done = ipcRenderer.sendSync('search', applyNum)     // 有可能卡住,因为是同步的,会导致按钮点不了
      this.recordSearchSuccess = false
      ipcRenderer.send('search', applyNum)
    },
    resume () {
      // 检查是登录验证
      const isLoginPage =
        this.puppeteerPageUrl === 'http://cpquery.sipo.gov.cn/' ||
        this.puppeteerPageUrl === 'http://cpquery.sipo.gov.cn'
      if (isLoginPage) {
        const { flag, text } = ipcRenderer.sendSync('loginCheck')
        if (!flag) {
          this.$message({
            type: 'error',
            message: `${text}` || '哪里出问题了'
          })
          return
        }
      }
      // 检查是否上传文件
      if (!this.tableData.length) {
        this.$message({
          type: 'error',
          message: '请先上传excel'
        })
        return
      }
      this.$message({
        type: 'success',
        message: '准备好了,努力发射中,请放开你的双手'
      })
      const applyNum = this.tableData[0].applyNum
      this.repeatSearch(applyNum)
    },
    async debug () {
      if (!this.tableData.length) {
        this.$message({
          type: 'error',
          message: '请先上传excel'
        })
        return
      }
      const applyNum = this.tableData[0].applyNum
      this.repeatSearch(applyNum)
    },
    openDialog () {
      ipcRenderer.send('dialog')
    },
    setData (num, ans) {
      const that = this
      const data = Array.from({ length: num }, (_, idx) => {
        const record = ans[idx] || {}
        return {
          id: idx + 1,
          applyNum: record.applyNum,
          number: record.number,
          applyDate: record.applyDate,
          inventName: record.inventName,
          applyPerson: record.applyPerson,
          fee: record.fee,
          month: record.month,
          year: record.year
        }
      })
      // 大坑,此处ref没获取到,dom未加载完,还有个大坑,ipcRender要在页面注销前卸载监听
      that.$nextTick(() => {
        that.$refs.plTable.reloadData(data)
      })
    },
    onRowClick (row) {
      console.log(row)
    },
    onStopClick () {
      this.stopApp = true
      this.$message({
        type: 'success',
        message: '好的, 已经为您停止,请等待当前操作处理完'
      })
      // ipcRenderer.send('stop-search')
    },
    jump () {
      this.$router.push('/path')
    }
  },
  created () {
    this.getUsers()
  },
  mounted () {
    console.log('home mounted')
    ipcRenderer.on('get-users-success', (event, ans) => {
      const users = ans
      this.users = users
    })
    ipcRenderer.on('start-success', (event, ans) => {
      console.log(ans)
    })
    ipcRenderer.on('dialog-success', (event, ans) => {
      console.log('dialog success')
      // this.patentData = ans;
      const length = ans.length
      this.hasData = true
      this.dataLength = length
      this.tableData = ans
      this.setData(length, ans)
    })
    // 查询
    ipcRenderer.on('search-success', (event, ans) => {
      const { done, code } = ans
      if (done && code === 0) {
        // 更新表格数据和操作日志
        this.dataLength--
        this.count++
        const currentRow = this.tableData.shift()
        const currentApplyNum = currentRow && currentRow.applyNum
        const nextApplyNum = this.tableData[0] && this.tableData[0].applyNum
        this.setData(this.dataLength, this.tableData)
        this.renderOperateLog(currentApplyNum)
        this.recordSearchSuccess = true
        if (!this.stopApp) {
          this.repeatSearch(nextApplyNum)
        }
      }
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
  height: 490px;
  .left {
    width: 332px;
    height: 100%;
    float: left;
    .account {
      width: 90%;
      border: 1px solid #ebeef5;
      margin: 0 auto 12px;
      padding: 6px 8px 0;
      input {
        height: 30px;
      }
      .el-form-item {
        margin-bottom: 8px;
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
    width: 490px;
    height: 100%;
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
      width: 490px;
      min-height: 160px;
      margin-top: 50px;
      border: 1px solid #ebeef5;
      text-align: left;
      font-size: 14px;
      .header {
        padding: 8px;
        border-bottom: 1px dashed#ebeef5;
      }
      #logContent {
        padding-top: 6px;
      }
    }
  }
}
</style>
