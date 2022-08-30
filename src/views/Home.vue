<template>
  <div class="home clearfix">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <!-- <el-tabs v-model="tab" type="card"> -->
      <!-- <el-tab-pane label="用户管理" name="first"> -->
        <div style="margin-bottom: 8px">
          <a href="javascript:void(0)" style="color: #42b983" @click="jump"
            >选择浏览器路径</a
          >
        </div>
        <div style="display: flex;">
          <div class="left">
            <div class="section">
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
                <el-form-item class="text-left" label="是否篡改余额">
                  <el-checkbox v-model="checked"></el-checkbox>
                  <span style="margin-left: 12px;color: #f72525;;">谨慎！除非你知道做什么</span>
                </el-form-item>
                <el-form-item v-if="checked" class="text-left flex" label="余额">
                  <el-input v-model="balanceNum"></el-input>
                </el-form-item>
                <el-form-item class="text-left flex" label="频率">
                  <el-input v-model="executionFrequency"></el-input>
                  <span style="margin-left: 10px;">毫秒</span>
                </el-form-item>
                <div class="btns-wrapper">
                  <el-button
                    type="primary"
                    @click="startPuppeteer"
                    v-loading="loadBrowser"
                  >
                    {{ startText }}
                  </el-button>
                  <!-- <el-button
                    v-if="isDev"
                    type="primary"
                    @click="debug"
                  >
                    debug
                  </el-button> -->
                  <el-button
                    type="danger"
                    @click="stopTask"
                  >
                    停止
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>
          <div class="right">
            <div class="section">
              <el-form label-width="120px" :model="form" ref="ruleForm" :rules="rules">
                <el-form-item class="text-left flex" label="案件名称" prop="patentName">
                  <el-input v-model="form.patentName"></el-input>
                </el-form-item>
                <el-form-item class="text-left flex" label="申请主体" prop="applyCompanyId">
                  <el-select ref="applyCompany" v-model="form.applyCompanyId" placeholder=""  @change="onApplyCompanyChange">
                    <el-option label="江苏瑞耀纤维科技有限公司" value="aba8a1af48dc423cb74b98ee2766ac31"></el-option>
                    <el-option label="无锡维邦工业设备成套技术有限公司" value="3f99d86ac20845a785983f63b14c08da"></el-option>
                    <el-option label="仪征市龙港机械制造有限公司" value="c8ab5aa31190414088fff2a1ea13892a"></el-option>
                    <el-option label="创志科技（江苏）股份有限公司" value="a156798510c34539a4f67785895fe6ea"></el-option>
                    <el-option label="常州江苏大学工程技术研究院" value="02ab8a2756234cce9f01107494e53de5"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item class="text-left flex" label="联系方式" prop="appointPhone">
                  <el-input v-model="form.appointPhone"></el-input>
                </el-form-item>
                <el-form-item class="text-left flex" label="专利类型" prop="typeCode">
                  <el-select v-model="form.typeCode" placeholder="" ref="type">
                    <el-option label="发明" value="1"></el-option>
                    <el-option label="实用新型" value="2"></el-option>
                    <el-option label="外观设计" value="3"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item class="text-left flex" label="分类号" prop="applyClassifyCode">
                  <el-input v-model="form.applyClassifyCode"></el-input>
                </el-form-item>
                <el-form-item class="text-left flex" label="预约时间" prop="orderSubmitTime">
                  <el-input v-model="form.orderSubmitTime" placeholder="格式如：2022-08-29"></el-input>
                </el-form-item>
              </el-form>
            </div>

          </div>
        </div>
        <div class="section operation-row">
          <div class="btn btn-add">增加账号cookies</div>
          <div class="btn start" @click="start">开始</div>
          <div class="btn stop"  @click="stopTask">停止</div>
        </div>
        <div class="log-wrapper">
          <div class="operate-log">
            <div class="header">操作日志</div>
            <div class="content" id="logContent">
              <ul>
                <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
              </ul>
            </div>
          </div>

        </div>
        <div class="footer">
          <check-update class="check-update"></check-update>
          <router-link to="/changelog" class="update-log-a">
            <div class="update-log"><i  style="margin-right: 6px;" class="el-icon-chat-line-round"></i>更新日志</div>
          </router-link>

        </div>
      <!-- </el-tab-pane> -->
      <!-- <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane> -->
    <!-- </el-tabs> -->
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import CheckUpdate from './CheckUpdate'
import $ from 'jquery'
const { ipcRenderer, clipboard } = require('electron')

