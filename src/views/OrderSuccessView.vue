<template>
  <main class="max-w-7xl mx-auto px-4 py-8">
    <!-- 主宣傳橫幅 (Banner) -->
    <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 sm:p-12 text-white mb-8 shadow-sm relative overflow-hidden">
      <div class="relative z-10 max-w-xl">
        <span class="text-xs uppercase tracking-wider font-semibold bg-white/20 backdrop-blur px-3 py-1 rounded-full">
          限時強檔慶典
        </span>
        <h1 class="text-3xl sm:text-4xl font-extrabold mt-3 mb-2 leading-tight">
          極致質感 生活選品季
        </h1>
        <p class="text-indigo-100 text-sm sm:text-base mb-6">
          全站消費滿 NT$ 1,000 輸入代碼 <span class="font-mono font-bold bg-white/20 px-1.5 py-0.5 rounded">SALE100</span> 現折 $100，單筆滿 NT$ 1,500 即享免運！
        </p>
        <button
          @click="applyBannerCoupon"
          class="bg-white text-indigo-600 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition active:scale-95 shadow-sm"
        >
          一鍵套用 SALE100 折扣碼
        </button>
      </div>
    </div>

    <!-- 限時秒殺專區 (Flash Sale 倒數計時器) -->
    <section class="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div class="flex items-center gap-2">
          <span class="text-rose-600 font-black text-lg flex items-center gap-1">
            <Flame class="w-5 h-5 text-rose-500 fill-rose-500" />
            限時搶購特賣
          </span>
          <span class="text-xs text-rose-500 font-medium bg-rose-100 px-2 py-0.5 rounded-md">
            每日限量
          </span>
        </div>

        <!-- 倒數時鐘 -->
        <div class="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
          <Clock class="w-4 h-4 text-rose-500" />
          <span>距結束僅剩：</span>
          <span class="bg-slate-900 text-white font-mono px-2 py-1 rounded-md">{{ timeLeft.hours }}</span>
          <span>:</span>
          <span class="bg-slate-900 text-white font-mono px-2 py-1 rounded-md">{{ timeLeft.minutes }}</span>
          <span>:</span>
          <span class="bg-slate-900 text-white font-mono px-2 py-1 rounded-md">{{ timeLeft.seconds }}</span>
        </div>
      </div>

      <!-- 秒殺商品排版 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in flashSaleProducts"
          :key="'flash-' + product.id"
          :product="product"
        />
      </div>
    </section>

    <!-- 分類與排序操作欄 -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
        <button
          v-for="cat in productStore.categories"
          :key="cat"
          @click="productStore.selectedCategory = cat"
          class="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition"
          :class="productStore.selectedCategory === cat ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'"
        >
          {{ cat }}
        </button>
      </div>

      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span class="text-xs text-slate-500 whitespace-nowrap">排序：</span>
        <select
          v-model="productStore.sortBy"
          class="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="default">綜合推薦</option>
          <option value="price-asc">價格：由低至高</option>
          <option value="price-desc">價格：由高至低</option>
          <option value="sales">熱門銷量排行</option>
        </select>
      </div>
    </div>

    <!-- 一般商品網格 -->
    <div v-if="productStore.filteredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in productStore.filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
    <div v-else class="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-400">
      沒有找到符合條件的商品。
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Flame, Clock } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'

const productStore = useProductStore()
const cartStore = useCartStore()

// 限時特賣商品 (取前 2 件)
const flashSaleProducts = computed(() => productStore.products.slice(0, 2))

// 倒數計時器邏輯
const timeLeft = ref({ hours: '08', minutes: '45', seconds: '30' })
let timer = null

onMounted(() => {
  let totalSec = 8 * 3600 + 45 * 60 + 30
  timer = setInterval(() => {
    if (totalSec > 0) {
      totalSec--
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
      const s = String(totalSec % 60).padStart(2, '0')
      timeLeft.value = { hours: h, minutes: m, seconds: s }
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const applyBannerCoupon = () => {
  const res = cartStore.applyCoupon('SALE100')
  alert(res.message)
}
</script>