<template>
  <main class="container py-3 py-md-5 category-page-container" style="max-width: 1240px; margin: 0 auto;">
    <!-- 1. 麵包屑導航與分類標題 -->
    <div class="category-header mb-4">
      <nav class="small text-muted mb-2" aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none text-muted">首頁</router-link>
          </li>
          <li class="breadcrumb-item active text-dark fw-semibold" aria-current="page">
            {{ currentCategory }}
          </li>
        </ol>
      </nav>

      <div class="d-flex justify-content-between align-items-end border-bottom pb-3">
        <div>
          <div class="text-uppercase text-muted font-monospace small" style="letter-spacing: 0.1em; font-size: 11px;">
            CATEGORY ARCHIVE
          </div>
          <h1 class="h3 fw-bold text-dark font-serif mb-0 mt-1">
            {{ currentCategory }}
          </h1>
        </div>

        <span class="text-muted small font-monospace">
          共 {{ categoryProducts.length }} 款單品
        </span>
      </div>
    </div>

    <!-- 2. 分類篩選與即時排序列 -->
    <section class="card-korean p-3 p-md-4 mb-4 mb-md-5 shadow-xs bg-white">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <!-- 快速品類切換標籤 -->
        <div class="d-flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="cat in productStore.categories"
            :key="cat"
            type="button"
            class="btn btn-sm rounded-pill px-3.5 text-nowrap"
            :class="currentCategory === cat ? 'btn-primary' : 'btn-light text-secondary border border-stone-200'"
            @click="switchCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>

        <!-- 排序方式選擇 -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          <span class="small text-muted text-nowrap" style="font-size: 11.5px;">排序：</span>
          <select
            v-model="currentSortBy"
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

    <!-- 3. 商品展示網格 -->
    <section class="mb-5 pb-4">
      <div v-if="categoryProducts.length > 0" class="row g-3 g-md-4">
        <div
          v-for="product in categoryProducts"
          :key="product.id"
          class="col-6 col-md-4 col-lg-3"
        >
          <ProductCard :product="product" />
        </div>
      </div>

      <!-- 空資料狀態 -->
      <div v-else class="card-korean text-center py-5 my-4 text-muted bg-white">
        <Package class="mb-2 opacity-50" style="width: 44px; height: 44px;" />
        <div class="h6 fw-bold text-dark">此分類目前尚無上架商品</div>
        <p class="small text-muted mb-3">歡迎瀏覽其他分類挑選新品</p>
        <router-link to="/" class="btn btn-outline-secondary btn-sm rounded-pill px-4">
          回到首頁
        </router-link>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Package } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/productStore'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const currentSortBy = ref('default')

const currentCategory = computed(() => {
  return route.params.categoryName ? decodeURIComponent(route.params.categoryName) : 'ALL'
})

const switchCategory = (cat) => {
  router.push(`/category/${encodeURIComponent(cat)}`)
}

const categoryProducts = computed(() => {
  let list = [...(productStore.products || [])]

  if (currentCategory.value && currentCategory.value !== 'ALL') {
    const targetCat = currentCategory.value.trim().toLowerCase()
    list = list.filter((p) => {
      const pCat = (p.category || '').toLowerCase()
      return pCat === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat)
    })
  }

  if (productStore.searchQuery && productStore.searchQuery.trim()) {
    const q = productStore.searchQuery.trim().toLowerCase()
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    )
  }

  if (currentSortBy.value === 'price-asc') {
    list.sort((a, b) => a.basePrice - b.basePrice)
  } else if (currentSortBy.value === 'price-desc') {
    list.sort((a, b) => b.basePrice - a.basePrice)
  } else if (currentSortBy.value === 'sales') {
    list.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
  } else if (currentSortBy.value === 'newest') {
    list.sort((a, b) => b.id - a.id)
  }

  return list
})

watch(
  () => route.params.categoryName,
  () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
)
</script>

<style scoped>
.category-page-container {
  max-width: 1240px;
  margin: 0 auto;
}
</style>