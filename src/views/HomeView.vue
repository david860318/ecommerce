<template>
  <main class="container py-3 py-md-5" style="max-width: 1240px; margin: 0 auto;">
    
    <!-- ==================== 1. 主輪播 Banner ==================== -->
    <section
      class="hero-banner-section position-relative overflow-hidden rounded-4 mb-4 mb-md-5 shadow-xs bg-light"
      @mouseenter="stopAutoplay"
      @mouseleave="startAutoplay"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <div class="banner-carousel-container position-relative">
        <div
          v-for="(banner, index) in displayBanners"
          :key="banner.id || index"
          class="banner-slide position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center transition"
          :class="{ 'active-slide': currentBannerIndex === index }"
        >
          <!-- 輪播背景圖 -->
          <img
            :src="banner.image"
            :alt="banner.title"
            class="banner-bg-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            :loading="index === 0 ? 'eager' : 'lazy'"
          />
          
          <!-- 強化型對比漸層遮罩 -->
          <div class="banner-overlay position-absolute top-0 start-0 w-100 h-100"></div>

          <!-- 文案排版區塊 -->
          <div class="banner-text-content position-relative text-white">
            <span class="badge banner-tag rounded-pill mb-2 mb-md-2.5 font-monospace">
              {{ banner.tag || 'SEASON SPECIAL' }}
            </span>
            <h1 class="banner-title fw-bold mb-2 font-serif text-readable">
              {{ banner.title }}
            </h1>
            <p class="banner-subtitle mb-3 mb-md-4 text-readable-sub">
              {{ banner.subtitle }}
            </p>
            <button
              @click="handleBannerClick(banner)"
              type="button"
              class="btn btn-light banner-action-btn rounded-pill fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm"
            >
              <span>{{ banner.buttonText || '立即選購' }}</span>
              <ArrowUpRight style="width: 14px; height: 14px;" />
            </button>
          </div>
        </div>

        <!-- 左右換頁箭頭 (桌機 Hover 時淡入) -->
        <button
          type="button"
          class="banner-nav-btn prev-btn position-absolute top-50 start-0 translate-middle-y ms-3 ms-md-4 rounded-circle border-0 d-none d-md-flex align-items-center justify-content-center"
          @click.stop="prevBanner"
          aria-label="上一張輪播"
        >
          <ChevronLeft class="nav-arrow-icon" />
        </button>
        <button
          type="button"
          class="banner-nav-btn next-btn position-absolute top-50 end-0 translate-middle-y me-3 me-md-4 rounded-circle border-0 d-none d-md-flex align-items-center justify-content-center"
          @click.stop="nextBanner"
          aria-label="下一張輪播"
        >
          <ChevronRight class="nav-arrow-icon" />
        </button>

        <!-- 輪播指示圓點 -->
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

    <!-- ==================== 2. 首頁專屬：「熱門排行 / 當季新品」推薦專區 ==================== -->
    <section class="featured-recommendation-section mb-5">
      <div class="card-korean featured-card-shell p-3 p-sm-4 p-md-4.5 border">
        
        <!-- 頂部切換頁籤與標題說明 -->
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2.5 mb-3 mb-md-4 pb-2 border-bottom border-stone-200">
          <div class="featured-tab-switcher p-1 rounded-pill bg-light border d-inline-flex">
            <button
              type="button"
              class="btn btn-sm rounded-pill tab-switch-btn font-monospace d-inline-flex align-items-center gap-1.5"
              :class="{ 'is-active': activeFeaturedTab === 'hot' }"
              @click="activeFeaturedTab = 'hot'"
            >
              <Crown class="tab-icon crown-icon" />
              <span class="d-none d-sm-inline">熱門排行榜 (Hot Ranking)</span>
              <span class="d-inline d-sm-none">熱門排行</span>
            </button>

            <button
              type="button"
              class="btn btn-sm rounded-pill tab-switch-btn font-monospace d-inline-flex align-items-center gap-1.5"
              :class="{ 'is-active': activeFeaturedTab === 'new' }"
              @click="activeFeaturedTab = 'new'"
            >
              <Sparkles class="tab-icon sparkle-icon" />
              <span class="d-none d-sm-inline">當季新品推薦 (Seasonal New)</span>
              <span class="d-inline d-sm-none">當季新品</span>
            </button>
          </div>

          <!-- 右側副標文字 -->
          <div class="featured-tag-hint text-muted font-monospace small">
            <span class="pulse-status-dot me-1.5"></span>
            {{ activeFeaturedTab === 'hot' ? '本月顧客回購率 TOP 精選' : '2026 首爾時裝週直送新作' }}
          </div>
        </div>

        <!-- 商品陳列 (手機橫向滑軌 / 平板與桌機 4 欄網格) -->
        <div v-if="currentFeaturedProducts.length > 0" class="featured-products-container">
          <div class="featured-grid-row">
            <div
              v-for="(product, pIdx) in currentFeaturedProducts"
              :key="'feat-' + product.id"
              class="featured-grid-col position-relative"
            >
              <!-- 熱門排行專屬名次角標 (#1, #2, #3) -->
              <div
                v-if="activeFeaturedTab === 'hot' && pIdx < 3"
                class="rank-seal-badge font-monospace position-absolute"
                :class="`rank-seal-${pIdx + 1}`"
              >
                NO.{{ pIdx + 1 }}
              </div>

              <ProductCard :product="product" />
            </div>
          </div>
        </div>

        <!-- 預設防空狀態展示 -->
        <div v-else class="text-center py-5 text-muted small bg-light rounded-3">
          <Package class="mb-2 opacity-40" style="width: 32px; height: 32px;" />
          <div>正在為您載入推薦選品，或可至後台開啟商品推薦標記</div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, ArrowUpRight, Package, Crown, Sparkles } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/productStore'
