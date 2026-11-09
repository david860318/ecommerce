<template>
  <header class="navbar-wrapper sticky-top bg-white border-bottom">
    <div class="navbar-inner-container">
      
      <!-- ==================== 1. 最左側：LOGO 與手機版漢堡按鈕 ==================== -->
      <div class="nav-brand-section">
        <button
          class="btn p-0 border-0 d-lg-none text-dark me-2"
          type="button"
          @click="showMobileMenu = true"
          aria-label="打開導覽選單"
        >
          <Menu style="width: 22px; height: 22px;" />
        </button>

        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <span class="fw-bold font-serif text-dark logo-text">
            MD.SELECT
          </span>
          <span class="text-muted d-none d-sm-inline-block small border-start ps-2 font-monospace sub-logo-text">
            SEOUL
          </span>
        </router-link>
      </div>

      <!-- ==================== 2. 中間：主分類導覽選單 (優化 Hover 與防斷空橋樑) ==================== -->
      <nav class="nav-menu-section d-none d-lg-flex align-items-center">
        <div
          v-for="(cat, idx) in marketingStore.categoryTree"
          :key="idx"
          class="nav-item position-relative"
          :class="{ 'is-active': activeMenuIndex === idx }"
          @mouseenter="handleMenuEnter(idx)"
          @mouseleave="handleMenuLeave"
        >
          <!-- 選單按鈕 -->
          <button
            type="button"
            class="nav-menu-btn"
            @click="handleCategoryClick(cat.name)"
          >
            <span>{{ cat.name }}</span>
            <ChevronDown
              class="chevron-icon"
              :class="{ 'is-rotated': activeMenuIndex === idx }"
            />
          </button>

          <!-- 下拉多欄面板 (含透明防斷空感應區，滑動不消失) -->
          <transition name="dropdown-fade">
            <div
              v-show="activeMenuIndex === idx"
              class="dropdown-panel shadow-lg rounded-4"
            >
              <div class="dropdown-inner-content">
                <div class="row g-4">
                  <div
                    v-for="(sub, sIdx) in cat.subcategories"
                    :key="sIdx"
                    class="col-6 sub-col"
                  >
                    <div class="sub-cat-header pb-2 mb-2.5 fw-bold">
                      {{ sub.name }}
                    </div>
                    <ul class="list-unstyled mb-0 d-flex flex-column gap-1.5">
                      <li v-for="(item, iIdx) in sub.items" :key="iIdx">
                        <a
                          href="javascript:void(0)"
                          @click="handleCategoryClick(item)"
                          class="sub-cat-link"
                        >
                          {{ item }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </nav>

      <!-- ==================== 3. 最右側：修復後的搜尋欄 + 管理後台 + 會員 + 購物袋 ==================== -->
      <div class="nav-actions-section d-flex align-items-center gap-2.5">
        
        <!-- ★ 嚴格對齊防跑版的搜尋列容器 ★ -->
        <div class="search-box-container">
          <!-- 放大鏡圖示：絕對置中，穿透點擊 -->
          <Search class="search-icon" />
          <input
            :value="productStore.searchInput"
            @input="onSearchInput"
            type="text"
            placeholder="搜尋正韓單品..."
            class="search-input"
          />
          <button
            v-if="productStore.searchInput"
            @click="clearSearch"
            type="button"
            class="clear-search-btn"
            aria-label="清除搜尋"
          >
            ×
          </button>
        </div>

        <!-- 管理後台入口 -->
        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="btn btn-dark btn-sm rounded-pill px-2.5 py-1 d-flex align-items-center gap-1 font-monospace action-btn"
        >
          <Settings style="width: 13px; height: 13px;" />
          <span class="d-none d-sm-inline">管理後台</span>
        </router-link>

        <!-- 會員入口 -->
        <router-link
          v-if="authStore.user?.isLoggedIn"
          to="/profile"
          class="btn btn-light btn-sm rounded-pill px-3 py-1 text-secondary d-flex align-items-center gap-1.5 action-btn"
        >
          <User style="width: 13px; height: 13px;" />
          <span class="d-none d-md-inline">{{ authStore.user.name }}</span>
        </router-link>
        <button
          v-else
          @click="showAuthModal = true"
          type="button"
          class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 action-btn"
        >
          <User style="width: 13px; height: 13px;" />
          <span>登入</span>
        </button>

        <!-- 購物袋按鈕 -->
        <button
          @click="cartStore.toggleDrawer(true)"
          type="button"
          class="btn btn-link text-dark position-relative p-2 cart-trigger-btn"
          aria-label="購物車"
        >
          <ShoppingBag style="width: 20px; height: 20px;" />
          <span
            v-if="cartStore.totalCount > 0"
            class="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-dark font-monospace cart-badge"
          >
            {{ cartStore.totalCount }}
          </span>
        </button>
      </div>

    </div>

    <!-- 手機版 Offcanvas 側邊抽屜選單 -->
    <Teleport to="body">
      <div
        v-if="showMobileMenu"
        class="position-fixed top-0 start-0 w-100 h-100 modal-backdrop-custom"
        style="z-index: 1045;"
        @click="showMobileMenu = false"
      ></div>

      <div
        class="position-fixed top-0 start-0 bg-white h-100 p-4 shadow-lg d-flex flex-column mobile-drawer"
        :style="{ transform: showMobileMenu ? 'translateX(0)' : 'translateX(-100%)' }"
      >
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <span class="fw-bold font-serif text-dark" style="letter-spacing: 0.1em;">CATEGORY</span>
          <button type="button" class="btn-close" @click="showMobileMenu = false"></button>
        </div>

        <div v-if="authStore.isAdmin" class="mb-3">
          <router-link
            to="/admin"
            class="btn btn-dark btn-sm w-100 rounded-pill py-2 font-monospace"
            @click="showMobileMenu = false"
          >
            進入管理後台
          </router-link>
        </div>

        <div class="flex-grow-1 overflow-y-auto no-scrollbar">
          <div class="accordion accordion-flush" id="mobileCatAccordion">
            <div
              v-for="(cat, idx) in marketingStore.categoryTree"
              :key="'m-' + idx"
              class="accordion-item border-0 border-bottom"
            >
              <h2 class="accordion-header">
                <button
                  class="accordion-button collapsed px-1 py-3 small fw-bold text-dark bg-transparent"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse-' + idx"
                >
                  {{ cat.name }}
                </button>
              </h2>
              <div :id="'collapse-' + idx" class="accordion-collapse collapse" data-bs-parent="#mobileCatAccordion">
                <div class="accordion-body px-2 py-2 bg-light rounded-3 mb-2">
                  <div v-for="(sub, sIdx) in cat.subcategories" :key="'ms-' + sIdx" class="mb-3">
                    <div class="fw-bold small text-muted mb-1" style="font-size: 11px;">{{ sub.name }}</div>
                    <div class="d-flex flex-wrap gap-1.5">
                      <button
                        v-for="(item, iIdx) in sub.items"
                        :key="'mi-' + iIdx"
                        @click="handleCategoryClick(item)"
                        type="button"
                        class="btn btn-sm btn-outline-secondary rounded-pill py-0.5 px-2.5"
                        style="font-size: 11px;"
                      >
                        {{ item }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-top pt-3 small text-center text-muted font-monospace" style="font-size: 11px;">
          MD.SELECT © 2026 SEOUL
        </div>
      </div>
    </Teleport>

    <!-- 登入視窗 -->
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingBag, Search, User, Menu, Settings, ChevronDown } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useMarketingStore } from '../stores/marketingStore'
import AuthModal from './AuthModal.vue'

