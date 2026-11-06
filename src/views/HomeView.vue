<template>
  <main class="max-w-7xl mx-auto px-4 py-8">
    <!-- 行銷 Banner 區塊 (AC: ST-03) -->
    <div class="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 sm:p-12 text-white mb-8 shadow-sm">
      <span class="text-xs uppercase tracking-wider font-semibold bg-white/20 px-3 py-1 rounded-full">開幕特惠</span>
      <h1 class="text-3xl sm:text-4xl font-extrabold mt-3 mb-2">精選質感生活風格週</h1>
      <p class="text-indigo-100 text-sm sm:text-base max-w-lg mb-6">全館單筆滿 NT$ 1,000 輸入代碼 SALE100 現折 NT$ 100，滿 NT$ 1,500 即享免運優惠！</p>
      <button
        @click="applyBannerCoupon"
        class="bg-white text-indigo-600 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition active:scale-95"
      >
        一鍵領取折扣碼 SALE100
      </button>
    </div>

    <!-- 分類與排序操作欄 (AC: ST-04) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <!-- 分類標籤 -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
        <button
          v-for="cat in productStore.categories"
          :key="cat"
          @click="productStore.selectedCategory = cat"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition"
          :class="productStore.selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          {{ cat }}
        </button>
      </div>

      <!-- 排序選單 -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span class="text-xs text-slate-500 whitespace-nowrap">排序方式：</span>
        <select
          v-model="productStore.sortBy"
          class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="default">預設推薦</option>
          <option value="price-asc">價格：由低到高</option>
          <option value="price-desc">價格：由高到低</option>
          <option value="sales">熱門銷量排行</option>
        </select>
      </div>
    </div>

    <!-- 商品網格 (AC: ST-04, ST-05) -->
    <div v-if="productStore.filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in productStore.filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
    <div v-else class="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400">
      查無符合條件之商品。
    </div>
  </main>
</template>

<script setup>
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'

const productStore = useProductStore()
const cartStore = useCartStore()

const applyBannerCoupon = () => {
  const res = cartStore.applyCoupon('SALE100')
  alert(res.message)
}
</script>