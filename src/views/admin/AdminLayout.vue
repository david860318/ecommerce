<template>
  <div class="d-flex min-vh-100 w-100" style="background-color: #faf9f6; overflow-x: hidden;">
    <!-- ==================== 左側固定側邊欄 (Fixed Sidebar) ==================== -->
    <aside
      class="d-flex flex-column flex-shrink-0 p-3 shadow-sm border-end position-sticky top-0"
      style="width: 250px; height: 100vh; background-color: #ffffff; border-color: #ede8e1 !important; z-index: 1030;"
    >
      <!-- 標題與標誌 -->
      <div class="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom" style="border-color: #ede8e1 !important;">
        <div class="d-flex align-items-center gap-2">
          <span class="fs-5 fw-bold font-serif text-dark tracking-wider" style="letter-spacing: 0.1em;">MD.ADMIN</span>
          <span class="badge rounded-pill font-monospace" style="background-color: #f5f0eb; color: #7f6450; font-size: 10px;">PRO</span>
        </div>
      </div>

      <!-- 選單導航列表 (獨立滾動，不影響主要內容) -->
      <div class="flex-grow-1 overflow-y-auto no-scrollbar d-flex flex-column gap-3 small">
        <!-- 模組 1：營運核心 -->
        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-1.5 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: #9b7e68 !important;">
            OPERATIONS
          </div>
          <ul class="nav nav-pills flex-column gap-1">
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

        <!-- 模組 2：客戶與行銷 -->
        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-1.5 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: #9b7e68 !important;">
            MARKETING & CRM
          </div>
          <ul class="nav nav-pills flex-column gap-1">
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

        <!-- 模組 3：系統架構 -->
        <div>
          <div class="text-uppercase text-muted fw-bold px-2 mb-1.5 font-monospace" style="font-size: 10px; letter-spacing: 0.08em; color: #9b7e68 !important;">
            SYSTEM & AUDIT
          </div>
          <ul class="nav nav-pills flex-column gap-1">
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

      <!-- 底部返回按鈕 -->
      <div class="pt-3 border-top mt-auto" style="border-color: #ede8e1 !important;">
        <router-link to="/" class="btn btn-outline-secondary btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-1.5 py-1.5 small">
          <ExternalLink style="width: 13px; height: 13px;" />
          <span>返回前台商店</span>
        </router-link>
      </div>
    </aside>

    <!-- ==================== 右側主內容區 (防破版配置) ==================== -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100" style="min-width: 0; overflow-x: hidden;">
      <!-- 頂部資訊狀態列 -->
      <header class="bg-white border-bottom px-4 py-2.5 d-flex justify-content-between align-items-center shadow-2xs position-sticky top-0" style="border-color: #ede8e1 !important; z-index: 1020;">
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
            style="width: 30px; height: 30px; font-size: 11.5px; background-color: #9b7e68;"
          >
            管
          </div>
          <div class="small fw-semibold text-dark">系統管理者</div>
        </div>
      </header>

      <!-- 動態載入各模組視圖 (min-width: 0 防止 Flexbox 溢出破版) -->
      <main class="p-3 p-md-4 flex-grow-1" style="min-width: 0;">
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