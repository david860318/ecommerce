<template>
  <div class="space-y-8">
    <!-- 1. 行銷折扣引擎 (AD-07) -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-900">行銷促銷模組 (Promotions)</h2>
          <p class="text-xs text-slate-500">設定全館優惠券代碼、低消門檻與啟用排程 (AD-07)</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th class="p-4">折扣代碼</th>
              <th class="p-4">折抵金額</th>
              <th class="p-4">最低消費門檻</th>
              <th class="p-4">到期時間</th>
              <th class="p-4">啟用狀態</th>
              <th class="p-4 text-right">切換開關</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="coupon in adminStore.coupons" :key="coupon.code">
              <td class="p-4 font-mono font-bold text-indigo-600">{{ coupon.code }}</td>
              <td class="p-4 font-bold text-slate-900">NT$ {{ coupon.discount }}</td>
              <td class="p-4">滿 NT$ {{ coupon.minSpend.toLocaleString() }}</td>
              <td class="p-4 font-mono">{{ coupon.expireAt }}</td>
              <td class="p-4">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="coupon.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'"
                >
                  {{ coupon.active ? '生效中' : '已停用' }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button
                  @click="coupon.active = !coupon.active"
                  class="text-xs font-semibold px-3 py-1 rounded-lg border transition"
                  :class="coupon.active ? 'border-rose-200 text-rose-600 hover:bg-rose-50' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'"
                >
                  {{ coupon.active ? '停用' : '啟用' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 2. 會員 CRM 資料庫 (AD-09) -->
    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900">會員關係管理 (CRM)</h2>
        <p class="text-xs text-slate-500">會員累計消費總額 (LTV)、客製標籤與超商取貨風控黑名單 (AD-09)</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th class="p-4">會員編號 / 姓名</th>
              <th class="p-4">聯絡個資 (遮蔽)</th>
              <th class="p-4">累積消費額 (LTV)</th>
              <th class="p-4">總訂單數</th>
              <th class="p-4">會員標籤</th>
              <th class="p-4 text-right">風控設定</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="cust in adminStore.customers" :key="cust.id">
              <td class="p-4">
                <span class="font-bold text-slate-900 block">{{ cust.name }}</span>
                <span class="font-mono text-slate-400 text-[10px]">{{ cust.id }}</span>
              </td>
              <td class="p-4 font-mono text-slate-500">
                <div>{{ cust.phone }}</div>
                <div>{{ cust.email }}</div>
              </td>
              <td class="p-4 font-bold text-slate-900">NT$ {{ cust.totalSpent.toLocaleString() }}</td>
              <td class="p-4">{{ cust.orderCount }} 筆</td>
              <td class="p-4">
                <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                  {{ cust.tag }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button
                  @click="cust.isBlacklisted = !cust.isBlacklisted"
                  class="px-2.5 py-1 rounded-lg text-xs font-semibold transition"
                  :class="cust.isBlacklisted ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  {{ cust.isBlacklisted ? '已列入黑名單 (禁超商)' : '設為黑名單' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()
</script>