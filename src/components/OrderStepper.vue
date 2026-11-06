<template>
  <div class="w-full py-4">
    <!-- 情況 A：已取消 (Cancelled) 狀態獨立展示 -->
    <div
      v-if="order.status === 'CANCELLED'"
      class="bg-slate-50 border border-slate-200 text-slate-700 px-5 py-4 rounded-2xl flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
          <X class="w-4 h-4" />
        </div>
        <div>
          <h4 class="font-bold text-sm text-slate-900">訂單已取消</h4>
          <p class="text-xs text-slate-500 mt-0.5">顧客主動取消或付款逾期超時，系統已自動釋放預留庫存。</p>
        </div>
      </div>
      <span class="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-600 rounded-md">流程終止</span>
    </div>

    <!-- 情況 B：退貨 / 退款中 (Refund / Return) 狀態獨立展示 -->
    <div
      v-else-if="order.status === 'REFUNDING'"
      class="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-2xl flex items-center justify-between"
    >
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center font-bold">
          <RotateCcw class="w-4 h-4" />
        </div>
        <div>
          <h4 class="font-bold text-sm text-rose-900">退貨 / 退款申請審核中</h4>
          <p class="text-xs text-rose-700 mt-0.5">已建立退貨單，待倉庫收到商品驗收無誤後，系統將執行金流刷退並回補庫存。</p>
        </div>
      </div>
      <span class="text-xs font-semibold px-2.5 py-1 bg-rose-100 text-rose-800 rounded-md">售後處理中</span>
    </div>

    <!-- 情況 C：主要正向流轉（待付款 ➔ 處理中/備貨中 ➔ 已出貨 ➔ 已完成） -->
    <div v-else class="relative max-w-3xl mx-auto px-4">
      <!-- 背景灰色進度底線 -->
      <div class="absolute left-8 right-8 top-5 h-1 bg-slate-100 -z-0"></div>

      <!-- 動態藍色已完成進度線 -->
      <div
        class="absolute left-8 top-5 h-1 bg-indigo-600 transition-all duration-500 -z-0"
        :style="{ width: progressLineWidth }"
      ></div>

      <!-- 4 步驟節點 -->
      <div class="relative z-10 flex items-start justify-between">
        <div
          v-for="(step, index) in steps"
          :key="step.key"
          class="flex flex-col items-center text-center w-24 sm:w-28"
        >
          <!-- 節點圖示圓圈 -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs"
            :class="[
              isStepPassed(index)
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-50'
                : isStepCurrent(index)
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-105'
                : 'bg-white border-2 border-slate-200 text-slate-400'
            ]"
          >
            <!-- 若已通過顯示打勾，否則顯示對應圖示 -->
            <Check v-if="isStepPassed(index)" class="w-5 h-5 stroke-[3]" />
            <component v-else :is="step.icon" class="w-4 h-4" />
          </div>

          <!-- 步驟標題 -->
          <span
            class="text-xs mt-2.5 font-bold whitespace-nowrap"
            :class="isStepActive(index) ? 'text-indigo-600' : 'text-slate-400'"
          >
            {{ step.title }}
          </span>

          <!-- 說明 -->
          <span class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
            {{ step.desc }}
          </span>

          <!-- 時間戳記 -->
          <span v-if="getStepTime(index)" class="text-[9px] font-mono text-slate-400 mt-1">
            {{ getStepTime(index) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  CreditCard,
  PackageSearch,
  Truck,
  CheckCircle2,
  Check,
  X,
  RotateCcw
} from 'lucide-vue-next'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

// 4 大標準步驟設定
const steps = [
  { key: 'PENDING_PAYMENT', title: '1. 待付款', desc: '等待金流授權', icon: CreditCard },
  { key: 'PROCESSING', title: '2. 處理/備貨中', desc: '倉庫揀貨包裝', icon: PackageSearch },
  { key: 'SHIPPED', title: '3. 已出貨', desc: '物流配送中', icon: Truck },
  { key: 'COMPLETED', title: '4. 已完成', desc: '順利送達結案', icon: CheckCircle2 }
]

const statusStepMap = {
  PENDING_PAYMENT: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  COMPLETED: 3
}

const currentStepIndex = computed(() => {
  return statusStepMap[props.order.status] ?? 0
})

const isStepPassed = (index) => index < currentStepIndex.value
const isStepCurrent = (index) => index === currentStepIndex.value
const isStepActive = (index) => index <= currentStepIndex.value

// 計算連接線寬度百分比
const progressLineWidth = computed(() => {
  const totalGaps = steps.length - 1
  const completedGaps = Math.min(currentStepIndex.value, totalGaps)
  return `${(completedGaps / totalGaps) * 100}%`
})

// 取得該節點完成時間
const getStepTime = (index) => {
  if (index === 0) return props.order.createdAt?.slice(5, 16)
  if (index === 1) return props.order.paidAt?.slice(5, 16)
  if (index === 2) return props.order.shippedAt?.slice(5, 16)
  if (index === 3) return props.order.completedAt?.slice(5, 16)
  return null
}
</script>