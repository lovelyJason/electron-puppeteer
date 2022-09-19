<template>
  <div id="app">
    <div id="nav">
      <span>科佑新创扫号助手通用版</span>
      <span v-if="!hasAuth" class="no-auth" @click="contactMeVisible = true">！未授权</span>
      <!-- | -->
      <!-- <router-link to="/about">About</router-link> -->
    </div>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if='!$route.meta.keepAlive'></router-view>
    <el-dialog
      title="复制机器码，联系作者授权"
      :visible.sync="contactMeVisible"
      center
      :close-on-press-escape="false"
      :close-on-click-modal="false"
    >
      <div>
        <img width="300" src="@/assets/images/wechat.jpg" alt=""> <br />
        <span class="user-select">
          {{ machineId }}
        </span>
      </div>
      <div slot="footer">
        <el-button type="primary" @click="contactMeVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const { ipcRenderer, remote } = require('electron')

export default {
  data () {
    return {
      contactMeVisible: false,
      hasAuth: false
    }
  },
  computed: {
    machineId () {
      return remote.getGlobal('machineId')
    }
  },
  methods: {
    async getData () {
      try {
        const data = await ipcRenderer.invoke('getData', ['machineIds'])
        this.hasAuth = data[0].includes(this.machineId)
      } catch (error) {
        this.$message({
          type: 'error',
          messag: error.message
        })
      }
    }
  },
  mounted () {
    this.getData()
  }
}
</script>

<style lang="less">
.user-select {
  user-select: text;
  -moz-user-select: text;
  -webkit-touch-callout: text;
  -webkit-user-select: text;
  -khtml-user-select: text;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 680px;
  user-select: none;
  -moz-user-select: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  // overflow-y: scroll;
}

#nav {
  padding: 10px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
  .no-auth {
    color: rgb(233, 97, 97);
    cursor: pointer;
  }
  span:first-child {
    font-weight: bold;
    color: #42b983;
    margin-right: 10px;
  }
}

.cookies-prompt {
  color: red;
  textarea {
    // width: 400px;
    height: 120px;
    resize: none;
  }
}
</style>
