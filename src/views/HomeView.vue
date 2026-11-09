<template>
  <main class="container py-3 py-md-5" style="max-width: 1240px; margin: 0 auto;">
    <template v-for="sec in activeSections" :key="sec.id">
      
      <!-- ==================== 區塊 1：響應式 RWD 主輪播 Banner ==================== -->
      <section v-if="sec.id === 'banner'" class="hero-banner-section position-relative overflow-hidden rounded-4 mb-4 mb-md-5 shadow-xs bg-light">
        <div class="banner-carousel-container position-relative">
          <div
            v-for="(banner, index) in displayBanners"
            :key="banner.id"
            class="banner-slide position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center transition"
            :class="{ 'active-slide': currentBannerIndex === index }"
          >
            <!-- 背景圖 -->
            <img
              :src="banner.image"
              :alt="banner.title"
              class="banner-bg-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
              :loading="index === 0 ? 'eager' : 'lazy'"
            />
            
            <!-- 漸層遮罩 (在手機端加強明暗對比以確保文字可讀性) -->
            <div class="banner-overlay position-absolute top-0 start-0 w-100 h-100"></div>

            <!-- 文案內容區塊 (RWD 動態內距與字體大小) -->
            <div class="banner-text-content position-relative text-white">
              <span class="badge banner-tag rounded-pill mb-2 mb-md-2.5 font-monospace">
                {{ banner.tag }}
              </span>
              <h1 class="banner-title fw-bold mb-2 font-serif">
                {{ banner.title }}
              </h1>
              <p class="banner-subtitle text-white-50 mb-3 mb-md-4">
                {{ banner.subtitle }}
              </p>
              <button
                @click="handleBannerClick(banner)"
                type="button"
                class="btn btn-light banner-action-btn rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
              >
                <span>{{ banner.buttonText }}</span>
                <ArrowUpRight style="width: 14px; height: 14px;" />
              </button>
            </div>
          </div>

          <!-- 左右換頁箭頭 (手機端縮小並保留舒適間距) -->
          <button
            type="button"
            class="banner-nav-btn prev-btn position-absolute top-50 start-0 translate-middle-y ms-2 ms-md-4 rounded-circle border-0 d-flex align-items-center justify-content-center"
            @click="prevBanner"
            aria-label="上一張輪播"
          >
            <ChevronLeft class="nav-arrow-icon" />
          </button>
          <button
            type="button"
            class="banner-nav-btn next-btn position-absolute top-50 end-0 translate-middle-y me-2 me-md-4 rounded-circle border-0 d-flex align-items-center justify-content-center"
            @click="nextBanner"
            aria-label="下一張輪播"
          >
            <ChevronRight class="nav-arrow-icon" />
          </button>

          <!-- 輪播圓點指示器 (Dots) -->
          <div class="carousel-dots-wrap position-absolute bottom-0 start-50 translate-middle-x mb-2.5 mb-md-3.5 d-flex gap-1.5">
            <button
              v-for="(_, dIdx) in displayBanners"
              :key="dIdx"
              type="button"
              class="carousel-dot border-0 p-0"
              :class="{ 'is-active': currentBannerIndex === dIdx }"
              @click="currentBannerIndex = dIdx"
              :aria-label="`切換到第 ${dIdx + 1} 張`"
            ></button>
          </div>
        </div>
      </section>

      <!-- 區塊 2：分類篩選與即時排序 -->
      <section v-else-if="sec.id === 'filter_bar'" class="card-korean p-3 p-md-4 mb-4 mb-md-5 shadow-xs" id="product-list-top">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="d-flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              v-for="cat in productStore.categories"
              :key="cat"
              @click="productStore.setCategory(cat)"
              class="btn btn-sm rounded-pill px-3.5 text-nowrap"
              :class="productStore.selectedCategory === cat ? 'btn-primary' : 'btn-light text-secondary border border-stone-200'"
            >
              {{ cat }}
            </button>
          </div>

          <div class="d-flex align-items-center gap-2 ms-auto">
            <span class="small text-muted text-nowrap" style="font-size: 11.5px;">排序：</span>
            <select
              :value="productStore.sortBy"
              @change="productStore.setSortBy($event.target.value)"
              class="form-select form-select-sm rounded-pill font-monospace"
              style="width: 145px; font-size: 12px;"
            >
              <option value="default">綜合推薦</option>
              <option value="price-asc">價格：由低到高</option>
              <option value="price-desc">價格：由高到低</option>
              <option value="newest">上架時間：最新</option>
              <option value="sales">熱銷排行</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 區塊 3：商品展示網格 -->
      <section v-else-if="sec.id === 'product_grid'" class="mb-5 pb-4">
        <div v-if="productStore.paginatedProducts.length > 0" class="row g-3 g-md-4">
          <div
            v-for="product in productStore.paginatedProducts"
            :key="product.id"
            class="col-6 col-md-4 col-lg-3"
          >
            <ProductCard :product="product" />
          </div>
        </div>
        <div v-else class="card-korean text-center py-5 my-4 text-muted bg-white">
          <Package class="mb-2 opacity-50" style="width: 44px; height: 44px;" />
          <div class="h6 fw-bold text-dark">找不到符合條件的商品</div>
          <p class="small text-muted mb-0">請嘗試清除關鍵字搜尋或切換品類分類</p>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, ArrowUpRight, Package } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/productStore'
