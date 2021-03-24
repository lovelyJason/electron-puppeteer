import Vue from 'vue'
import VueRouter from 'vue-router'
// import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/home',
    redirect: '/'
  },
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    meta: {
      keepAlive: true
    }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/path',
    name: 'path',
    component: () => import(/* webpackChunkName: "path" */ '../views/SelectBrowser.vue')
  },
  {
    path: '/changelog',
    name: 'changelog',
    component: () => import(/* webpackChunkName: "changelog" */ '../views/Changelog.vue')
  }
]

const router = new VueRouter({
  routes,
  mode: 'hash'
})

export default router
