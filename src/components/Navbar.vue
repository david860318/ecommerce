<template>
  <header class="navbar-wrapper sticky-top bg-white border-bottom">
    <div class="navbar-inner-container">
      
      <!-- 1. 最左側：LOGO -->
      <div class="nav-brand-section">
        <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <span class="fw-bold font-serif text-dark logo-text">
            MD.SELECT
          </span>
          <span class="text-muted d-none d-sm-inline-block small border-start ps-2 font-monospace sub-logo-text">
            SEOUL
          </span>
        </router-link>
      </div>

      <!-- 2. 中間：桌機版主分類導覽選單 (點擊進入該分類專屬頁面) -->
      <nav class="nav-menu-section d-none d-lg-flex align-items-center">
        <div
          v-for="(cat, idx) in marketingStore.categoryTree"
          :key="idx"
          class="nav-item position-relative"
          :class="{ 'is-active': activeMenuIndex === idx }"
          @mouseenter="handleMenuEnter(idx)"
          @mouseleave="handleMenuLeave"
        >
          <button
            type="button"
            class="nav-menu-btn"
            @click="navigateToCategory(cat.name)"
          >
            <span>{{ cat.name }}</span>
            <ChevronDown
              class="chevron-icon"
              :class="{ 'is-rotated': activeMenuIndex === idx }"
            />
          </button>

          <!-- 下拉多欄面板 -->
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
                          @click="navigateToCategory(cat.name, item)"
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

      <!-- 3. 最右側：搜尋列 + 桌機操作按鈕群 -->
      <div class="nav-actions-section d-flex align-items-center gap-2 gap-sm-2.5">
        
        <!-- 桌機版搜尋框 -->
        <div class="search-box-container d-none d-md-inline-flex">
          <Search class="search-icon" />
          <input
            :value="searchInput"
            @input="onSearchInput"
            @keyup.enter="performSearch"
            type="text"
            placeholder="搜尋正韓單品..."
            class="search-input"
          />
          <button
            v-if="searchInput"
            @click="clearSearch"
            type="button"
            class="clear-search-btn"
            aria-label="清除搜尋"
          >
            ×
          </button>
        </div>

        <!-- 手機版獨立搜尋切換圖示 -->
        <button
          class="btn btn-link text-dark p-1.5 d-md-none"
          type="button"
          @click="isMobileSearchExpanded = !isMobileSearchExpanded"
          aria-label="切換搜尋列"
        >
          <Search style="width: 20px; height: 20px;" />
        </button>

        <!-- 桌機版後台入口 -->
        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="btn btn-dark btn-sm rounded-pill px-3 py-1 d-none d-lg-flex align-items-center gap-1 font-monospace action-btn"
        >
          <Settings style="width: 13px; height: 13px;" />
          <span>管理後台</span>
        </router-link>

        <!-- 桌機版會員入口 -->
        <router-link
          v-if="authStore.user?.isLoggedIn"
          to="/profile"
          class="btn btn-light btn-sm rounded-pill px-3 py-1 text-secondary d-none d-lg-flex align-items-center gap-1.5 action-btn"
        >
          <User style="width: 14px; height: 14px;" />
          <span>{{ authStore.user.name }}</span>
        </router-link>
        <button
          v-else
          @click="showAuthModal = true"
          type="button"
          class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 d-none d-lg-flex align-items-center gap-1 action-btn"
        >
          <User style="width: 14px; height: 14px;" />
          <span>登入</span>
        </button>

        <!-- 桌機版購物袋按鈕 -->
        <button
          @click="cartStore.toggleDrawer(true)"
          type="button"
          class="btn btn-link text-dark position-relative p-2 cart-trigger-btn d-none d-lg-flex"
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

    <!-- 手機版下拉全寬搜尋條 -->
    <div v-if="isMobileSearchExpanded" class="d-md-none border-top px-3 py-2 bg-light">
      <div class="position-relative d-flex align-items-center">
        <Search class="position-absolute start-0 ms-3 text-muted" style="width: 15px; height: 15px;" />
        <input
          :value="searchInput"
          @input="onSearchInput"
          @keyup.enter="performSearch"
          type="text"
          placeholder="搜尋正韓單品、商品標籤..."
          class="form-control form-control-sm rounded-pill ps-5 font-sans"
          autofocus
        />
        <button
          v-if="searchInput"
          @click="clearSearch"
          type="button"
          class="btn btn-link btn-sm text-secondary position-absolute end-0 me-2 p-0 text-decoration-none"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 手機版全品類抽屜 (點擊分類跳轉到獨立分類頁) -->
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
          <span class="fw-bold font-serif text-dark fs-6" style="letter-spacing: 0.1em;">ALL CATEGORIES</span>
          <button type="button" class="btn-close" @click="showMobileMenu = false"></button>
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
                  <div class="mb-2">
                    <button
                      type="button"
                      class="btn btn-dark btn-sm rounded-pill w-100 py-1 font-monospace"
                      style="font-size: 11px;"
                      @click="navigateToCategory(cat.name)"
                    >
                      瀏覽全部 {{ cat.name }} →
                    </button>
                  </div>
                  <div v-for="(sub, sIdx) in cat.subcategories" :key="'ms-' + sIdx" class="mb-3">
                    <div class="fw-bold small text-muted mb-1" style="font-size: 11px;">{{ sub.name }}</div>
                    <div class="d-flex flex-wrap gap-1.5">
                      <button
                        v-for="(item, iIdx) in sub.items"
                        :key="'mi-' + iIdx"
                        @click="navigateToCategory(cat.name, item)"
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

    <!-- 手機端底部導覽列 -->
    <BottomNav
      @open-category="showMobileMenu = true"
      @open-auth="showAuthModal = true"
    />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingBag, Search, User, Settings, ChevronDown } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useMarketingStore } from '../stores/marketingStore'
