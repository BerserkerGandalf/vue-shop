import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入fonts阿里图标库
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的 css 样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor, /* { default global options } */)


// 配置请求根路径
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'

// 请求拦截
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return
  return config
})

// 原型挂载
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.component(VueQuillEditor)

// 定义一个全局过滤器
Vue.filter('dataFormat', function(originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 +'').padStart(2,'0')
  const d = (dt.getMonth() +'').padStart(2,'0')
  
  const hh = (dt.getMonth() +'').padStart(2,'0')
  
  const mm = (dt.getMinutes() +'').padStart(2,'0')

  const ss = (dt.getSeconds() +'').padStart(2,'0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
