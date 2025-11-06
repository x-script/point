import { createRouter, createWebHistory } from 'vue-router'

const pages = import.meta.glob('../view/pages.ts', { eager: true, import: 'default' })
// console.log(pages)

interface RouteMeta {
  name?: string
  path: string
  component: any
}

import Home from '@/view/point/index.vue'

// console.log(Object.entries(pages))
const routes = Object.entries(pages).flatMap(([path, meta]) => {
  // console.log(meta)
  return meta as RouteMeta[]
})
console.log('routes ==>', import.meta.env.BASE_URL)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // routes,
  routes: [
    {
      // name: 'Point',
      path: '/',
      component: Home,
    },
  ],
})

export default router
