<template>
  <div class="home clearfix">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <el-tabs v-model="tab" type="card">
      <el-tab-pane label="参数设置" name="first">
        <div style="margin-bottom: 8px">
          <a href="javascript:void(0)" style="color: #42b983" @click="jump"
            >选择浏览器路径</a
          >
        </div>
        <div style="display: flex;">
          <div class="left">
            <div class="section">
              <span>选择账号(导入cookie可以不用启动浏览器)</span>
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
                    <el-col class="line" :span="2" style="text-align: center">-</el-col>
                    <el-col :span="11">
                      <el-input v-model="password" placeholder="密码"></el-input>
                    </el-col>
                  </el-row>
                </el-form-item>
                <!-- <el-form-item class="text-left" label="是否篡改余额">
                  <el-checkbox v-model="checked"></el-checkbox>
                  <span style="margin-left: 12px;color: #f72525;;"></span>
                </el-form-item> -->
                <el-form-item v-if="checked" class="text-left flex" label="余额">
                  <el-input v-model="balanceNum"></el-input>
                </el-form-item>
                <el-form-item class="text-left flex" label="频率">
                  <template slot="label">
                    <span style="margin-right: 6px;">频率</span>
                    <el-tooltip effect="light" content="10点59分59秒会自动开启任务，300毫秒提交一次，因为接口的往返时间大概在200ms以上，请求五次或者有一条成功的便会自动结束" placement="bottom">
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip>
                  </template>
                  <el-input disabled v-model="executionFrequency"></el-input>
                  <span style="margin-left: 10px;">毫秒</span>
                </el-form-item>
                <div class="btns-wrapper">
                  <el-button
                    type="primary"
                    @click="startPuppeteer"
                    v-loading="browserLoading"
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
                    停止浏览器
                  </el-button>
                  <el-button
                    v-if="isDev"
                    type="primary"
                    @click="destroySoft"
                  >
                    销毁
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>
          <div class="right">
            <div class="section">
              <span>参数设置（修改完及时保存）</span>
              <el-form label-width="100px">
                <el-form-item>
                  <template slot="label">
                    <span style="margin-right: 6px;">执行上限</span>
                    <el-tooltip effect="light" content="同一个单据最多可并发执行的次数，如果是串行模式下，最多只会成功预约一次" placement="bottom">
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip>
                  </template>
                  <el-input v-model="execution.limit"></el-input>
                </el-form-item>
                <el-form-item>
                  <template slot="label">
                    <span style="margin-right: 6px;">线程数量</span>
                    <!-- <el-tooltip effect="light" content="同一个单据最多可并发执行的次数" placement="bottom">
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip> -->
                  </template>
                  <el-input disabled v-model="execution.threadCount"></el-input>
                </el-form-item>
                <el-form-item v-if="execution.model === 2">
                  <template slot="label">
                    <span style="margin-right: 6px;">执行频率</span>
                    <el-tooltip effect="light" content="同一个单据循环执行的时间间隔" placement="bottom">
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip>
                  </template>
                  <el-input v-model="execution.executionFrequency"></el-input>
                  <span style="display: inline-block;width: 40px;margin-left: 10px;">毫秒</span>
                </el-form-item>
                <el-form-item>
                  <template slot="label">
                    <span style="margin-right: 6px;">模式</span>
                    <el-tooltip effect="light" placement="bottom">
                      <div slot="content">
                        <ul>
                          <li>串行：等待当前单据预约成功或者失败，才会开始预约下一个</li>
                          <li>并行：会对当前所有的单据列表，以设定频率循环按顺序执行，执行完最后一个时再从头执行</li>
                          <br />
                          两种方案各有取舍，自行测试
                        </ul>

                      </div>
                      <i class="el-icon-warning-outline"></i>
                    </el-tooltip>
                  </template>
                  <el-radio-group v-model="execution.model">
                    <el-radio :label="1">串行</el-radio>
                    <el-radio :label="2">并行</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>

            </div>

          </div>
        </div>
        <div class="section operation-row">
          <div class="btn btn-add" @click="addCookies">增加账号cookies</div>
          <div class="btn" @click="saveParams">保存参数</div>
          <div class="btn start" @click="start">开始</div>
          <div class="btn stop"  @click="stopTask">停止</div>
        </div>
        <div class="log-wrapper">
          <div class="operate-log">
            <div class="header">操作日志
              <el-tooltip effect="light" placement="bottom">
                <div slot="content">
                  完整日志见：
                  <br />
                  {{ logPath }}
                </div>
                <i class="el-icon-warning-outline"></i>
              </el-tooltip>
              <span @click="openLog" style="margin-left: 8px;color: #409EFF;cursor: pointer;">打开</span>
            </div>
            <div class="content" id="logContent">
              <ul>
                <li v-for="(log, index) in logs" :key="index">{{ log }}</li>
              </ul>
              <span class="clear-log" @click="logs = []">清空</span>
            </div>
          </div>

        </div>
        <div class="footer">
          <!-- <check-update class="check-update"></check-update> -->
          <router-link to="/changelog" class="update-log-a">
            <div class="update-log"><i  style="margin-right: 6px;" class="el-icon-chat-line-round"></i>更新日志</div>
          </router-link>
          <span class="ip">
            <span>IP: {{ ip }}</span>
            <i style="margin-left: 6px;" class="el-icon-circle-check"></i>
          </span>

        </div>
      </el-tab-pane>
      <el-tab-pane label="增加单据" name="second">
        <el-button type="primary" @click="caseFormType = 'add';caseFormVisible = true">新增单据</el-button>
        <el-button type="primary" @click="openConfig">导入/编辑单据</el-button>
        <el-table :data="tableData" border style="width: 100%;margin-top: 12px;margin-bottom: 12px;">
          <el-table-column prop="patentName" label="案件名称" width="110">
          </el-table-column>
          <el-table-column prop="applyCompanyName" label="申请主体" width="110">
          </el-table-column>
          <el-table-column prop="appointPhone" label="联系方式" width="110"> </el-table-column>
          <el-table-column prop="typeText" label="专利类型" width="60"> </el-table-column>
          <el-table-column prop="applyClassifyCode" label="分类号" width="58"> </el-table-column>
          <el-table-column prop="orderSubmitTime" label="预约时间" width="100"> </el-table-column>
          <el-table-column label="预约时间" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" @click="editCase(scope.row, scope.$index)">编辑</el-button>
              <el-button type="danger" @click="deleteCase(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>
      <el-tab-pane label="使用步骤" name="third">
        <ul>
          本程序不区分事务所版，企业版，原理都是一样<br />
          使用步骤：
          <li>本工具依然是看脸,不过可以比普通人同时多看几次脸</li>
          <li>1.启动浏览器，拖动滑块登陆过可以在网页中操作，这是抢购方式一，爬虫操作，速度较慢，继续往下</li>
          <li>2.在本客户端输入表单信息，或者在网页输入，会自动同步到此，预约时间你选任意合法格式</li>
          <li>3.点击《开始》按钮，会直接并发提交数据，不经过网页端，但也可能会失败;如果失败原因是网络错误，网站崩溃,会继续执行直到有结果；如果失败原因是余额不足等错误，会继续按照执行频率循环执行，直到达到你设置的执行上限则结束运行</li>
          <li>如果任务启动后卡住不动没有输出日志，大概率是504，省局崩溃</li>
          <li>串行/并行模式：串行是等待第一个案子预约结果成功或失败才会开启下一轮，并行是单张或多张单据按照设定的频率即时间间隔循环执行；建议填写多张单据，并在放号之前1到2秒开始执行，并控制好次数，没到放号之前的请求必然是无效；填写多张单据时，执行任务会轮流提交不同的案子，减少相同案子重复预约成功的概率。<span style="color: #bb7373;">不管是串行或者并行，建议填写多个案子，并选择不同日期，提高不同日期的预约成功率，同时，只要有一个预约成功，会即可终止任务，但是不代表并行模式下只会成功一个！！！</span></li>
          <br />
          待开发功能：
          <li>1.执行中如果发现执行结束后仍然未发现有余额，则自动切换日期</li>
          <li>2.目前串行模式最多只会成功预约上一个，先看看效果</li>
          <li>3.将来支持多cookies导入，同一次可登录多账号操作</li>
        </ul>
      </el-tab-pane>
    </el-tabs>
    <el-dialog
      title=""
      :visible.sync="caseFormVisible"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :center="true"
      :before-close="handleClose"
    >
      <el-form class="order-form" label-width="120px" :model="caseForm" ref="ruleForm" :rules="rules">
        <el-form-item class="text-left flex" label="案件名称" prop="patentName">
          <el-input v-model="caseForm.patentName"></el-input>
        </el-form-item>
        <el-form-item class="text-left flex" label="申请主体" prop="applyCompanyId">
          <el-select filterable ref="applyCompany" placeholder="打开预约网页自动抓取列表" v-model="caseForm.applyCompanyId"  @change="onApplyCompanyChange">
            <!-- <el-option label="江苏瑞耀纤维科技有限公司" value="aba8a1af48dc423cb74b98ee2766ac31"></el-option>
            <el-option label="无锡维邦工业设备成套技术有限公司" value="3f99d86ac20845a785983f63b14c08da"></el-option>
            <el-option label="仪征市龙港机械制造有限公司" value="c8ab5aa31190414088fff2a1ea13892a"></el-option>
            <el-option label="创志科技（江苏）股份有限公司" value="a156798510c34539a4f67785895fe6ea"></el-option>
            <el-option label="常州江苏大学工程技术研究院" value="02ab8a2756234cce9f01107494e53de5"></el-option> -->
            <el-option
              v-for="company in companyList"
              :key="company.value"
              :label="company.label"
              :value="company.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="text-left flex" label="联系方式" prop="appointPhone">
          <el-input v-model="caseForm.appointPhone"></el-input>
        </el-form-item>
        <el-form-item class="text-left flex" label="专利类型" prop="typeCode">
          <el-select v-model="caseForm.typeCode" placeholder="" ref="type">
            <!-- <el-option label="发明" value="1"></el-option>
            <el-option label="实用新型" value="2"></el-option>
            <el-option label="外观设计" value="3"></el-option> -->
            <el-option
              v-for="company in typeList"
              :key="company.value"
              :label="company.label"
              :value="company.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="text-left flex" label="分类号" prop="applyClassifyCode">
          <el-input v-model="caseForm.applyClassifyCode"></el-input>
        </el-form-item>
        <el-form-item class="text-left flex" label="预约时间" prop="orderSubmitTime">
          <!-- <el-input v-model="caseForm.orderSubmitTime" placeholder="格式如：2022-08-29"></el-input> -->
          <el-date-picker
            v-model="caseForm.orderSubmitTime"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="setCase">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
