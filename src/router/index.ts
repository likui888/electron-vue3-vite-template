import { createRouter, createWebHashHistory } from 'vue-router'
import HelloWorld from "../components/HelloWorld.vue";


const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: HelloWorld },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

export default router
