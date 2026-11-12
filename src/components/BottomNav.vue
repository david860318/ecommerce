<template>
  <nav class="mobile-bottom-nav d-lg-none" aria-label="手機端底部導覽列">
    <div class="bottom-nav-container">
      
      <!-- 1. 首頁 (Home) -->
      <router-link
        to="/"
        class="bottom-nav-item"
        :class="{ 'is-active': $route.path === '/' }"
      >
        <Home class="nav-item-icon" />
        <span class="nav-item-label">首頁</span>
      </router-link>

      <!-- 2. 分類 (Category - 展開全品類抽屜) -->
      <button
        type="button"
        class="bottom-nav-item btn-reset"
        @click="emit('open-category')"
      >
        <LayoutGrid class="nav-item-icon" />
        <span class="nav-item-label">分類</span>
      </button>

      <!-- 3. 購物車 (Cart - 展開購物車抽屜 + 數量徽章) -->
      <button
        type="button"
        class="bottom-nav-item btn-reset position-relative"
        @click="cartStore.toggleDrawer(true)"
      >
        <div class="position-relative d-inline-flex">
          <ShoppingBag class="nav-item-icon" />
          <span
            v-if="cartStore.totalCount > 0"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark font-monospace bottom-cart-badge"
          >
            {{ cartStore.totalCount }}
          </span>
        </div>
        <span class="nav-item-label">購物袋</span>
      </button>

      <!-- 4. 會員中心 (Member / Login) -->
      <router-link
        v-if="authStore.user?.isLoggedIn"
        to="/profile"
        class="bottom-nav-item"
        :class="{ 'is-active': $route.path === '/profile' }"
      >
        <User class="nav-item-icon" />
        <span class="nav-item-label">會員</span>
      </router-link>
      <button
        v-else
        type="button"
        class="bottom-nav-item btn-reset"
        @click="emit('open-auth')"
      >
        <User class="nav-item-icon" />
        <span class="nav-item-label">登入</span>
      </button>

      <!-- 5. 後台管理 (Admin - 僅在管理員身分時顯示) -->
      <router-link
        v-if="authStore.isAdmin"
        to="/admin"
        class="bottom-nav-item"
        :class="{ 'is-active': $route.path.startsWith('/admin') }"
      >
        <Settings class="nav-item-icon" />
        <span class="nav-item-label">後台</span>
      </router-link>

    </div>
  </nav>
</template>

<script setup>
import { Home, LayoutGrid, ShoppingBag, User, Settings } from 'lucide-vue-next'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'

const emit = defineEmits(['open-category', 'open-auth'])
const cartStore = useCartStore()
const authStore = useAuthStore()
</script>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--md-border, #ede8e1);
  z-index: 1025;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -4px 16px rgba(45, 38, 33, 0.05);
}

.bottom-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 56px;
  max-width: 520px;
  margin: 0 auto;
}

.btn-reset {
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--md-text-muted, #9c9289);
  text-decoration: none;
  transition: color 0.18s ease, transform 0.18s ease;
  user-select: none;
}

.bottom-nav-item:active {
  transform: scale(0.92);
}

.nav-item-icon {
  width: 20px;
  height: 20px;
  stroke-width: 1.8;
}

.nav-item-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
  margin-top: 3px;
  line-height: 1;
}

.bottom-nav-item.is-active,
.bottom-nav-item:hover {
  color: var(--md-primary, #9b7e68);
}

.bottom-nav-item.is-active .nav-item-icon {
  stroke-width: 2.2;
}

.bottom-cart-badge {
  font-size: 8.5px;
  padding: 0.25em 0.55em;
  top: -2px !important;
  right: -8px !important;
  background-color: var(--md-text-primary, #2d2621) !important;
  border: 1.5px solid #ffffff;
}
</style>