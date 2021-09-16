import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: 'Login' },
  { path: '/Login', component: Login },
  {
    path: '/Home',
    component: Home,
    redirect:'Welcome',
    children: [
      { path: '/Welcome', component: Welcome },
      { path:'/users', component: Users },
      { path:'/Rights', component: Rights},
      { path:'/Roles', component: Roles},
      { path:'/categories', component: Cate},
      { path:'/params', component: Params},
      { path:'/goods', component: List},
      { path:'/goods/Add', component: Add},
      { path:'/orders', component: Order},
      { path:'/reports', component: Report},
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫，控制页面访问权限
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行    next('/Login') 强制跳转
  // 除了登录页面,访问其他页面需要存在token,token不存在将强制跳转Login页面
  if (to.path === '/Login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果token不存在,表示没有登录,则重强制跳转 Login
  if (!tokenStr) return next('/Login')
  // 存在则放行
  next()
})

export default router
