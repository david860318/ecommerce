<template>
  <nav class="navbar navbar-expand-lg sticky-top bg-white border-bottom py-2 py-lg-3 shadow-2xs">
    <div class="container" style="max-width: 1240px;">
      <!-- 手機版漢堡選單觸發按鈕 -->
      <button
        class="navbar-toggler border-0 p-1 me-2 d-lg-none"
        type="button"
        @click="showMobileMenu = true"
        aria-label="打開導覽選單"
      >
        <Menu style="width: 22px; height: 22px;" class="text-dark" />
      </button>

      <!-- Brand Logo -->
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 me-lg-4">
        <span class="fw-bold tracking-widest text-dark" style="letter-spacing: 0.15em; font-family: serif; font-size: 1.25rem;">
          MD.SELECT
        </span>
        <span class="text-muted d-none d-sm-inline-block small border-start ps-2" style="font-size: 9px; letter-spacing: 0.1em;">
          SEOUL
        </span>
      </router-link>

      <!-- 桌面版：二級 / 三級階層導航選單 -->
      <div class="collapse navbar-collapse d-none d-lg-block">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
          <li
            v-for="(cat, idx) in marketingStore.categoryTree"
            :key="idx"
            class="nav-item dropdown custom-mega-dropdown"
          >
            <a
              href="javascript:void(0)"
              class="nav-link text-uppercase text-dark small fw-semibold tracking-wider px-3 py-2 dropdown-toggle"
              style="font-size: 11.5px; letter-spacing: 0.08em;"
              role="button"
              data-bs-toggle="dropdown"
            >
              {{ cat.name }}
            </a>

            <!-- 二級 / 三級下拉浮層面板 -->
            <div class="dropdown-menu border border-stone-200/80 shadow-lg p-4 rounded-3 mega-panel">
              <div class="row g-4" style="min-width: 520px;">
                <div v-for="(sub, sIdx) in cat.subcategories" :key="sIdx" class="col-6">
                  <div class="fw-bold small border-bottom pb-1 mb-2 tracking-wide" style="color: #9b7e68 !important;">
                    {{ sub.name }}
                  </div>
                  <ul class="list-unstyled mb-0 d-flex flex-column gap-1.5">
                    <li v-for="(item, iIdx) in sub.items" :key="iIdx">
                      <a
                        href="javascript:void(0)"
                        @click="handleCategoryClick(item)"
                        class="text-decoration-none text-secondary small category-sublink"
                        style="font-size: 11.5px;"
                      >
                        {{ item }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 即時關鍵字搜尋欄 -->
      <div class="d-none d-md-flex align-items-center position-relative mx-auto" style="width: 250px;">
        <Search class="position-absolute text-muted" style="left: 12px; width: 13px; height: 13px;" />
        <input
          :value="productStore.searchInput"
          @input="onSearchInput"
          type="text"
          placeholder="搜尋正韓單品、顏色..."
          class="form-control form-control-sm rounded-pill ps-4 pe-4 bg-light border-0"
          style="font-size: 11.5px;"
        />
        <button
          v-if="productStore.searchInput"
          @click="clearSearch"
          class="btn btn-link btn-sm p-0 position-absolute text-muted text-decoration-none"
          style="right: 12px; font-size: 11px;"
        >
          ×
        </button>
      </div>

      <!-- 右側功能區 -->
      <div class="d-flex align-items-center gap-2 ms-auto ms-lg-0">
        <!-- ★ 核心：只有登入身分為管理者 (isAdmin) 才會顯示後台按鈕 ★ -->
        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="btn btn-dark btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1.5 small shadow-2xs font-monospace"
          style="font-size: 11.5px;"
        >
          <Settings style="width: 13px; height: 13px;" />
          <span>管理後台</span>
        </router-link>

        <!-- 會員入口 -->
        <router-link
          v-if="authStore.user?.isLoggedIn"
          to="/profile"
          class="btn btn-light btn-sm rounded-pill px-3 py-1 text-secondary d-flex align-items-center gap-1 small"
        >
          <User style="width: 13px; height: 13px;" />
          <span class="d-none d-sm-inline">{{ authStore.user.name }}</span>
        </router-link>

        <button
          v-else
          @click="showAuthModal = true"
          class="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-1 small"
        >
          <User style="width: 13px; height: 13px;" />
          <span>登入</span>
        </button>

        <!-- 購物車 -->
        <button
          @click="cartStore.toggleDrawer(true)"
          class="btn btn-link text-dark position-relative p-2"
          aria-label="購物車"
        >
          <ShoppingBag style="width: 20px; height: 20px;" />
          <span
            v-if="cartStore.totalCount > 0"
            class="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-dark"
            style="font-size: 9px;"
          >
            {{ cartStore.totalCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- 手機版 Offcanvas 漢堡選單 -->
    <Teleport to="body">
      <div
        v-if="showMobileMenu"
        class="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
        style="z-index: 1045;"
        @click="showMobileMenu = false"
      ></div>

      <div
        class="position-fixed top-0 start-0 bg-white h-100 p-4 shadow-lg d-flex flex-column transition"
        style="width: 320px; max-width: 85vw; z-index: 1050; transition: transform 0.3s ease;"
        :style="{ transform: showMobileMenu ? 'translateX(0)' : 'translateX(-100%)' }"
      >
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <span class="fw-bold tracking-widest text-dark font-serif" style="letter-spacing: 0.1em;">CATEGORY</span>
          <button type="button" class="btn-close" @click="showMobileMenu = false"></button>
        </div>

        <!-- 手機版管理後台入口 (僅管理者顯示) -->
        <div v-if="authStore.isAdmin" class="mb-3">
          <router-link
            to="/admin"
            class="btn btn-dark btn-sm w-100 rounded-pill py-2 d-flex align-items-center justify-content-center gap-1.5 font-monospace"
            @click="showMobileMenu = false"
          >
            <Settings style="width: 14px; height: 14px;" />
            <span>進入管理後台</span>
          </router-link>
        </div>

        <!-- 手風琴分類 -->
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

        <div class="border-top pt-3 small text-center text-muted">
          MD.SELECT © 2026 SEOUL STUDIO
        </div>
      </div>
    </Teleport>

    <!-- 登入視窗 -->
    <AuthModal :is-open="showAuthModal" @close="showAuthModal = false" />
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingBag, Search, User, Menu, Settings } from 'lucide-vue-next'
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

const onSearchInput = (e) => {
  productStore.setSearchQuery(e.target.value)
}

const clearSearch = () => {
  productStore.setSearchQuery('')
}

const handleCategoryClick = (keyword) => {
  productStore.setSearchQuery(keyword)
  showMobileMenu.value = false
  router.push('/')
}
</script>

<style scoped>
.custom-mega-dropdown:hover .mega-panel {
  display: block;
  animation: fadeInDown 0.2s ease-out forwards;
}

.mega-panel {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  background-color: #ffffff;
}

.category-sublink:hover {
  color: #9b7e68 !important;
  transform: translateX(2px);
  transition: all 0.15s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>