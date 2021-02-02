<template>
  <div class="home">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div class="left">
      <div class="btns-wrapper">
        <el-button type="primary" @click="startPuppeteer">一键启动</el-button>
        <el-button type="success" @click="debug">debug</el-button>
        <el-button type="danger">停止</el-button>
        <el-button type="warning" @click="dialog">导入excel</el-button>
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
        <u-table-column prop="applicationNum" label="申请号" width="150"> </u-table-column>
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
        console.log(_)
        return {
          prop: 'address',
          id: idx,
          label: '地址' + idx,
          width: 200,
          showOverflow: true
        }
      })
    }
  },
  methods: {
    startPuppeteer () {
      ipcRenderer.send('start')
    },
    debug () {
      ipcRenderer.send('debug')
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
    .btns-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      .el-button {
        width: 200px;
        margin-bottom: 8px;
        &:first-child {
          margin-left: 10px;
        }
      }
    }
  }
  .right {
    float: left;
    width: 490px;
    height: 280px;
  }
}
</style>