const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const marketingStore = useMarketingStore()
const router = useRouter()

const showAuthModal = ref(false)
const showMobileMenu = ref(false)

// 記錄當前懸停的選單索引
const activeMenuIndex = ref(null)
let leaveTimer = null

// 滑鼠移入按鈕或整個項目：清除收合計時器並立刻展開
const handleMenuEnter = (index) => {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  activeMenuIndex.value = index
}

// 滑鼠移出項目：設定 280ms 防手震緩衝，給予足夠時間移動游標
const handleMenuLeave = () => {
  if (leaveTimer) clearTimeout(leaveTimer)
  leaveTimer = setTimeout(() => {
    activeMenuIndex.value = null
  }, 280)
}

const onSearchInput = (e) => {
  productStore.setSearchQuery(e.target.value)
}

const clearSearch = () => {
  productStore.setSearchQuery('')
}

const handleCategoryClick = (keyword) => {
  productStore.setSearchQuery(keyword)
  activeMenuIndex.value = null
  showMobileMenu.value = false
  router.push('/')
}
</script>

<style scoped>
.navbar-wrapper {
  z-index: 1030;
  background-color: #ffffff;
}

/* 核心容器：左右分散對齊 */
.navbar-inner-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0.75rem clamp(1.25rem, 3vw, 2.5rem);
  gap: 1.5rem;
}

