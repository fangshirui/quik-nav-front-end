import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: "/*",
    name: '404',
    component: () => import('../views/Home.vue'),
  }

]

// 设置为history模式，否则url后面会有锚点#
const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
