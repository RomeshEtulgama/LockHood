import Vue from 'vue'
import VueRouter from 'vue-router'
import * as fb from '@/firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: async () => {
      const user = await fb.getUser();
      if (user.class)
        return import('../views/' + user.class + '/Dashboard.vue')
      else
        return import('../views/Error.vue')
    }
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
