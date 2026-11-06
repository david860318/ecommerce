import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CheckoutView from '../views/CheckoutView.vue'
import OrderSuccessView from '../views/OrderSuccessView.vue'

// 後台視圖
import AdminLayout from '../views/admin/AdminLayout.vue'
import DashboardView from '../views/admin/DashboardView.vue'
import ProductManageView from '../views/admin/ProductManageView.vue'
import OrderManageView from '../views/admin/OrderManageView.vue'
import MarketingCrmView from '../views/admin/MarketingCrmView.vue'

const routes = [
  // 前台顧客路由 (Storefront)
  { path: '/', name: 'home', component: HomeView },
  { path: '/checkout', name: 'checkout', component: CheckoutView },
  { path: '/success', name: 'success', component: OrderSuccessView },

  // 後台管理路由 (Admin Portal)
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'admin-dashboard', component: DashboardView },
      { path: 'products', name: 'admin-products', component: ProductManageView },
      { path: 'orders', name: 'admin-orders', component: OrderManageView },
      { path: 'marketing', name: 'admin-marketing', component: MarketingCrmView }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})