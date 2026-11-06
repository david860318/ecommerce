<template>
  <!-- 背景遮罩 -->
  <div
    v-if="cartStore.isDrawerOpen"
    @click="cartStore.toggleDrawer(false)"
    class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 transition-opacity"
  ></div>

  <!-- 抽屜本體 -->
  <aside
    class="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
    :class="cartStore.isDrawerOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- 頂部標題 -->
    <div class="p-4 border-b border-slate-100 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-bold text-slate-900">購物清單</h2>
        <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
          {{ cartStore.totalCount }} 件
        </span>
      </div>
      <button
        @click="cartStore.toggleDrawer(false)"
        class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- 免運門檻提示 (滿 NT$ 1500) -->
    <div class="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
      <div v-if="cartStore.remainingForFreeShipping > 0" class="text-xs text-indigo-800 font-medium">
        再消費 <span class="font-bold text-indigo-600">NT$ {{ cartStore.remainingForFreeShipping.toLocaleString() }}</span> 即享免運優惠！
      </div>
      <div v-else class="text-xs text-emerald-700 font-medium flex items-center gap-1">
        <span>🎉 已達滿額免運門檻！</span>
      </div>
      <div class="w-full bg-indigo-200/60 rounded-full h-1.5 mt-2 overflow-hidden">
        <div
          class="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
          :style="{ width: `${Math.min(100, (cartStore.subtotal / cartStore.FREE_SHIPPING_THRESHOLD) * 100)}%` }"
        ></div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-if="cartStore.items.length === 0" class="text-center py-20 text-slate-400">
        <ShoppingBag class="w-12 h-12 mx-auto stroke-1 mb-2 opacity-40" />
        <p class="text-sm">購物車目前是空的</p>
      </div>

      <div
        v-for="item in cartStore.items"
        :key="item.skuId"
        class="flex gap-3 pb-4 border-b border-slate-100 items-center"
      >
        <img :src="item.image" :alt="item.name" class="w-16 h-16 rounded-xl object-cover bg-slate-50 flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-medium text-slate-800 truncate">{{ item.name }}</h4>
          <p class="text-xs text-slate-400">{{ item.skuName }}</p>
          <span class="text-sm font-bold text-slate-900 block mt-1">NT$ {{ item.price.toLocaleString() }}</span>
          
          <div class="flex items-center gap-2 mt-2">
            <button
              @click="cartStore.updateQuantity(item.skuId, -1)"
              class="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 text-xs"
            >
              -
            </button>
            <span class="text-xs font-bold w-6 text-center">{{ item.quantity }}</span>
            <button
              @click="cartStore.updateQuantity(item.skuId, 1)"
              class="w-6 h-6 rounded border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 text-xs"
            >
              +
            </button>
          </div>
        </div>
        <button
          @click="cartStore.removeFromCart(item.skuId)"
          class="text-slate-400 hover:text-rose-500 transition p-1"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 底部金額結算與折抵 -->
    <div v-if="cartStore.items.length > 0" class="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
      <!-- 折扣碼區塊 (AC: ST-08) -->
      <div class="flex gap-2">
        <input
          v-model="inputCoupon"
          type="text"
          placeholder="優惠代碼 (輸入 SALE100)"
          class="flex-1 text-xs border border-slate-200 px-3 py-2 rounded-xl uppercase focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
        />
        <button
          @click="onApplyCoupon"
          class="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl font-medium transition"
        >
          套用
        </button>
      </div>

      <div class="space-y-1.5 text-xs text-slate-600 pt-1">
        <div class="flex justify-between">
          <span>商品小計</span>
          <span>NT$ {{ cartStore.subtotal.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between">
          <span>運費</span>
          <span>{{ cartStore.shippingFee === 0 ? '免運' : `NT$ ${cartStore.shippingFee}` }}</span>
        </div>
        <div v-if="cartStore.discountAmount > 0" class="flex justify-between text-emerald-600 font-semibold">
          <span>折扣代碼折抵</span>
          <span>- NT$ {{ cartStore.discountAmount.toLocaleString() }}</span>
        </div>
        <div class="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
          <span>總計金額</span>
          <span>NT$ {{ cartStore.total.toLocaleString() }}</span>
        </div>
      </div>

      <button
        @click="goToCheckout"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
      >
        前往結帳
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-vue-next'
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()
const router = useRouter()
const inputCoupon = ref('')

const onApplyCoupon = () => {
  const res = cartStore.applyCoupon(inputCoupon.value)
  alert(res.message)
}

const goToCheckout = () => {
  cartStore.toggleDrawer(false)
  router.push('/checkout')
}
</script>