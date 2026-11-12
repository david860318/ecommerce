<template>
  <div class="d-flex min-vh-100 w-100 admin-layout-root" style="background-color: var(--md-bg, #faf9f6); overflow-x: hidden;">
    
    <!-- 手機版側邊欄背景遮罩 -->
    <div
      v-if="isMobileMenuOpen"
      class="position-fixed top-0 start-0 w-100 h-100 modal-backdrop-custom d-lg-none"
      style="z-index: 1040;"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- ==================== 左側側邊欄 (桌機固定，手機抽屜式滑出) ==================== -->
    <aside
      class="admin-sidebar d-flex flex-column flex-shrink-0 shadow-sm border-end"
      :class="{ 'mobile-open': isMobileMenuOpen }"
    >
      <!-- Logo 標題與手機關閉按鈕 -->
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style="border-color: var(--md-border) !important;">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-5 fw-bold font-serif text-dark tracking-wider" style="letter-spacing: 0.1em;">MD.ADMIN</span>
          <span class="badge rounded-pill font-monospace" style="background-color: #f5f0eb; color: #7f6450; font-size: 10px;">PRO</span>
        </div>
        <button
          type="button"
          class="btn-close d-lg-none"
          aria-label="關閉選單"
          @click="isMobileMenuOpen = false"
        ></button>
      </div>

      <!-- 選單導航列表 -->
      <div class="flex-grow-1 overflow-y-auto no-scrollbar d-flex flex-column gap-3.5 small pb-4">
        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-2 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: var(--md-primary) !important;">
            OPERATIONS
          </div>
          <ul class="nav nav-pills flex-column gap-1.5">
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'dashboard' }"
                @click="switchView('dashboard')"
              >
                <LayoutDashboard style="width: 16px; height: 16px;" />
                <span>營運數據儀表板</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'orders' }"
                @click="switchView('orders')"
              >
                <ShoppingBag style="width: 16px; height: 16px;" />
                <span>訂單履約與退換貨</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'products' }"
                @click="switchView('products')"
              >
                <PackageCheck style="width: 16px; height: 16px;" />
                <span>商品與即時庫存</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-2 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: var(--md-primary) !important;">
            MARKETING & CRM
          </div>
          <ul class="nav nav-pills flex-column gap-1.5">
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'crm' }"
                @click="switchView('crm')"
              >
                <Users style="width: 16px; height: 16px;" />
                <span>優惠券與會員 CRM</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-2 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: var(--md-primary) !important;">
            SYSTEM & CMS
          </div>
          <ul class="nav nav-pills flex-column gap-1.5">
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'cms' }"
                @click="switchView('cms')"
              >
                <Sliders style="width: 16px; height: 16px;" />
                <span>首頁排版與導覽 CMS</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'audit' }"
                @click="switchView('audit')"
              >
                <ShieldCheck style="width: 16px; height: 16px;" />
                <span>操作稽核日誌</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 返回前台按鈕 -->
      <div class="pt-3 border-top mt-auto" style="border-color: var(--md-border) !important;">
        <router-link to="/" class="btn btn-outline-secondary btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-1.5 py-2 small">
          <ExternalLink style="width: 13px; height: 13px;" />
          <span>返回前台商店</span>
        </router-link>
      </div>
    </aside>

    <!-- ==================== 右側主內容區 ==================== -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100 main-content-wrapper" style="min-width: 0; overflow-x: hidden;">
      
      <!-- 頂部資訊狀態列 -->
      <header class="bg-white border-bottom px-3 px-sm-4 px-xl-5 py-2.5 py-sm-3 d-flex justify-content-between align-items-center shadow-2xs position-sticky top-0" style="border-color: var(--md-border) !important; z-index: 1020;">
        <div class="d-flex align-items-center gap-2 gap-sm-3">
          <!-- 手機版漢堡按鈕 -->
          <button
            type="button"
            class="btn btn-light btn-sm border d-lg-none p-1.5 rounded-3 d-flex align-items-center justify-content-center"
            @click="isMobileMenuOpen = true"
            aria-label="打開選單"
          >
            <Menu style="width: 18px; height: 18px;" />
          </button>

          <span class="badge rounded-pill font-monospace" style="background-color: #f5f0eb; color: #7f6450;">
            ADMINISTRATOR
          </span>
          <span class="small text-muted font-monospace d-none d-md-inline" style="font-size: 11px;">
            節點: TW-PRO (IP: 220.133.45.92)
          </span>
        </div>

        <div class="d-flex align-items-center gap-2">
          <div
            class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style="width: 32px; height: 32px; font-size: 11.5px; background-color: var(--md-primary);"
          >
            管
          </div>
          <div class="small fw-semibold text-dark d-none d-sm-inline">系統管理者</div>
        </div>
      </header>

      <!-- ★ 動態載入後台視圖：加入 admin-content-main，確保手機版底部留白充足 ★ -->
      <main class="p-3 p-sm-4 p-xl-5 flex-grow-1 admin-content-main" style="min-width: 0; max-width: 1380px; margin: 0 auto; width: 100%;">
        <DashboardView v-if="currentView === 'dashboard'" />
        <OrderManageView v-else-if="currentView === 'orders'" />
        <ProductManageView v-else-if="currentView === 'products'" />
        <MarketingCrmView v-else-if="currentView === 'crm'" />
        <CmsLayoutView v-else-if="currentView === 'cms'" />
        <AuditLogView v-else-if="currentView === 'audit'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Users,
  Sliders,
  ShieldCheck,
  ExternalLink,
  Menu
} from 'lucide-vue-next'
import DashboardView from './DashboardView.vue'
import OrderManageView from './OrderManageView.vue'
import ProductManageView from './ProductManageView.vue'
import MarketingCrmView from './MarketingCrmView.vue'
import CmsLayoutView from './CmsLayoutView.vue'
import AuditLogView from './AuditLogView.vue'

const currentView = ref('dashboard')
const isMobileMenuOpen = ref(false)

const switchView = (viewKey) => {
  currentView.value = viewKey
  isMobileMenuOpen.value = false
}
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  border-color: var(--md-border) !important;
  z-index: 1050;
  padding: 1.5rem 1.25rem;
  position: sticky;
  top: 0;
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    transform: translateX(-100%);
  }
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }

  /* 手機版主要內容區底部留白（預留 80px + 安全區域） */
  .admin-content-main {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)) !important;
  }
}

.active-menu {
  background-color: var(--md-primary) !important;
  color: #ffffff !important;
  font-weight: 600;
}
.active-menu svg {
  color: #ffffff !important;
}
</style>