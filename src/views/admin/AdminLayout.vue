<template>
  <div class="d-flex min-vh-100 w-100" style="background-color: var(--md-bg, #faf9f6); overflow-x: hidden;">
    <!-- ==================== 左側固定側邊欄 ==================== -->
    <aside
      class="d-flex flex-column flex-shrink-0 shadow-sm border-end position-sticky top-0"
      style="width: 250px; height: 100vh; background-color: #ffffff; border-color: var(--md-border) !important; z-index: 1030; padding: 1.5rem 1.25rem;"
    >
      <!-- Logo 標題 -->
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style="border-color: var(--md-border) !important;">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-5 fw-bold font-serif text-dark tracking-wider" style="letter-spacing: 0.1em;">MD.ADMIN</span>
          <span class="badge rounded-pill font-monospace" style="background-color: #f5f0eb; color: #7f6450; font-size: 10px;">PRO</span>
        </div>
      </div>

      <!-- 選單導航列表 -->
      <div class="flex-grow-1 overflow-y-auto no-scrollbar d-flex flex-column gap-3.5 small">
        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-2 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: var(--md-primary) !important;">
            OPERATIONS
          </div>
          <ul class="nav nav-pills flex-column gap-1.5">
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'dashboard' }"
                @click="currentView = 'dashboard'"
              >
                <LayoutDashboard style="width: 16px; height: 16px;" />
                <span>營運數據儀表板</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'orders' }"
                @click="currentView = 'orders'"
              >
                <ShoppingBag style="width: 16px; height: 16px;" />
                <span>訂單履約與退換貨</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'products' }"
                @click="currentView = 'products'"
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
                @click="currentView = 'crm'"
              >
                <Users style="width: 16px; height: 16px;" />
                <span>優惠券與會員 CRM</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-2 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: var(--md-primary) !important;">
            SYSTEM & AUDIT
          </div>
          <ul class="nav nav-pills flex-column gap-1.5">
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'cms' }"
                @click="currentView = 'cms'"
              >
                <Sliders style="width: 16px; height: 16px;" />
                <span>首頁排版 CMS</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="btn w-100 text-start d-flex align-items-center gap-2.5 py-2 px-3 rounded-3 border-0 admin-sidebar-btn"
                :class="{ 'active-menu': currentView === 'audit' }"
                @click="currentView = 'audit'"
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

    <!-- ==================== 右側主內容區 (增加四邊舒適 padding，杜絕貼邊) ==================== -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100" style="min-width: 0; overflow-x: auto;">
      <!-- 頂部資訊狀態列 -->
      <header class="bg-white border-bottom px-4 px-xl-5 py-3 d-flex justify-content-between align-items-center shadow-2xs position-sticky top-0" style="border-color: var(--md-border) !important; z-index: 1020;">
        <div class="d-flex align-items-center gap-2">
          <span class="badge rounded-pill font-monospace" style="background-color: #f5f0eb; color: #7f6450;">
            ADMINISTRATOR
          </span>
          <span class="small text-muted font-monospace d-none d-md-inline" style="font-size: 11px;">
            全功能權限已啟用 · 節點: TW-PRO (IP: 220.133.45.92)
          </span>
        </div>

        <div class="d-flex align-items-center gap-2">
          <div
            class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style="width: 32px; height: 32px; font-size: 11.5px; background-color: var(--md-primary);"
          >
            管
          </div>
          <div class="small fw-semibold text-dark">系統管理者</div>
        </div>
      </header>

      <!-- 動態載入各模組視圖 (p-4 p-xl-5 提供足夠呼吸感) -->
      <main class="p-4 p-xl-5 flex-grow-1" style="min-width: 0; max-width: 1380px; margin: 0 auto; width: 100%;">
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
  ExternalLink
} from 'lucide-vue-next'
import DashboardView from './DashboardView.vue'
import OrderManageView from './OrderManageView.vue'
import ProductManageView from './ProductManageView.vue'
import MarketingCrmView from './MarketingCrmView.vue'
import CmsLayoutView from './CmsLayoutView.vue'
import AuditLogView from './AuditLogView.vue'

const currentView = ref('dashboard')
</script>

<style scoped>
.active-menu {
  background-color: var(--md-primary) !important;
  color: #ffffff !important;
  font-weight: 600;
}
.active-menu svg {
  color: #ffffff !important;
}
</style>