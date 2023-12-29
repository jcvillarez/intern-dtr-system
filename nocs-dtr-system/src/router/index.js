import { createRouter, createWebHistory } from 'vue-router'
import MainPageView from '@/views/MainPageView.vue'
import SignupView from '@/views/SignupView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UpdateTimeRecord from '@/views/UpdateTimeRecord.vue'

import Parse from "parse";
const requireAuth = (to, from, next) => {
  const currentUser = Parse.User.current();

  if (!currentUser) {
    next({
      path: "/",
      query: { redirect: to.fullPath },
    });
  } else {
    next();
  }
};

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MainPageView
  },
  {
    path: '/signup',
    name: 'SignupView',
    component: SignupView
  },
  {
    path: '/dashboard',
    name: 'DashboardView',
    component: DashboardView,
    beforeEnter: requireAuth,
  },
  {
    path: '/updateTimeRecord',
    name: 'UpdateTimeRecord',
    component: UpdateTimeRecord,
    beforeEnter: requireAuth,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
