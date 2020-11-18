import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import MHome from '@/views/MHome'

Vue.use(VueRouter)

// 解决重复导航引起的性能警告 NavigationDuplicated:
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },

  {
    path: '/pc_index',
    name: 'Home',
    component: Home
  },
  {
    path: '/m_index',
    name: 'MHome',
    component: MHome,
  },
  {
    path: '/*',
    name: '404',
    component: () => import('../views/Home.vue'),
  }

]

// 设置为history模式，否则url后面会有锚点#,
// 改为hash,是因为添加了移动端适配后，需要进行跳转，history模式无法正常使用
const router = new VueRouter({
  mode: 'hash',
  routes
})

export default router