import AuthModal from './AuthModal.vue'
import BottomNav from './BottomNav.vue'

const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const marketingStore = useMarketingStore()
const router = useRouter()

const showAuthModal = ref(false)
const showMobileMenu = ref(false)
const isMobileSearchExpanded = ref(false)
const searchInput = ref('')

const activeMenuIndex = ref(null)
let leaveTimer = null

const handleMenuEnter = (index) => {
  if (leaveTimer) {
    clearTimeout(leaveTimer)
    leaveTimer = null
  }
  activeMenuIndex.value = index
}

const handleMenuLeave = () => {
  if (leaveTimer) clearTimeout(leaveTimer)
  leaveTimer = setTimeout(() => {
    activeMenuIndex.value = null
  }, 280)
}

const onSearchInput = (e) => {
  searchInput.value = e.target.value
}

const clearSearch = () => {
  searchInput.value = ''
}

// 執行關鍵字搜尋：直接帶去專門分類頁
const performSearch = () => {
  if (searchInput.value.trim()) {
    productStore.setSearchQuery(searchInput.value.trim())
    router.push(`/category/${encodeURIComponent('ALL')}`)
    isMobileSearchExpanded.value = false
  }
}

// ★ 核心：點擊分類時跳轉至獨立頁面
const navigateToCategory = (catName, keyword = '') => {
  activeMenuIndex.value = null
  showMobileMenu.value = false
  isMobileSearchExpanded.value = false

  if (keyword) {
    productStore.setSearchQuery(keyword)
  } else {
    productStore.setSearchQuery('')
  }

  router.push(`/category/${encodeURIComponent(catName)}`)
}
</script>

<style scoped>
.navbar-wrapper {
  z-index: 1030;
  background-color: #ffffff;
}

.navbar-inner-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0.75rem clamp(1rem, 2.5vw, 2.5rem);
  gap: 1rem;
}

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
  margin-top: 10px;
}

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

.nav-actions-section {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.search-box-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 185px;
  height: 36px;
  flex-shrink: 0;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #8c827a;
  pointer-events: none;
  z-index: 3;
}

.search-input {
  width: 100%;
  height: 36px;
  line-height: 36px;
  font-size: 12px;
  padding-left: 34px !important;
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

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

.mobile-drawer {
  width: 320px;
  max-width: 85vw;
  z-index: 1050;
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
}
</style>