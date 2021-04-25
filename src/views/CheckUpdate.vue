<template>
  <div>
    <div>
      <el-button ghost type="primary" round @click="checkUpdate" :loading="checkUpdateLoading">检查更新</el-button
      >
    </div>
    <el-dialog
      title="下载进度"
      :visible.sync="dialogVisible"
      :show-close="true"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      center
      width="30%"
    >
      <div class="content" style="text-align: center;">
        <el-progress
          :percentage="percentage"
          :color="colors"
          :status="progressStaus"
          type="circle"
        ></el-progress>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const ipcRenderer = require('electron').ipcRenderer

export default {
  name: 'checkUpdate',
  data: () => ({
    percentage: 0,
    colors: [
      { color: '#f56c6c', percentage: 20 },
      { color: '#e6a23c', percentage: 40 },
      { color: '#6f7ad3', percentage: 60 },
      { color: '#1989fa', percentage: 80 },
      { color: '#5cb87a', percentage: 100 }
    ],
    dialogVisible: false,
    progressStaus: null,
    checkUpdateLoading: false
  }),
  mounted () {
    ipcRenderer.on('UpdateMsg', (event, arg) => {
      this.checkUpdateLoading = false
      console.log('update arg', arg)
      switch (arg.state) {
        case 1:
          this.$confirm('检查到有新版本，是否更新?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.dialogVisible = true
            ipcRenderer.invoke('confirm-downloadUpdate')
          })
          break
        // 没有更新
        case 2:
          this.$message({
            type: 'success',
            message: '当前已经是最新版本啦'
          })
          break
        case 3:
          this.percentage = arg.msg.percent.toFixed(1)
          break
        case 4:
          this.progressStaus = 'success'
          this.$alert('下载完成！', '提示', {
            confirmButtonText: '确定',
            callback: (action) => {
              ipcRenderer.invoke('confirm-update')
            }
          })
          break
        default:
          break
      }
    })
  },
  methods: {
    checkUpdate () {
      this.checkUpdateLoading = true
      ipcRenderer.invoke('check-update')
    }
  }
}
</script>
<style lang="css" scoped>

</style>
