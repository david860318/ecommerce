<template>
  <div class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col group relative">
    <!-- 愛心願望清單按鈕 -->
    <button
      @click.stop="handleWishlistToggle"
      class="absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition shadow-xs"
      :class="authStore.isInWishlist(product.id) ? 'bg-rose-50 text-rose-500' : 'bg-white/80 text-slate-400 hover:text-slate-600'"
      aria-label="願望清單"
    >
      <Heart class="w-4 h-4" :class="{ 'fill-rose-500': authStore.isInWishlist(product.id) }" />
    </button>

    <!-- 商品主圖 -->
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
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-indigo-600 font-semibold">{{ product.category }}</span>
        <!-- 評價星星 -->
        <span class="flex items-center gap-1 text-amber-500 font-bold">
          <Star class="w-3 h-3 fill-amber-400 stroke-amber-400" />
          {{ product.rating }}
        </span>
      </div>

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

    <!-- PDP 規格選購彈窗 (含縮圖切換與評價) -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          @click="showModal = false"
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- 縮圖切換區 -->
        <div class="flex gap-4 mb-4">
          <div class="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
            <img :src="activeImage || product.image" class="w-full h-full object-cover" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1 text-xs text-amber-500 font-bold mb-1">
              <Star class="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span>{{ product.rating }} (累積 128 則真實評價)</span>
            </div>
            <h3 class="font-bold text-slate-900 text-base leading-snug">{{ product.name }}</h3>
            <p class="text-xs text-slate-500 line-clamp-2 mt-1">{{ product.description }}</p>
            <div class="text-xl font-black text-indigo-600 mt-2">
              NT$ {{ selectedSku ? selectedSku.price.toLocaleString() : product.basePrice.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- 多圖預覽選單 -->
        <div class="flex gap-2 mb-4">
          <button
            v-for="(img, idx) in [product.image, 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=300&q=80']"
            :key="idx"
            @click="activeImage = img"
            class="w-12 h-12 rounded-xl border-2 overflow-hidden"
            :class="activeImage === img ? 'border-indigo-600' : 'border-slate-200'"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>

        <!-- SKU 規格選取 -->
        <div class="space-y-2 mb-6">
          <div class="flex justify-between items-center text-xs">
            <span class="font-semibold text-slate-700">選擇款式規格：</span>
            <span v-if="selectedSku" class="text-slate-500">
              庫存狀態：<strong :class="selectedSku.stock > 0 ? 'text-emerald-600' : 'text-rose-500'">{{ selectedSku.stock > 0 ? `現貨 ${selectedSku.stock} 件` : '已售完' }}</strong>
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

        <!-- 買家簡評標籤 -->
        <div class="bg-slate-50 rounded-2xl p-3 mb-6 text-xs text-slate-600 space-y-1.5">
          <div class="font-bold text-slate-700">精選買家回饋：</div>
          <div class="flex gap-2 flex-wrap">
            <span class="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">出貨超快速 👍</span>
            <span class="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">質感超乎預期 ✨</span>
            <span class="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">包裝完整無損</span>
          </div>
        </div>

        <!-- 購買按鈕 -->
        <button
          v-if="selectedSku && selectedSku.stock > 0"
          @click="handleAddToCart"
          class="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition active:scale-98 shadow-sm"
        >
          加入購物車
        </button>
        <button
          v-else
          @click="notifyRestock"
          class="w-full py-3.5 rounded-xl font-bold text-sm text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition"
        >
          🔔 貨到通知我 (補貨提醒登記)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, Heart, Star } from 'lucide-vue-next'
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
const activeImage = ref(props.product.image)
const selectedSku = ref(props.product.skus.find((s) => s.stock > 0) || props.product.skus[0])

const openQuickView = () => {
  activeImage.value = props.product.image
  showModal.value = true
}

const handleWishlistToggle = () => {
  const res = authStore.toggleWishlist(props.product.id)
  alert(res.message)
}

const notifyRestock = () => {
  alert(`已為您登記【${props.product.name} - ${selectedSku.value.color}】補貨提醒，商品入庫將自動推播通知！`)
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