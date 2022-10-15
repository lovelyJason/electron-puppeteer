<template>
  <div id="app">
    <el-button :loading="tableLoading" type="primary" @click="onRefreshClick">刷新</el-button>
    <el-table v-loading="tableLoading" :data="tableData" border style="width: 100%;margin-top: 12px;margin-bottom: 12px;">
      <el-table-column prop="patentName" label="案件名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column prop="applyCompanyName" label="申请主体">
      </el-table-column>
      <el-table-column prop="typeText" label="专利类型"> </el-table-column>
      <el-table-column prop="orderSubmitTime" label="预约时间"> </el-table-column>

    </el-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
const { ipcRenderer } = require('electron')

export default {
  data () {
    return {
      tableData: [],
      intervalId: null,
      tableLoading: false
    }
  },
  methods: {
    getHistory () {
      this.tableLoading = true
      ipcRenderer.send('getHistory')
      ipcRenderer.on('getHistoryReply', (event, ans) => {
        this.tableData = ans
        this.tableLoading = false
      })
    },
    onRefreshClick () {
      ipcRenderer.send('getHistory')
    }
  },
  // beforeCreate () {
  //   const cur = remote.getCurrentWindow()
  //   const parent = cur.getParentWindow()
  //   const parentPosition = parent.getPosition()
  //   console.log(parentPosition)
  //   const [x, y] = parentPosition
  //   cur.setPosition(x, y, false)
  // },
  mounted () {
    const title = document.title
    document.title = title + dayjs().format('YYYY-MM-DD')
    this.getHistory()
    // const intervalId = setInterval(() => {
    //   this.getHistory()
    // }, 5000)
    // this.intervalId = intervalId
  },
  beforeDestroy () {
    // clearInterval(this.intervalId)
  }
}
</script>

<style>
</style>
