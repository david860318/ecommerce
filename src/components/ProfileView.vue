<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <div class="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-2xl flex items-center justify-center">
          {{ authStore.user.name[0] || '用' }}
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-slate-900">{{ authStore.user.name }}</h1>
            <span class="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">{{ authStore.user.tier }}</span>
          </div>
          <p class="text-xs text-slate-500 mt-1 font-mono">手機：{{ authStore.user.phone || '0912-345-678' }} | Email: {{ authStore.user.email }}</p>
        </div>
      </div>
      <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center min-w-[120px]">
        <div class="text-xs text-slate-400">目前點數</div>
        <div class="text-xl font-bold text-indigo-600">{{ authStore.user.points }} 點</div>
      </div>
    </div>

    <!-- 頁籤切換 -->
    <div class="flex border-b border-slate-200 gap-8 mb-6 text-sm font-semibold">
      <button
        @click="activeTab = 'orders'"
        class="pb-3 transition relative"
        :class="activeTab === 'orders' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'"
      >
        訂單紀錄 ({{ adminStore.orders.length }})
      </button>
      <button
        @click="activeTab = 'addresses'"
        class="pb-3 transition relative"
        :class="activeTab === 'addresses' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'"
      >
        常用地址簿 ({{ authStore.user.addresses.length }}/5)
      </button>
    </div>

    <!-- 1. 訂單紀錄區塊 (AC: ST-02) -->
    <div v-if="activeTab === 'orders'" class="space-y-4">
      <div
        v-for="order in adminStore.orders"
        :key="order.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-3"
      >
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
          <div>
            <span class="font-mono font-bold text-slate-900 text-sm mr-2">{{ order.id }}</span>
            <span class="text-slate-400">{{ order.createdAt }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="px-2.5 py-1 rounded-full font-semibold"
              :class="order.shippingStatus === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700' : order.shippingStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'"
            >
              {{ order.shippingStatus === 'SHIPPED' ? '已寄出' : order.shippingStatus === 'CANCELLED' ? '已取消' : '待出貨' }}
            </span>
          </div>
        </div>

        <div class="space-y-2">
          <div v-for="(item, i) in order.items" :key="i" class="flex justify-between items-center text-slate-700">
            <span>{{ item.name }} × {{ item.quantity }}</span>
            <span class="font-bold">NT$ {{ (item.price * item.quantity).toLocaleString() }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-slate-100 gap-2">
          <div class="text-slate-500">
            物流：{{ order.shippingMethod }}
            <span v-if="order.trackingCode" class="font-mono text-indigo-600 ml-1">
              (追蹤號: {{ order.trackingCode }})
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-bold text-slate-900 text-sm">實付 NT$ {{ order.amount.toLocaleString() }}</span>
            <button
              v-if="order.shippingStatus === 'PENDING'"
              @click="cancelOrder(order.id)"
              class="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
            >
              取消訂單
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 地址簿區塊 (AC: ST-02) -->
    <div v-if="activeTab === 'addresses'" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="addr in authStore.user.addresses"
          :key="addr.id"
          class="bg-white rounded-2xl border p-4 shadow-xs relative"
          :class="addr.isDefault ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200'"
        >
          <span v-if="addr.isDefault" class="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md font-semibold absolute top-3 right-3">
            預設地址
          </span>
          <div class="font-bold text-sm text-slate-900">{{ addr.recipient }}</div>
          <div class="font-mono text-xs text-slate-500 mt-1">{{ addr.phone }}</div>
          <p class="text-xs text-slate-600 mt-2">{{ addr.address }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'

const authStore = useAuthStore()
const adminStore = useAdminStore()
const activeTab = ref('orders')

const cancelOrder = (orderId) => {
  if (confirm(`確定要取消訂單 ${orderId} 嗎？`)) {
    const order = adminStore.orders.find(o => o.id === orderId)
    if (order) {
      order.shippingStatus = 'CANCELLED'
      alert('訂單已順利取消！')
    }
  }
}
</script>