<template>
  <div class="home clearfix">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div class="left">
      <div class="account">
        <span>选择账号</span>
        <el-form ref="form">
          <el-form-item>

            <el-col :span="11">
              <el-input v-model="username" placeholder="账号"></el-input>
            </el-col>
            <el-col class="line" :span="2">-</el-col>
            <el-col :span="11">
              <el-input v-model="password" placeholder="密码"></el-input>
            </el-col>
          </el-form-item>
        </el-form>
      </div>
      <div class="btns-wrapper">
        <el-button type="primary" @click="startPuppeteer" v-loading="loadBrowser">{{ startText }}</el-button>
        <el-button type="success" @click="debug">debug</el-button>
        <el-button type="danger">停止</el-button>
        <el-button type="warning" @click="dialog">导入excel</el-button>
      </div>
      <div class="remind">
        注意事项: <br />
        一键启动后会自动帮你输入账号密码,但是图形验证码要你自己手动点,然后再回来点第一个按钮
      </div>
    </div>
    <div class="right">
      <!-- <el-table :data="patentData" style="width: 100%">
        <el-table-column prop="0" label="流水号">
        </el-table-column>
        <el-table-column prop="1" label="申请日期">
        </el-table-column>
        <el-table-column prop="applicationNum" label="申请号"> </el-table-column>
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
      >
        <u-table-column label="流水号" prop="number"> </u-table-column>
        <u-table-column label="申请日期" prop="applyDate"> </u-table-column>
        <u-table-column prop="applicationNum" label="申请号" width="150">
        </u-table-column>
        <u-table-column prop="3" label="发明名称"> </u-table-column>
        <u-table-column prop="4" label="申请人"> </u-table-column>
        <u-table-column prop="5" label="费用"> </u-table-column>
        <u-table-column prop="6" label="月份"> </u-table-column>
        <u-table-column prop="7" label="年份"> </u-table-column>
        <u-table-column fixed="right" label="操作" width="150">
          <template>
            <el-button type="text" size="small">查看</el-button>
            <el-button type="text" size="small">编辑</el-button>
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
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
const { ipcRenderer } = require('electron')

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
      username: '13775637795',
      password: '1988909db，',
      openBowser: false,
      loadBrowser: false,
      startText: '一键启动'
    }
  },
  methods: {
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
      this.openBowser = true
      this.loadBrowser = true
      console.log('start up')
      ipcRenderer.send('start')
      setTimeout(() => {
        this.loadBrowser = false
        this.startText = '点我继续启动'
      }, 500)
    },
    resume () {
      const selectyzm = document.getElementById('selectyzm_text')
      console.log(selectyzm)
    },
    debug () {
      // ipcRenderer.send('debug')
      const remote = require('electron').remote
      const myRequire = remote.require
      const myPuppeteerPath = myRequire('path').resolve(remote.process.cwd(), './src/puppeteer')
      myRequire(myPuppeteerPath).getLoginVerify()
      // myRequire('./puppeteer')
    },
    dialog () {
      ipcRenderer.send('dialog')
    },
    setData (num, ans) {
      const that = this
      const data = Array.from({ length: num }, (_, idx) => {
        return {
          id: idx + 1,
          applicationNum: ans[idx].applicationNum,
          number: ans[idx].number,
          applyDate: ans[idx].applyDate
        }
      })
      that.$refs.plTable.reloadData(data)
    }
  },
  mounted () {
    ipcRenderer.on('startSuccess', (event, ans) => {
      console.log(ans)
    })
    ipcRenderer.on('dialogSuccess', (event, ans) => {
      // console.log(ans)
      // this.patentData = ans;
      const length = ans.length
      this.setData(length, ans)
    })
  }
}
</script>

<style lang="less">
.home {
  .left {
    width: 289px;
    float: left;
    .account {
      width: 90%;
      border: 1px solid #ebeef5;
      margin: 0 auto 12px;
      padding: 6px 8px 0;
      input {
        height: 30px;
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
      margin: 6px auto 0;
      text-align: left;
      font-size: 14px;
    }
  }
  .right {
    float: left;
    width: 490px;
    height: 280px;
  }
}
</style>
