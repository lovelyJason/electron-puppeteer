<template>
  <div class="changelog">
    <div class="met-log-body col-xl-9 pl-md-5">
      <ul class="met-log-list list-unstyled pl-md-5 ml-md-5">
        <h2 class="d-inline-block my-2 pl-3 pl-md-0">2021</h2>
        <li class="position-relative pl-3 pl-md-4 py-3 py-md-4">
          <h3 class="h6 position-absolute text-muted">2021.2月某一天</h3>
          <span
            class="rounded-circle p-1 position-absolute bg-white text-center font-weight-bold"
            >·</span
          >
          <dl class="mb-0">
            <dt><h4 class="h5">豆豆启动神器(专属) 0.0.2 更新日志</h4></dt>
            <dd class="card p-3 mb-0 mt-3 bg-light oya met-scrollbar">
              <div class="met-editor font-size-14 text-muted">
                <p>1.自动拉取版本更新；</p>
                <p>2.验证码查询抛错处理；</p>
                <p>3.Excel写入失败修复；</p>
              </div>
            </dd>
          </dl>
        </li>
        <li class="position-relative pl-3 pl-md-4 py-3 py-md-4">
          <h3 class="h6 position-absolute text-muted">2021.2月某一天</h3>
          <span
            class="rounded-circle p-1 position-absolute bg-white text-center font-weight-bold"
            >·</span
          >
          <dl class="mb-0">
            <dt><h4 class="h5">豆豆启动神器(专属) 0.0.1 更新日志</h4></dt>
            <dd class="card p-3 mb-0 mt-3 bg-light oya met-scrollbar">
              <div class="met-editor font-size-14 text-muted">
                <p>1.基本完成任务自动化；</p>
                <p>2.支持账号切换；</p>
                <p>3.修复表格上传失败以及页面跳转状态丢失；</p>
                <p>4.支持自定义浏览器路径；</p>
              </div>
            </dd>
          </dl>
        </li>
      </ul>
    </div>
    <el-button class="back-home" type="success" @click="backHome"
      >返回</el-button
    >
  </div>
</template>

<script>
export default {
  name: 'changelog',
  methods: {
    backHome () {
      this.$router.push('/home')
    }
  }
}
</script>

<style lang="less" scoped>
ul, li, p, div, span,h1, h2, h3, h4, dl, dd, dt {
  margin: 0;
  padding: 0;
}
.changelog {
  text-align: center;
  height: calc(~"100% - 44px");
  .back-home {
    position: absolute;
    width: 70px;
    left: 0;
    right: 0;
    margin: 0 auto;
    bottom: 10px;
  }
  .met-log-body {
    -webkit-tap-highlight-color: transparent;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    text-align: left;
    color: #2a333c;
    box-sizing: border-box;
    position: relative;
    width: 100%;
    min-height: 1px;
    padding-right: 15px;
    flex: 0 0 75%;
    max-width: 75%;
    margin-left: 100px;
    padding-left: 3rem !important;
    .met-log-list {
      margin-top: 0;
      margin-bottom: 1rem;
      list-style: none;
      .position-relative {
        position: relative !important;
        padding-top: 1.5rem !important;
        padding-bottom: 1.5rem !important;
        padding-left: 1.5rem !important;
        > h3 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-weight: 500;
          line-height: 1.2;
          font-size: 1rem !important;
          position: absolute !important;
          color: #6c757d !important;
          left: -25px;
          top: 27px;
          transform: translate(-100%, 0);
        }
        > span {
          box-sizing: border-box;
          background-color: #fff !important;
          border-radius: 50% !important;
          position: absolute !important;
          padding: 0.25rem !important;
          text-align: center !important;
          font-weight: 700 !important;
          width: 20px;
          height: 20px;
          line-height: 8px;
          border: 2px solid #26b1e7;
          color: #26b1e7;
          left: -10px;
          top: 26px;
        }
        > dl {
          margin-top: 0;
          margin-bottom: 0 !important;
          dt {
            font-weight: 700;
          }
        }
      }
    }
  }
  .list-unstyled {
    padding-left: 0;
    list-style: none;
  }
  .card {
    position: relative;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-direction: column;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
    overflow-y: auto;
    padding: 1rem;
    margin-top: 1rem;
    background-color: #f8f9fa;
    .met-editor {
      color: #6c757d !important;
      width: 100%;
      max-width: 100%;
      line-height: 1.8;
      font-size: 14px !important;
      max-height: 300px;
    }
  }

  .card > hr {
    margin-right: 0;
    margin-left: 0;
  }

  .card > .list-group:first-child .list-group-item:first-child {
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }

  .card > .list-group:last-child .list-group-item:last-child {
    border-bottom-right-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }
}
</style>