import { useMarketingStore } from '../stores/marketingStore'

const productStore = useProductStore()
const marketingStore = useMarketingStore()
const router = useRouter()

// 頁籤：'hot' | 'new'
const activeFeaturedTab = ref('hot')

// 當前推薦清單（加入 fallback 防護，若後台沒勾選就直接取前幾款商品展示）
const currentFeaturedProducts = computed(() => {
  const allProds = productStore.products || []
  if (activeFeaturedTab.value === 'hot') {
    const list = (productStore.hotRankingProducts || []).length > 0 
      ? productStore.hotRankingProducts 
      : allProds.slice(0, 4)
    return list
  } else {
    const list = (productStore.seasonalNewProducts || []).length > 0 
      ? productStore.seasonalNewProducts 
      : allProds.slice(0, 4)
    return list
  }
})

// 輪播資料（加入預設保底圖片，防止 banners 為空時白畫面）
const defaultBanners = [
  {
    id: 1,
    tag: 'NEW ARRIVAL · 2026',
    title: '首爾晨霧微光特輯，\n探索冬日極簡鬆弛感。',
    subtitle: '全館冬季新品結帳享免運，滿額 NT$ 2,500 再贈精緻羊毛圍巾。',
    buttonText: '探索新品',
    linkType: 'category',
    linkUrl: 'Top 上衣',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    isActive: true
  }
]

const displayBanners = computed(() => {
  const banners = marketingStore.banners || []
  const active = banners.filter(b => b.isActive !== false)
  return active.length > 0 ? active : defaultBanners
})

const currentBannerIndex = ref(0)
let autoplayTimer = null

const startAutoplay = () => {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    nextBanner()
  }, 5500)
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

// 觸控滑動支援
const touchStartX = ref(0)
const touchStartY = ref(0)

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  stopAutoplay()
}

const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const deltaX = touchEndX - touchStartX.value
  const deltaY = touchEndY - touchStartY.value

  if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) {
      nextBanner()
    } else {
      prevBanner()
    }
  }
  startAutoplay()
}

// 點擊輪播跳轉
const handleBannerClick = (banner) => {
  if (banner.isExternal) {
    window.open(banner.linkUrl, '_blank')
  } else if (banner.linkType === 'category') {
    router.push(`/category/${encodeURIComponent(banner.linkUrl || 'Top 上衣')}`)
  } else {
    router.push(banner.linkUrl || '/')
  }
}

