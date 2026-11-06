import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import { useAuthStore } from '../stores/authStore'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/product/:id',
      name: 'product-detail',
      component: ProductDetailView
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView
    },
    {
      path: '/admin',
      name: 'admin-portal',
      component: AdminLayout,
      meta: { requiresAdmin: true } // ★ 標記此頁面需管理者權限
    }
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

// ★ 全域路由守衛：未具備管理者權限時阻擋進入 /admin
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const authStore = useAuthStore()
    if (!authStore.isAdmin) {
      alert('【權限不足】您目前的帳號身分非管理員，無法造訪後台系統！')
      next({ path: '/' })
      return
    }
  }
  next()
})