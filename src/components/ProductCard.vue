<template>
  <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col group relative">
    <!-- 愛心收藏 (願望清單 AC: ST-09) -->
    <button
      @click.stop="handleWishlistToggle"
      class="absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition shadow-xs"
      :class="authStore.isInWishlist(product.id) ? 'bg-rose-50 text-rose-500' : 'bg-white/80 text-slate-400 hover:text-slate-600'"
      aria-label="加入願望清單"
    >
      <Heart class="w-4 h-4" :class="{ 'fill-rose-500': authStore.isInWishlist(product.id) }" />
    </button>

    <!-- 商品圖片 -->
    <div class="relative overflow-hidden aspect-square bg-slate-100 cursor-pointer" @click="openQuickView">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <span
        v-if="product.tag"
        class="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-md font-semibold"
      >
        {{ product.tag }}
      </span>
    </div>

    <!-- 商品資訊 -->
    <div class="p-4 flex flex-col flex-1">
      <span class="text-xs text-indigo-600 font-semibold mb-1">{{ product.category }}</span>
      <h3
        @click="openQuickView"
        class="font-medium text-slate-800 text-base line-clamp-1 mb-2 hover:text-indigo-600 cursor-pointer transition"
      >
        {{ product.name }}
      </h3>

      <div class="mt-auto flex items-baseline gap-2 mb-4">
        <span class="text-xl font-bold text-slate-900">NT$ {{ product.basePrice.toLocaleString() }}</span>
        <span v-if="product.originalPrice" class="text-xs text-slate-400 line-through">
          NT$ {{ product.originalPrice.toLocaleString() }}
        </span>
      </div>

      <button
        @click="openQuickView"
        class="w-full bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition active:scale-95"
      >
        選擇規格與購買
      </button>
    </div>

    <!-- PDP 規格選擇彈窗 (AC: ST-05, ST-09) -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          @click="showModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X class="w-5 h-5" />
        </button>

        <div class="flex gap-4 mb-4">
          <img :src="product.image" class="w-20 h-20 rounded-xl object-cover bg-slate-50 flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-900 text-sm truncate">{{ product.name }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2 mt-1">{{ product.description }}</p>
            <div class="text-lg font-bold text-indigo-600 mt-2">
              NT$ {{ selectedSku ? selectedSku.price.toLocaleString() : product.basePrice.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- SKU 規格選取 -->
        <div class="space-y-2 mb-6">
          <div class="flex justify-between items-center text-xs">
            <span class="font-semibold text-slate-700">選擇款式規格：</span>
            <span v-if="selectedSku" class="text-slate-500">
              庫存狀態：<strong :class="selectedSku.stock > 0 ? 'text-emerald-600' : 'text-rose-500'">{{ selectedSku.stock > 0 ? `剩餘 ${selectedSku.stock} 件` : '已售完' }}</strong>
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="sku in product.skus"
              :key="sku.skuId"
              @click="selectedSku = sku"
              class="px-3 py-2.5 rounded-xl text-xs font-medium border text-left flex justify-between items-center transition"
              :class="[
                selectedSku?.skuId === sku.skuId
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300',
                sku.stock === 0 ? 'opacity-50 bg-slate-50' : ''
              ]"
            >
              <span>{{ sku.color }} - {{ sku.size }}</span>
              <span v-if="sku.stock === 0" class="text-[10px] text-rose-500 font-semibold">缺貨</span>
            </button>
          </div>
        </div>

        <!-- 加入購物車 或 貨到通知按鈕 (AC: ST-09) -->
        <button
          v-if="selectedSku && selectedSku.stock > 0"
          @click="handleAddToCart"
          class="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition active:scale-98"
        >
          加入購物車
        </button>
        <button
          v-else
          @click="notifyRestock"
          class="w-full py-3.5 rounded-xl font-bold text-sm text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition"
        >
          🔔 貨到通知我 (缺貨登記)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Heart } from 'lucide-vue-next'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const authStore = useAuthStore()
const showModal = ref(false)
const selectedSku = ref(props.product.skus.find(s => s.stock > 0) || props.product.skus[0])

const openQuickView = () => {
  showModal.value = true
}

const handleWishlistToggle = () => {
  const res = authStore.toggleWishlist(props.product.id)
  alert(res.message)
}

const notifyRestock = () => {
  alert(`已為您登記【${props.product.name} - ${selectedSku.value.color}】補貨提醒，到貨時將發送簡訊/Email 通知！`)
  showModal.value = false
}

const handleAddToCart = () => {
  if (!selectedSku.value) return
  const result = cartStore.addToCart(props.product, selectedSku.value, 1)
  if (!result.success) {
    alert(result.message)
  } else {
    showModal.value = false
  }
}
</script>