export default {
  name: 'Home',
  components: {
    CheckUpdate
  },
  data () {
    return {
      tab: 'first',
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
      startText: '启动浏览器',
      hasData: false,
      count: 0,
      tableData: [],
      dataLength: 0,
      stopApp: false,
      pageJumpCount: 0,
      puppeteerPageUrl: '',
      recordSearchSuccess: false,
      logs: [
        '使用步骤：',
        '本工具依然是看脸,不过可以比普通人同时多看几次脸',
        '1.启动浏览器，拖动滑块登陆过可以在网页中操作，这是抢购方式一，爬虫操作，速度较慢，继续往下',
        '2.在本客户端输入表单信息，或者在网页输入，会自动同步到此，预约时间你选任意合法格式',
        '3.点击《开始》按钮，会直接提交数据，不经过网页端，但也可能会失败，只要失败一次，不会再继续了，你也可以手动疯狂点击开始按钮并发请求，也可以借用按键精灵模拟秒杀'
      ],
      checked: false,
      balanceNum: 500,
      executionFrequency: 500,
      form: {
        patentName: '',
        applyCompanyId: '',
        // applyCompanyName: '',
        appointPhone: '',
        typeCode: '1',
        applyClassifyCode: '',
        orderSubmitTime: ''
      },
      rules: {
        patentName: [{ required: true, message: '请输入专利名称', trigger: 'blur' }],
        applyCompanyId: [{ required: true, message: '请选择申请主体', trigger: 'change' }],
        appointPhone: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
        typeCode: [{ required: true, message: '请选择专利类型', trigger: 'change' }],
        applyClassifyCode: [{ required: true, message: '请输入分类号', trigger: 'blur' }],
        orderSubmitTime: [
          { required: true, message: '请输入预约时间', trigger: 'blur' },
          { pattern: /^((((19|20)\d{2})-(0?[13-9]|1[012])-(0?[1-9]|[12]\d|30))|(((19|20)\d{2})-(0?[13578]|1[02])-31)|(((19|20)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|((((19|20)([13579][26]|[2468][048]|0[48]))|(2000))-0?2-29))$/, message: '请输入正确格式', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isDev () {
      return process.env.NODE_ENV === 'development'
    }
  },
  methods: {
    addRipple (e) {
      const overlay = $('<span></span>')
      const x = e.clientX - e.target.offsetLeft
      const y = e.clientY - e.target.offsetTop
      overlay.css(
        {
          left: x + 'px',
          top: y + 'px'
        }
      )
      $(this).append(overlay)
      setTimeout(() => {
        overlay.remove()
      }, 500)
    },
    onApplyCompanyChange () {
      this.$nextTick(() => {
        console.log(this.$refs.applyCompany.selectedLabel)
      })
    },
    async getUsers () {
      const users = await ipcRenderer.invoke('get-users')
      console.log(users)
      if (users && users.length) {
        const user = users[0]
        this.username = user.username
        this.password = user.password
      }
    },
    async getFormData () {
      await ipcRenderer.invoke('get-form')
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
    start () {
      // this.addRipple()
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          const { patentName, applyCompanyId, appointPhone, typeCode, applyClassifyCode, orderSubmitTime } = this.form
          const formData = {
            patentName,
            appId: 'yushen',
            applyFieldId: '3887f4dbf7fe4097903ce8055ba24496', // 以下三个一体 hardcode
            applyFieldCode: '2', // hardcode
            applyFieldName: '新型功能和结构材料', // hardcode
            applyCompanyId,
            applyCompanyName: this.$refs.applyCompany.selectedLabel,
            appointPhone,
            typeCode,
            typeText: this.$refs.type.selectedLabel,
            applyClassifyCode,
            orderSubmitTime,
            executionFrequency: Number.parseInt(this.executionFrequency)

          }
          console.log(formData)
          ipcRenderer.send('submit', formData)
        }
      })
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
    }, 1000)
    ipcRenderer.on('log', (event, ans) => {
      this.logs.push(ans)
    })
    ipcRenderer.on('get-form', (event, ans) => {
      for (const key in ans) {
        const v = ans[key]
        this.form[key] = v
      }
    })
    ipcRenderer.on('closePage', (event, ans) => {
      console.log('page closed')
      this.openBowser = false
      this.startText = '一键启动'
    })
    ipcRenderer.on('message', (event, ans) => {
      this.$message({
        type: 'success',
        message: ans
      })
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
  @keyframes blink {
    to {
      height: 400px;
      opacity: 0;
    }
  }
  height: calc(~"100% - 44px");
  .left, .right {
    width: 50%;
    // height: 100%;
    float: left;
    margin: 0 8px 12px;
    padding: 6px 8px 10px;
    border: 1px solid #ebeef5;

  }
  .right {
    .section {
      height: 100%;
    }
    .el-form-item {
      margin-bottom: 12px !important;
      .el-form-item__content {
        width: 280px !important;
        margin-left: 60px !important;
        > * {
          width: 100% !important;
        }
    }
      }
    tbody {
      tr {
        &:first-child {
          background-color: #f0f9eb;
        }
      }
    }
  }
  .card {
    margin: 0 8px 12px;
    padding: 6px 8px 0;
    border: 1px solid #ebeef5;
  }
  .section {
    width: 90%;
    // margin: 0 8px 12px;
    // padding: 6px 8px 0;
    input {
      height: 30px;
    }
    .el-form-item {
      margin-bottom: 8px;
      .el-form-item__content {
        display: flex;
        .el-input {
          width: 100%;
        }
        .el-select {
          width: 100%;
          .el-input {
            width: 100%;
          }
        }
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
  .operation-row {
    display: flex;
    width: calc(~"100% - 16px");
    margin: 0 8px 12px;
    border: 1px solid #ebeef5;
    .btn {
      position: relative;
      // background: linear-gradient(90deg, #0bc7f1, #c471ed);
      display: inline-block;
      width: 33%;
      border: 1px solid #ccc;
      margin: 2px;
      &.overlay {
        position: absolute;
        height: 400px;
        width: 400px;
        background-color: #fff;
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        opacity: .5;
        animation: blink .5s linear infinite;
      }
      &:hover {
        background-color: #65acca52;
      }
    }
  }
  .btns-wrapper {
    display: flex;
    position: absolute;

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
  .log-wrapper {
    width: calc(~"100% - 16px");
    height: 220px;
    margin: 0 8px 12px;
    border: 1px solid #ebeef5;
    .operate-log {
      width: 100%;
      height: 100%;
      min-height: 160px;
      text-align: left;
      font-size: 14px;
      overflow-y: scroll;
      user-select: text;
      -moz-user-select: text;
      -webkit-touch-callout: text;
      -webkit-user-select: text;
      -khtml-user-select: text;
      .header {
        padding: 8px;
        border-bottom: 1px dashed#ebeef5;
      }
      #logContent {
        padding-top: 6px;
        li {
          margin-top: 8px;
        }
      }
    }
  }
  .footer {
    position: fixed;
    width: 100%;
    bottom: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    .update-log-a {
      width: 86px;
      height: 24px;
      text-decoration: none;
      margin-left: 8px;
    }
  }
  .update-log {
    cursor: pointer;
    color: #26b1e7;
  }
}
</style>
