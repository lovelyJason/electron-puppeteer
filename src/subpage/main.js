import Vue from 'vue'
import App from './App.vue'

import { Loading, Table, TableColumn, Button } from 'element-ui'

Vue.use(Button)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Loading.directive)

new Vue({
  render: h => h(App)
}).$mount('#app')
