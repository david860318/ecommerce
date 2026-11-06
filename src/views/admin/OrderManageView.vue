<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">訂單履約與金物流管理 (OMS)</h1>
        <p class="text-xs text-slate-500 mt-1">處理批次託運標籤列印、狀態變更、線上刷退與發票折讓 (AD-04, AD-05, AD-06, AD-08)</p>
      </div>

      <!-- 訂單狀態篩選按鈕 (AD-04) -->
      <div class="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
        <button
          v-for="filter in ['ALL', 'PAID', 'PENDING', 'SHIPPED', 'REFUNDED']"
          :key="filter"
          @click="statusFilter = filter"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          :class="statusFilter === filter ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'"
        >
          {{ filterMap[filter] }}
        </button>
        <button
  @click="exportCsv"
  class="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
>
  <Download class="w-3.5 h-3.5" />
  匯出訂單 CSV
</button>
      </div>
    </div>

    <!-- 訂單列表清單 -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th class="p-4">訂單編號 / 下單時間</th>
              <th class="p-4">收件人 (RBAC 隱碼保護)</th>
              <th class="p-4">商品明細</th>
              <th class="p-4">實付金額 / 金流</th>
              <th class="p-4">物流 / 託運碼</th>
              <th class="p-4">發票號碼</th>
              <th class="p-4 text-right">履約操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-slate-50/50">
              <td class="p-4 font-mono">
                <span class="font-bold text-slate-900 block">{{ order.id }}</span>
                <span class="text-slate-400 text-[11px]">{{ order.createdAt }}</span>
              </td>

              <!-- RBAC 個資遮蔽檢驗 (AD-01) -->
              <td class="p-4">
                <span class="font-bold text-slate-800">{{ order.customerName }}</span>
                <span class="block text-slate-400 font-mono">{{ order.phone }}</span>
              </td>

              <td class="p-4 max-w-[200px]">
                <div v-for="(item, i) in order.items" :key="i" class="truncate text-slate-800 font-medium">
                  {{ item.name }} × {{ item.quantity }}
                </div>
              </td>

              <td class="p-4">
                <span class="font-bold text-slate-900 text-sm">NT$ {{ order.amount.toLocaleString() }}</span>
                <div class="flex items-center gap-1 mt-0.5">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    :class="order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : order.paymentStatus === 'REFUNDED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ order.paymentStatus === 'PAID' ? '已付款' : order.paymentStatus === 'REFUNDED' ? '已刷退' : '待付款' }}
                  </span>
                  <span class="text-[10px] text-slate-400">({{ order.paymentMethod }})</span>
                </div>
              </td>

              <td class="p-4">
                <span class="font-medium text-slate-700 block">{{ order.shippingMethod }}</span>
                <span v-if="order.trackingCode" class="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1 rounded">
                  {{ order.trackingCode }}
                </span>
                <span v-else class="text-[10px] text-slate-400">尚未產生托運單</span>
              </td>

              <td class="p-4 font-mono">
                <span v-if="order.invoiceNumber" class="text-slate-800 font-medium block">{{ order.invoiceNumber }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.2 rounded font-semibold"
                  :class="order.invoiceStatus === 'ISSUED' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ order.invoiceStatus === 'ISSUED' ? '正常開立' : order.invoiceStatus === 'VOIDED' ? '已折讓作廢' : '未開立' }}
                </span>
              </td>

              <td class="p-4 text-right space-x-2">
                <!-- 執行出貨並生成追蹤碼 (AD-05) -->
                <button
                  v-if="order.shippingStatus === 'PENDING' && order.paymentStatus === 'PAID'"
                  @click="adminStore.markAsShipped(order.id)"
                  class="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  確認出貨
                </button>

                <!-- 退款與折讓發票 (AD-06, AD-08) -->
                <button
                  v-if="order.paymentStatus === 'PAID'"
                  @click="adminStore.refundAndVoidInvoice(order.id)"
                  class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition"
                >
                  退款/折讓
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()
const statusFilter = ref('ALL')

const filterMap = {
  ALL: '全部訂單',
  PAID: '已付款',
  PENDING: '待出貨',
  SHIPPED: '已寄出',
  REFUNDED: '退款/折讓'
}

const filteredOrders = computed(() => {
  if (statusFilter.value === 'ALL') return adminStore.orders
  if (statusFilter.value === 'PAID') return adminStore.orders.filter(o => o.paymentStatus === 'PAID')
  if (statusFilter.value === 'PENDING') return adminStore.orders.filter(o => o.shippingStatus === 'PENDING')
  if (statusFilter.value === 'SHIPPED') return adminStore.orders.filter(o => o.shippingStatus === 'SHIPPED')
  if (statusFilter.value === 'REFUNDED') return adminStore.orders.filter(o => o.paymentStatus === 'REFUNDED')
  return adminStore.orders
})

import { Download } from 'lucide-vue-next'

const exportCsv = () => {
  const headers = ['訂單編號', '下單時間', '收件人', '電話', '金額', '付款狀態', '物流方式', '託運號碼']
  const rows = filteredOrders.value.map(o => [
    o.id,
    o.createdAt,
    o.customerName,
    o.phone,
    o.amount,
    o.paymentStatus,
    o.shippingMethod,
    o.trackingCode || '無'
  ])

  let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `orders_export_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>