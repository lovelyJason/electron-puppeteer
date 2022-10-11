import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import {
  Button,
  Checkbox,
  Table,
  TableColumn,
  RadioGroup,
  Radio,
  Input,
  Form,
  FormItem,
  Row,
  Col,
  Loading,
  Select,
  Option,
  Autocomplete,
  Dialog,
  Progress,
  Message,
  MessageBox,
  Tabs,
  TabPane,
  Tooltip,
  DatePicker
} from 'element-ui'
import UmyUi from 'umy-ui'
import 'umy-ui/lib/theme-chalk/index.css'
import './assets/style/common.less'

Vue.config.productionTip = false

Vue.use(Button)
Vue.use(Checkbox)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Row)
Vue.use(Col)
Vue.use(Loading.directive)
Vue.use(Select)
Vue.use(Option)
Vue.use(Autocomplete)
Vue.use(Dialog)
Vue.use(Progress)
Vue.use(UmyUi)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Tooltip)
Vue.use(DatePicker)

Vue.prototype.$message = Message
Vue.prototype.$loading = Loading.service

Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