// import CheckUpdate from './CheckUpdate'
import path from 'path'
const { ipcRenderer, clipboard, remote } = require('electron')

export default {
  name: 'Home',
  components: {
    // CheckUpdate
  },
  data () {
    return {
      tab: 'first',
      threadCount: 1,
      height: 280,
      rowHeight: 50,
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
      browserLoading: false,
      startText: '启动浏览器',
      hasData: false,
      count: 0,
      dataLength: 0,
      stopApp: false,
      pageJumpCount: 0,
      puppeteerPageUrl: '',
      recordSearchSuccess: false,
      logs: [

      ],
      checked: false,
      balanceNum: 500,
      executionFrequency: 300,
      execution: {
        limit: 5,
        threadCount: 1,
        executionFrequency: 500,
        model: 2
      },
      // 案子列表
      tableData: [],
      caseFormVisible: false,
      caseForm: {
        patentName: '',
        applyCompanyId: '',
        // applyCompanyName: '',
        appointPhone: '',
        typeCode: '',
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
      },
      cookies: '',
      caseFormType: 'add',
      editCaseFormIdex: '0',
      ip: '',
      inWhitelist: false,
      companyList: [],
      typeList: [],
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now()
        }
      }
    }
  },
  computed: {
    isDev () {
      return process.env.NODE_ENV === 'development'
    },
    logPath () {
      return path.resolve(remote.getGlobal('STORE_PATH'), './logs/main.log')
    }
  },
  methods: {
    addCookies () {
      const cookies = this.cookies
      this.$prompt('请输入cookies', '提示', {
        confirmButtonText: '确定',
        inputValue: cookies,
        inputType: 'textarea',
        closeOnClickModal: false,
        closeOnPressEscape: false,
        inputPlaceholder: '格式为front_bpm.session.id=xxx; JSESSIONID=xxx\n如何设置，参考http://cdn.qdovo.com/doudou.gif',
        customClass: 'cookies-prompt'
      }).then(({ value }) => {
        ipcRenderer.invoke('setData', [{
          key: 'cookies',
          value: value
        }])
        this.getData()
      })
    },
    destroySoft () {
      ipcRenderer.invoke('destroy')
    },
    async deleteCase (index) {
      await ipcRenderer.invoke('delete-case', index)
      this.getData()
    },
    async editCase (record, index) {
      this.caseFormType = 'edit'
      this.caseFormVisible = true
      this.caseForm = JSON.parse(JSON.stringify(record))
      this.editCaseFormIdex = index
    },
    openConfig () {
      this.$message({
        type: 'success',
        message: '如果打不开您可自行编辑，配置文件地址：' + remote.getGlobal('CONFIG_PATH'),
        duration: 5000
      })
      ipcRenderer.invoke('open-config')
    },
    setCase () {
      console.log(this.caseForm)
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          const { patentName, applyCompanyId, appointPhone, typeCode, applyClassifyCode, orderSubmitTime } = this.caseForm
          console.log(patentName)
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
          if (this.caseFormType === 'add') {
            this.tableData.push({ ...formData })
          } else {
            this.$set(this.tableData, this.editCaseFormIdex, formData)
          }
          this.caseFormVisible = false
          ipcRenderer.invoke('setData', [{
            key: 'caseList',
            value: this.tableData
          }])
        }
      })
    },
    handleClose () {
      this.caseFormVisible = false
      this.$refs.ruleForm.clearValidate()
    },
    onApplyCompanyChange () {
      this.$nextTick(() => {
        console.log(this.$refs.applyCompany.selectedLabel)
      })
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
    async saveParams () {
      try {
        const executionParams = {
          executionFrequency: Number.parseInt(this.execution.executionFrequency),
          threads: Number.parseInt(this.execution.threadCount),
          limit: Number.parseInt(this.execution.limit),
          model: Number.parseInt(this.execution.model)
        }
        const res = await ipcRenderer.invoke('set-execution-params', executionParams)
        if (res) {
          this.$message({
            type: 'success',
            message: '保存成功'
          })
        }
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.message
        })
      }
    },
    async start () {
      // this.addRipple()
      if (!(this.tableData && this.tableData.length)) {
        this.$message({
          type: 'error',
          message: '请编写单据先'
        })
        return
      }
      this.$message({
        type: 'success',
        message: '开始执行，请稍后'
      })
      const formDataList = this.tableData && this.tableData.length ? this.tableData : []
      // const { patentName, applyCompanyId, applyCompanyName, appointPhone, typeCode, typeText, applyClassifyCode, orderSubmitTime } = caseForm
      // const formData = {
      //   patentName,
      //   appId: 'yushen',
      //   applyFieldId: '3887f4dbf7fe4097903ce8055ba24496', // 以下三个一体 hardcode
      //   applyFieldCode: '2', // hardcode
      //   applyFieldName: '新型功能和结构材料', // hardcode
      //   applyCompanyId,
      //   applyCompanyName,
      //   appointPhone,
      //   typeCode,
      //   typeText,
      //   applyClassifyCode,
      //   orderSubmitTime
      // }
      formDataList.forEach((item) => {
        item.appId = 'yushen'
        item.applyFieldId = '3887f4dbf7fe4097903ce8055ba24496'
        item.applyFieldCode = '2'
        item.applyFieldName = '新型功能和结构材料'
      })
      const { code, msg, message } = await ipcRenderer.invoke('submit', formDataList) || {}
      if (code === 0) {
        this.$message({
          type: 'success',
          message: msg || message
        })
      } else {
        this.$message({
          type: 'error',
          message: msg || message || '系统异常'
        })
      }
    },
    loadBrowser () {
      if (this.testEmpty(this.username) || this.testEmpty(this.password)) {
        this.$message({
          type: 'error',
          message: '请先输入账号和密码'
        })
        return
      }
      // if (this.openBowser) {
      //   this.restore()
      //   return
      // }
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
      // this.startText = '恢复启动'
    },
    startPuppeteer () {
      if (this.cookies) {
        this.$confirm('系统检查到有cookies存在，过期之前不需要再登录了，是否仍要启动浏览器?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loadBrowser()
        })
      } else {
        this.loadBrowser()
      }
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
    },
    async getData () {
      try {
        this.ip = remote.getGlobal('ip')
        this.inWhitelist = remote.getGlobal('inWhitelist')
        const data = await ipcRenderer.invoke('getData', ['users', 'cookies', 'caseList'])
        const [users, cookies, caseList] = data
        if (users && users.length) {
          const user = users[0]
          this.username = user.username
          this.password = user.password
        }
        this.tableData = caseList
        this.cookies = cookies
      } catch (error) {
        console.log('出错了', error)
        this.$message({
          type: 'error',
          messag: error.message
        })
      }
    },
    openLog () {
      ipcRenderer.invoke('openLog')
    }
  },
  created () {
  },
  async mounted () {
    console.log('home mounted')
    setTimeout(async () => {
      this.getData()
    }, 1000)
    ipcRenderer.on('setForm', (event, ans) => {
      if (typeof ans === 'object' && ans != null) {
        for (const key in ans) {
          this[key] = ans[key]
        }
        if (!this.caseForm.typeCode) {
          this.caseForm.typeCode = this.typeList.length ? this.typeList[0].value : ''
        }
      }
    })
    ipcRenderer.on('log', (event, ans) => {
      this.logs.push(ans)
    })
    ipcRenderer.on('setCookies', (event, ans) => {
      this.cookies = ans
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
    ipcRenderer.on('message', (event, ans) => {
      console.log('出错了', ans)
      const { type, message } = ans
      this.$message({
        type,
        message
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
  padding: 0 10px;
  .left {
    min-height: 220px;
    margin-right: 10px;
  }
  .left, .right {
    width: 50%;
    margin-bottom: 10px;
    // height: 100%;
    float: left;
    // margin: 0 8px 12px;
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
        // width: 280px !important;
        margin-left: 60px !important;
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
    text-align: center;
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
    align-items: center;
    margin-top: 20px;
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
    position: relative;
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
        height: 100%;
        padding-top: 6px;
        li {
          margin-top: 8px;
        }
      }
      .clear-log {
        position: absolute;
        cursor: pointer;
        bottom: 16px;
        right: 36px;
        color: #d2cbcb;
      }
    }
  }
  .footer {
    position: fixed;
    width: calc(~"100% - 20px");
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
    .ip {
      position: absolute;
      right: 0;
      color: rgb(182, 177, 177);
      font-size: 14px;
    }
  }
  .update-log {
    cursor: pointer;
    color: #26b1e7;
  }
  .order-form {
    .el-form-item__label {
      text-align: left;
    }
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
  }
  /deep/ .el-radio-group {
    display: flex;
    height: 40px;
    line-height: 40px;
    align-items: center;
  }

}
</style>
