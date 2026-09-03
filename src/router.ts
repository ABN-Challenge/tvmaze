import { createRouter, createWebHashHistory } from 'vue-router'
import { DashboardPage, SearchPage, ShowDetailsPage, NotFoundPage } from './remotes'
import { routeDefs } from './routeDefs'

export const routes = [
  { ...routeDefs[0], component: DashboardPage },
  { ...routeDefs[1], component: SearchPage },
  { ...routeDefs[2], component: ShowDetailsPage },
  { ...routeDefs[3], component: NotFoundPage },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
