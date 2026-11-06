<template>
  <main class="container py-3 py-md-5" style="max-width: 1240px;">
    <!-- 依據後台 AD-11 CMS 的順序動態調配首頁版面 -->
    <template v-for="sec in adminStore.homeSections" :key="sec.id">
      
      <!-- 區塊 A：主輪播 Banner (LCP < 2.5s) -->
      <section v-if="sec.id === 'banner' && sec.visible" class="position-relative overflow-hidden rounded-4 mb-5 shadow-xs bg-light">
        <div class="banner-carousel-container position-relative" style="min-height: 400px; aspect-ratio: 16/7;">
          <div
            v-for="(banner, index) in marketingStore.banners"
            :key="banner.id"
            class="banner-slide position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center transition"
            :class="{ 'active-slide': currentBannerIndex === index }"
          >
            <img
              :src="banner.image"
              :alt="banner.title"
              class="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
              :loading="index === 0 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
              decoding="async"
            />
            <div
              class="position-absolute top-0 start-0 w-100 h-100"
              style="background: linear-gradient(90deg, rgba(30, 25, 22, 0.65) 0%, rgba(30, 25, 22, 0.25) 50%, rgba(0, 0, 0, 0) 100%);"
            ></div>

            <div class="position-relative text-white p-4 p-md-5 ms-md-4" style="max-width: 580px; z-index: 2;">
              <span
                class="badge rounded-pill mb-2 px-3 py-1 font-monospace"
                style="background-color: rgba(255, 255, 255, 0.25); backdrop-filter: blur(4px); font-size: 10px; letter-spacing: 0.1em;"
              >
                {{ banner.tag }}
              </span>
              <h1 class="h2 fw-bold mb-2 tracking-wide font-serif" style="letter-spacing: 0.05em; line-height: 1.25;">
                {{ banner.title }}
              </h1>
              <p class="small text-white-50 mb-4 lh-base" style="font-size: 13px;">{{ banner.subtitle }}</p>
              <button
                @click="handleBannerClick(banner)"
                class="btn btn-light rounded-pill px-4 py-2 small fw-semibold tracking-wide d-inline-flex align-items-center gap-1.5 shadow-sm"
                style="font-size: 12px; color: #332d29;"
              >
                <span>{{ banner.buttonText }}</span>
                <ArrowUpRight style="width: 14px; height: 14px;" />
              </button>
            </div>
          </div>

          <!-- 輪播左右切換指針 -->
          <button
            type="button"
            class="banner-nav-btn prev-btn position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle border-0 d-flex align-items-center justify-content-center"
            @click="prevBanner"
            aria-label="上一張"
          >
            <ChevronLeft style="width: 18px; height: 18px;" />
          </button>
          <button
            type="button"
            class="banner-nav-btn next-btn position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle border-0 d-flex align-items-center justify-content-center"
            @click="nextBanner"
            aria-label="下一張"
          >
            <ChevronRight style="width: 18px; height: 18px;" />
          </button>
        </div>
      </section>

      <!-- 區塊 B：分類導覽與搜尋排序條 -->
      <section v-else-if="sec.id === 'filter_bar' && sec.visible" class="card-korean p-3 p-md-4 mb-4 shadow-xs" id="product-list-top">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div class="d-flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              v-for="cat in productStore.categories"
              :key="cat"
              @click="productStore.setCategory(cat)"
              class="btn btn-sm rounded-pill px-3.5 text-nowrap"
              :class="productStore.selectedCategory === cat ? 'btn-primary' : 'btn-light text-secondary border border-stone-200/80'"
            >
              {{ cat }}
            </button>
          </div>

          <div class="d-flex align-items-center gap-2 ms-auto">
            <span class="small text-muted text-nowrap" style="font-size: 11px;">排序：</span>
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

      <!-- 區塊 C：商品清單網格 -->
      <section v-else-if="sec.id === 'product_grid' && sec.visible" class="mb-5">
        <div v-if="productStore.paginatedProducts.length > 0" class="row g-3 g-md-4">
          <div
            v-for="product in productStore.paginatedProducts"
            :key="product.id"
            class="col-6 col-md-4 col-lg-3"
          >
            <ProductCard :product="product" />
          </div>
        </div>
        <div v-else class="card-korean text-center py-5 my-3 text-muted">
          <Package class="mb-2 opacity-50" style="width: 44px; height: 44px;" />
          <div class="h6 fw-bold text-dark">找不到符合條件的商品</div>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

const currentBannerIndex = ref(0)
let autoplayTimer = null

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => { nextBanner() }, 5000)
}
const stopAutoplay = () => {
  if (autoplayTimer) clearInterval(autoplayTimer)
}
const nextBanner = () => {
  currentBannerIndex.value = (currentBannerIndex.value + 1) % marketingStore.banners.length
}
const prevBanner = () => {
  currentBannerIndex.value =
    (currentBannerIndex.value - 1 + marketingStore.banners.length) % marketingStore.banners.length
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
.banner-nav-btn {
  width: 38px;
  height: 38px;
  background-color: rgba(255, 255, 255, 0.7);
  color: #332d29;
  backdrop-filter: blur(4px);
  z-index: 3;
}
.banner-nav-btn:hover {
  background-color: #ffffff;
  transform: translateY(-50%) scale(1.08);
}
</style>