import { useMarketingStore } from '../stores/marketingStore'
import { useAdminStore } from '../stores/adminStore'

const productStore = useProductStore()
const marketingStore = useMarketingStore()
const adminStore = useAdminStore()
const router = useRouter()

const defaultSections = [
  { id: 'banner', name: '輪播 Banner', visible: true },
  { id: 'filter_bar', name: '分類排序', visible: true },
  { id: 'product_grid', name: '商品網格', visible: true }
]

const activeSections = computed(() => {
  if (adminStore.homeSections && adminStore.homeSections.length > 0) {
    return adminStore.homeSections.filter((s) => s.visible !== false)
  }
  return defaultSections
})

// 僅顯示啟用中（isActive）的 Banner，並依 sortOrder 排序
const displayBanners = computed(() => {
  const list = (marketingStore.banners || []).filter(b => b.isActive !== false)
  return list.length > 0 ? list : marketingStore.banners
})

const currentBannerIndex = ref(0)
let autoplayTimer = null

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => { nextBanner() }, 5500)
}
const stopAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer)
}
const nextBanner = () => {
  if (displayBanners.value.length === 0) return
  currentBannerIndex.value = (currentBannerIndex.value + 1) % displayBanners.value.length
}
const prevBanner = () => {
  if (displayBanners.value.length === 0) return
  currentBannerIndex.value =
    (currentBannerIndex.value - 1 + displayBanners.value.length) % displayBanners.value.length
}

const handleBannerClick = (banner) => {
  if (banner.isExternal) {
    window.open(banner.linkUrl, '_blank')
  } else if (banner.linkType === 'category') {
    productStore.setCategory(banner.linkUrl)
    const listElem = document.getElementById('product-list-top')
    if (listElem) listElem.scrollIntoView({ behavior: 'smooth' })
  } else {
    router.push(banner.linkUrl)
  }
}

onMounted(() => { startAutoplay() })
onUnmounted(() => { stopAutoplay() })
</script>

<style scoped>
/* ==================== RWD 主輪播自適應排版 ==================== */
.hero-banner-section {
  width: 100%;
}

/* 桌面端：16/7 黃金比例，最低 400px；平板/手機端自適應 */
.banner-carousel-container {
  width: 100%;
  aspect-ratio: 16 / 7;
  min-height: 420px;
}

@media (max-width: 991.98px) {
  .banner-carousel-container {
    aspect-ratio: 16 / 9;
    min-height: 380px;
  }
}

@media (max-width: 767.98px) {
  .banner-carousel-container {
    aspect-ratio: 4 / 3;
    min-height: 340px;
  }
}

.banner-slide {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}
.banner-slide.active-slide {
  opacity: 1;
  pointer-events: auto;
  z-index: 2;
}

/* 漸層遮罩：桌面端左深右淺，手機端全域均勻暗化加強文字閱讀 */
.banner-overlay {
  background: linear-gradient(90deg, rgba(30, 25, 22, 0.72) 0%, rgba(30, 25, 22, 0.35) 60%, rgba(0, 0, 0, 0.1) 100%);
}

@media (max-width: 767.98px) {
  .banner-overlay {
    background: linear-gradient(180deg, rgba(30, 25, 22, 0.3) 0%, rgba(30, 25, 22, 0.75) 100%);
  }
}

/* 文案排版 RWD */
.banner-text-content {
  z-index: 3;
  padding: clamp(1.25rem, 4vw, 3.5rem);
  max-width: 620px;
  white-space: pre-line;
}

@media (max-width: 767.98px) {
  .banner-text-content {
    max-width: 100%;
    margin-top: auto;
    padding-bottom: 2.75rem;
  }
}

.banner-tag {
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  font-size: clamp(9px, 1.2vw, 10.5px);
  padding: 0.35rem 0.75rem;
}

.banner-title {
  font-size: clamp(1.25rem, 3.2vw, 2.15rem);
  letter-spacing: 0.04em;
  line-height: 1.3;
}

.banner-subtitle {
  font-size: clamp(11.5px, 1.4vw, 13.5px);
  line-height: 1.5;
}

.banner-action-btn {
  font-size: clamp(11px, 1.2vw, 12.5px);
  padding: 0.45rem 1.25rem;
  color: #332d29 !important;
}

/* 箭頭按鈕 RWD */
.banner-nav-btn {
  width: clamp(32px, 4vw, 42px);
  height: clamp(32px, 4vw, 42px);
  background-color: rgba(255, 255, 255, 0.75);
  color: #332d29;
  backdrop-filter: blur(4px);
  z-index: 4;
  transition: all 0.2s ease;
}
.banner-nav-btn:hover {
  background-color: #ffffff;
  transform: translateY(-50%) scale(1.08);
}
.nav-arrow-icon {
  width: clamp(14px, 2vw, 18px);
  height: clamp(14px, 2vw, 18px);
}

/* 指示圓點 */
.carousel-dots-wrap {
  z-index: 4;
}
.carousel-dot {
  width: 7px;
  height: 7px;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.45);
  transition: all 0.25s ease;
  cursor: pointer;
}
.carousel-dot.is-active {
  width: 22px;
  background-color: #ffffff;
}
</style>