/* 左側品牌 */
.nav-brand-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.logo-text {
  letter-spacing: 0.12em;
  font-size: 1.25rem;
  white-space: nowrap;
}

.sub-logo-text {
  font-size: 9px;
  letter-spacing: 0.1em;
}

/* 中間選單列 */
.nav-menu-section {
  flex: 1;
  justify-content: center;
  display: flex;
  gap: 0.5rem;
}

.nav-menu-btn {
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--md-text-primary, #2d2621);
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-menu-btn:hover,
.nav-item.is-active .nav-menu-btn {
  background-color: var(--md-surface-subtle, #f5f2ed);
  color: var(--md-primary, #9b7e68);
}

.chevron-icon {
  width: 12px;
  height: 12px;
  transition: transform 0.2s ease;
}

.chevron-icon.is-rotated {
  transform: rotate(180deg);
}

/* ==================== 下拉面板與 Hover Bridge 防斷空橋 ==================== */
.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  border: 1px solid var(--md-border, #ede8e1);
  z-index: 1060;
  padding: 1.75rem 2rem;
  box-shadow: 0 12px 30px rgba(45, 38, 33, 0.09);
  margin-top: 10px; /* 與按鈕保持美觀距離 */
}

/* ★ 關鍵：透明隱形橋樑，填補按鈕與下拉面板間的 10px 空隙，滑鼠不會失焦斷線 ★ */
.dropdown-panel::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 0;
  width: 100%;
  height: 12px;
  background: transparent;
}

.dropdown-inner-content {
  min-width: 440px;
  max-width: 520px;
}

.sub-col {
  padding: 0 1rem;
}

.sub-cat-header {
  color: var(--md-primary, #9b7e68);
  font-size: 12px;
  letter-spacing: 0.05em;
  border-color: var(--md-border-light, #f3efe9) !important;
}

.sub-cat-link {
  text-decoration: none;
  font-size: 12px;
  color: var(--md-text-secondary, #70665f);
  display: block;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.sub-cat-link:hover {
  background-color: var(--md-primary-light, #f7f3ee);
  color: var(--md-primary, #9b7e68) !important;
  transform: translateX(2px);
}

/* ==================== 右側操作區與搜尋欄徹底防跑版 ==================== */
.nav-actions-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* 搜尋容器：嚴格鎖定尺寸與邊界 */
.search-box-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 185px;
  height: 36px;
  flex-shrink: 0;
}

/* 放大鏡圖示：絕對置中，完全無跑版風險 */
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #8c827a;
  pointer-events: none; /* 點擊直接穿透給 input */
  z-index: 3;
}

/* 搜尋輸入框：強制覆蓋預設樣式，保留左側放大鏡空間 */
.search-input {
  width: 100%;
  height: 36px;
  line-height: 36px;
  font-size: 12px;
  padding-left: 34px !important; /* 確保文字與放大鏡保持安全距離 */
  padding-right: 28px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin: 0 !important;
  background-color: #f5f2ed !important;
  border: 1px solid transparent !important;
  border-radius: 9999px !important;
  color: var(--md-text-primary, #2d2621);
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.search-input:focus {
  background-color: #ffffff !important;
  border-color: var(--md-primary, #9b7e68) !important;
  box-shadow: 0 0 0 3px rgba(155, 126, 104, 0.15) !important;
}

/* 清除按鈕 */
.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 14px;
  color: #9c9289;
  border: none;
  background: transparent;
  padding: 0;
  z-index: 3;
}

.clear-search-btn:hover {
  color: var(--md-text-primary, #2d2621);
}

.action-btn {
  font-size: 12px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.cart-trigger-btn {
  text-decoration: none;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cart-badge {
  font-size: 9px;
  top: 2px !important;
}

/* 下拉漸變微動畫 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

/* 手機版抽屜 */
.mobile-drawer {
  width: 320px;
  max-width: 85vw;
  z-index: 1050;
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
}
</style>