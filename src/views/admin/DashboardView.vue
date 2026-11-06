<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">營運數據總覽</h1>
        <p class="text-xs text-slate-500 mt-1">即時同步全站交易與轉化漏斗數據 (AD-10)</p>
      </div>
      <div class="text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-mono">
        統計時間：2026-11-06 即時
      </div>
    </div>

    <!-- 關鍵指標卡片 (AD-10) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-semibold text-slate-500">今日實收營收 (GMV)</span>
          <DollarSign class="w-4 h-4 text-emerald-500" />
        </div>
        <div class="text-2xl font-bold text-slate-900">NT$ {{ adminStore.metrics.totalGmv.toLocaleString() }}</div>
        <div class="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
          <span>↑ 18.2%</span> <span class="text-slate-400">較昨日同期</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-semibold text-slate-500">今日累積訂單</span>
          <ShoppingCart class="w-4 h-4 text-indigo-500" />
        </div>
        <div class="text-2xl font-bold text-slate-900">{{ adminStore.metrics.orderCount }} 筆</div>
        <div class="text-xs text-slate-500 mt-2">已成功扣款：{{ adminStore.metrics.paidCount }} 筆</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-semibold text-slate-500">平均客單價 (AOV)</span>
          <TrendingUp class="w-4 h-4 text-violet-500" />
        </div>
        <div class="text-2xl font-bold text-slate-900">NT$ {{ adminStore.metrics.aov.toLocaleString() }}</div>
        <div class="text-xs text-emerald-600 font-medium mt-2">高於業界均值 12%</div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div class="flex justify-between items-center text-slate-400 mb-2">
          <span class="text-xs font-semibold text-slate-500">結帳轉化率</span>
          <Activity class="w-4 h-4 text-amber-500" />
        </div>
        <div class="text-2xl font-bold text-slate-900">{{ adminStore.metrics.conversionRate }}</div>
        <div class="text-xs text-slate-500 mt-2">訪客加購轉換良好</div>
      </div>
    </div>

    <!-- 最近待處理訂單摘要 -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-sm text-slate-800">最新即時訂單流動</h3>
        <router-link to="/admin/orders" class="text-xs text-indigo-600 font-semibold hover:underline">
          查看全部訂單 →
        </router-link>
      </div>
      <div class="divide-y divide-slate-100">
        <div
          v-for="order in adminStore.orders.slice(0, 3)"
          :key="order.id"
          class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-slate-900">{{ order.id }}</span>
              <span class="text-slate-400">|</span>
              <span class="font-medium text-slate-700">{{ order.customerName }}</span>
              <span class="text-slate-400">({{ order.phone }})</span>
            </div>
            <div class="text-slate-500 mt-1">
              {{ order.items[0]?.name }}
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="font-bold text-slate-900">NT$ {{ order.amount.toLocaleString() }}</span>
            <span
              class="px-2.5 py-1 rounded-full text-[11px] font-semibold"
              :class="order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'"
            >
              {{ order.paymentStatus === 'PAID' ? '已付款' : '未付款' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DollarSign, ShoppingCart, TrendingUp, Activity } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()
</script>