onMounted(() => {
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style scoped>
.hero-banner-section {
  width: 100%;
  user-select: none;
}

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

.banner-overlay {
  background: linear-gradient(
    90deg,
    rgba(15, 12, 10, 0.85) 0%,
    rgba(20, 16, 14, 0.65) 45%,
    rgba(30, 25, 22, 0.25) 75%,
    rgba(0, 0, 0, 0.05) 100%
  );
}

@media (max-width: 767.98px) {
  .banner-overlay {
    background: linear-gradient(
      180deg,
      rgba(20, 16, 14, 0.3) 0%,
      rgba(15, 12, 10, 0.85) 60%,
      rgba(10, 8, 7, 0.95) 100%
    );
  }
}

.banner-text-content {
  z-index: 3;
  padding: clamp(1.25rem, 4vw, 3.5rem);
  max-width: 640px;
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
  background-color: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: clamp(9px, 1.2vw, 10.5px);
  padding: 0.35rem 0.75rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.text-readable {
  color: #ffffff !important;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.75),
    0 4px 16px rgba(0, 0, 0, 0.5);
}

.text-readable-sub {
  color: rgba(255, 255, 255, 0.92) !important;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.8),
    0 2px 10px rgba(0, 0, 0, 0.45);
}

.banner-title {
  font-size: clamp(1.25rem, 3.2vw, 2.15rem);
  letter-spacing: 0.04em;
  line-height: 1.35;
}

.banner-subtitle {
  font-size: clamp(12px, 1.4vw, 14px);
  line-height: 1.55;
  font-weight: 400;
}

.banner-action-btn {
  font-size: clamp(11px, 1.2vw, 12.5px);
  padding: 0.45rem 1.25rem;
  color: #2b241f !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25) !important;
}

.banner-nav-btn {
  width: 42px;
  height: 42px;
  background-color: rgba(255, 255, 255, 0.85);
  color: #332d29;
  backdrop-filter: blur(6px);
  z-index: 4;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease, transform 0.2s ease, background-color 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hero-banner-section:hover .banner-nav-btn {
  opacity: 1;
  pointer-events: auto;
}

.banner-nav-btn:hover {
  background-color: #ffffff;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
}

.prev-btn {
  transform: translateY(-50%) translateX(-4px);
}
.hero-banner-section:hover .prev-btn {
  transform: translateY(-50%) translateX(0);
}

.next-btn {
  transform: translateY(-50%) translateX(4px);
}
.hero-banner-section:hover .next-btn {
  transform: translateY(-50%) translateX(0);
}

.nav-arrow-icon {
  width: 18px;
  height: 18px;
}

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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.carousel-dot.is-active {
  width: 22px;
  background-color: #ffffff;
}

/* 精選推薦專區樣式 */
.featured-card-shell {
  background: linear-gradient(180deg, #ffffff 0%, #faf8f5 100%);
  border-radius: 16px;
  border-color: var(--md-border, #ede8e1) !important;
  box-shadow: 0 4px 20px rgba(45, 38, 33, 0.04);
}

.featured-tab-switcher {
  border-color: var(--md-border, #ede8e1) !important;
}

.tab-switch-btn {
  padding: 0.35rem 0.85rem;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--md-text-secondary, #70665f);
  border: none;
  background: transparent;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
  white-space: nowrap;
}

.tab-switch-btn.is-active {
  background-color: #2d2621;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(45, 38, 33, 0.15);
  font-weight: 600;
}

.tab-icon {
  width: 13px;
  height: 13px;
}

.crown-icon {
  color: #d4a373;
}
.tab-switch-btn.is-active .crown-icon {
  color: #ffd166;
}

.sparkle-icon {
  color: var(--md-primary, #9b7e68);
}
.tab-switch-btn.is-active .sparkle-icon {
  color: #f7d6bf;
}

.featured-tag-hint {
  font-size: 11px;
  letter-spacing: 0.02em;
}

.pulse-status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--md-primary, #9b7e68);
  vertical-align: middle;
}

.featured-products-container {
  width: 100%;
}

.featured-grid-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 991.98px) {
  .featured-grid-row {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }
}

/* 手機版橫向滑軌 */
@media (max-width: 767.98px) {
  .featured-products-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0.5rem;
    margin: 0 -0.5rem;
    padding: 0 0.5rem 0.5rem;
    scroll-snap-type: x mandatory;
  }

  .featured-grid-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.65rem;
  }

  .featured-grid-col {
    flex: 0 0 70vw;
    max-width: 250px;
    scroll-snap-align: start;
  }
}

/* 熱門排行名次角標 */
.rank-seal-badge {
  top: 14px;
  left: 14px;
  z-index: 5;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 0.22rem 0.5rem;
  border-radius: 4px;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.rank-seal-1 {
  background: linear-gradient(135deg, #d4a373 0%, #aa7c4d 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.rank-seal-2 {
  background: linear-gradient(135deg, #8a817c 0%, #463f3a 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.rank-seal-3 {
  background: linear-gradient(135deg, #b08968 0%, #7f5539 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
}
</style>