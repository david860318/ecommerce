<template>
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
      <!-- 品牌 Logo -->
      <router-link to="/" class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          S
        </div>
        <span class="font-bold text-xl tracking-tight text-slate-800">SHOPFLOW</span>
      </router-link>

      <!-- 即時關鍵字搜尋 -->
      <div class="flex-1 max-w-md relative hidden sm:block">
        <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="productStore.searchQuery"
          type="text"
          placeholder="搜尋商品關鍵字..."
          class="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <!-- 右側按鈕區 -->
      <div class="flex items-center gap-2">
        <!-- 切換後台按鈕 -->
        <router-link
          to="/admin"
          class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
        >
          <Settings class="w-3.5 h-3.5" />
          <span>管理後台</span>
        </router-link>

        <!-- 購物車觸發按鈕 -->
        <button
          @click="cartStore.toggleDrawer(true)"
          class="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-700 transition"
          aria-label="打開購物車"
        >
          <ShoppingBag class="w-6 h-6" />
          <span
            v-if="cartStore.totalCount > 0"
            class="absolute top-1 right-1 bg-rose-500 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-pulse"
          >
            {{ cartStore.totalCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ShoppingBag, Search, Settings } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'

const productStore = useProductStore()
const cartStore = useCartStore()
</script>