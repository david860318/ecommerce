import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProductDetailView from '../views/ProductDetailView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import ProfileView from '../views/ProfileView.vue'
import AdminLayout from '../views/admin/AdminLayout.vue'
import OrderSuccessView from '../views/OrderSuccessView.vue'
import CategoryView from '../views/CategoryView.vue'
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
      path: '/category/:categoryName',
      name: 'category',
      component: CategoryView
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
      path: '/order-success',
      name: 'order-success',
      component: OrderSuccessView
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
      meta: { requiresAdmin: true }
    },
    {
      // 捕獲所有找不到的路由，一律回到首頁
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  }
})

// 全域守衛安全防護：確保每條路徑一定會走到 next()
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresAdmin) {
    const authStore = useAuthStore()
    if (!authStore.isAdmin) {
      alert('【權限不足】您目前的帳號身分非管理員，無法造訪後台系統！')
      return next({ path: '/' })
    }
  }
  // 正常放行
  next()
})

export default router