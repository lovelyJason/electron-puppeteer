<template>
  <div>
    <div style="margin-bottom: 10px;">输入你的浏览器路径</div>
    <br />
    <el-input v-model="path" placeholder="输入你的浏览器路径,如C:\Program Files\Google\Chrome\Application"></el-input>
    <el-button type="primary" @click="onConfirmClick">确定</el-button>
    <br />
    <el-button type="success" @click="backHome">返回</el-button>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')

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
      ipcRenderer.send('setPath', this.path)
    }
  },
  watch: {
    path (value) {
      console.log(this.$store)
      this.$store.commit('editPath', value)
    }
  }
}
</script>

<style lang="less" scoped>
  .el-input {
    width: 500px;
    margin-bottom: 20px;
    margin-right: 6px;
  }
</style>
