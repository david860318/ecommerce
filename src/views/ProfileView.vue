<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <!-- 會員卡片與登出按鈕 (韓系極簡名片感) -->
    <div class="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-brand-100 text-brand-700 font-serif font-bold text-xl flex items-center justify-center border border-brand-200/60 flex-shrink-0">
          {{ authStore.user?.name ? authStore.user.name[0] : 'M' }}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-lg font-bold text-stone-800 tracking-wide">{{ authStore.user?.name || '陳大文' }}</h1>
            <span class="text-[11px] bg-brand-50 text-brand-600 px-2.5 py-0.5 rounded-full font-medium border border-brand-200/60">
              {{ authStore.user?.tier || 'VIP MEMBER' }}
            </span>
          </div>
          <p class="text-xs text-stone-400 mt-1 font-mono tracking-normal">
            {{ authStore.user?.phone || '0912-345-678' }} · {{ authStore.user?.email || 'user@md-korea.com' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        <div class="bg-stone-50 px-4 py-2 rounded-xl border border-stone-200/60 text-center">
          <div class="text-[10px] text-stone-400 tracking-wider">REWARD POINTS</div>
          <div class="text-base font-serif font-bold text-brand-700">{{ authStore.user?.points || 150 }} <span class="text-xs font-sans font-normal text-stone-400">點</span></div>
        </div>

        <button
          @click="handleLogout"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 text-xs font-medium transition active:scale-95"
        >
          <LogOut class="w-3.5 h-3.5" />
          登出
        </button>
      </div>
    </div>

    <!-- 主頁籤導航 (韓系極簡下劃線風格) -->
    <div class="flex border-b border-stone-200 gap-8 mb-6 text-xs tracking-wider uppercase font-medium">
      <button
        @click="activeMainTab = 'orders'"
        class="pb-3 transition relative flex items-center gap-1.5"
        :class="activeMainTab === 'orders' ? 'text-brand-700 border-b border-brand-700 font-bold' : 'text-stone-400 hover:text-stone-600'"
      >
        <Package class="w-3.5 h-3.5" />
        訂單紀錄 ({{ userOrders.length }})
      </button>
      <button
        @click="activeMainTab = 'addresses'"
        class="pb-3 transition relative flex items-center gap-1.5"
        :class="activeMainTab === 'addresses' ? 'text-brand-700 border-b border-brand-700 font-bold' : 'text-stone-400 hover:text-stone-600'"
      >
        <MapPin class="w-3.5 h-3.5" />
        常用地址 ({{ (authStore.user?.addresses || []).length }}/5)
      </button>
      <button
        @click="activeMainTab = 'profile'"
        class="pb-3 transition relative flex items-center gap-1.5"
        :class="activeMainTab === 'profile' ? 'text-brand-700 border-b border-brand-700 font-bold' : 'text-stone-400 hover:text-stone-600'"
      >
        <User class="w-3.5 h-3.5" />
        個人資料
      </button>
    </div>

    <!-- 模組 1：訂單歷程與韓系優雅步驟條 -->
    <div v-if="activeMainTab === 'orders'" class="space-y-6">

      <!-- ★ 韓系大地色感步驟條 ★ -->
      <div class="bg-white rounded-2xl border border-stone-200/70 p-5 sm:p-7 shadow-xs">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
            <h3 class="font-bold text-xs tracking-wider text-stone-700 uppercase">ORDER PROGRESS</h3>
          </div>
          <span class="text-[11px] text-stone-400">點選步驟查看進度</span>
        </div>

        <div class="overflow-x-auto pb-2 scrollbar-none">
          <div class="min-w-[640px] relative px-4 flex items-center justify-between">
            <!-- 灰色底線 -->
            <div class="absolute left-8 right-8 top-5 h-0.5 bg-stone-100 -z-0"></div>

            <!-- 動態大地色填充線 -->
            <div
              class="absolute left-8 top-5 h-0.5 rounded-full transition-all duration-300 ease-out -z-0"
              :class="stepperLineClass"
              :style="{ width: stepperProgressWidth }"
            ></div>

            <!-- 步驟節點 -->
            <button
              v-for="step in interactiveSteps"
              :key="step.key"
              @click="currentStatus = step.key"
              type="button"
              class="flex flex-col items-center group relative z-10 focus:outline-none cursor-pointer transition-transform duration-150 active:scale-95"
              style="width: 76px;"
            >
              <div class="relative">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                  :class="[
                    currentStatus === step.key
                      ? getNodeActiveClass(step.key)
                      : 'bg-white border border-stone-200 text-stone-400 group-hover:border-brand-400 group-hover:text-brand-600'
                  ]"
                >
                  <component :is="step.icon" class="w-4 h-4 stroke-[1.8]" />
                </div>

                <span
                  v-if="getOrderCount(step.key) > 0"
                  class="absolute -top-1 -right-1 text-[9px] font-mono font-bold px-1.5 rounded-full border border-white"
                  :class="currentStatus === step.key ? 'bg-stone-800 text-white' : 'bg-brand-500 text-white'"
                >
                  {{ getOrderCount(step.key) }}
                </span>
              </div>

              <span
                class="text-[11px] mt-2 font-medium tracking-tight whitespace-nowrap"
                :class="currentStatus === step.key ? 'text-brand-700 font-bold' : 'text-stone-500 group-hover:text-stone-700'"
              >
                {{ step.title }}
              </span>

              <span class="text-[9px] text-stone-400 tracking-wider">
                {{ step.desc }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 當前過濾標籤說明 -->
      <div class="flex items-center justify-between px-1 text-xs text-stone-500">
        <div>
          篩選檢視：<span class="font-bold text-stone-800">{{ getFilterTitle(currentStatus) }}</span>
          <span class="text-stone-400"> ({{ filteredOrders.length }})</span>
        </div>
        <button
          v-if="currentStatus !== 'ALL'"
          @click="currentStatus = 'ALL'"
          class="text-brand-600 hover:underline"
        >
          查看所有訂單
        </button>
      </div>

      <!-- 訂單卡片清單 (韓系極簡線條) -->
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="bg-white rounded-2xl border border-stone-200/70 p-5 sm:p-6 shadow-xs text-xs space-y-4"
      >
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-stone-100 pb-3">
          <div class="flex items-center gap-3">
            <span class="font-mono font-bold text-stone-800">{{ order.id }}</span>
            <span class="text-stone-400 text-[11px]">{{ order.createdAt }}</span>
          </div>

          <span
            class="px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide self-start sm:self-auto"
            :class="getBadgeClass(order.status)"
          >
            {{ getStatusText(order.status) }}
          </span>
        </div>

        <!-- 商品明細 (韓系 3:4 縮圖與文字排版) -->
        <div class="divide-y divide-stone-100">
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-12 h-16 rounded-md bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200/50">
                <img :src="item.image || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80'" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <p class="font-medium text-stone-800 text-xs truncate">{{ item.name }}</p>
                <p class="text-stone-400 text-[11px] mt-0.5">數量：{{ item.quantity }}</p>
              </div>
            </div>
            <span class="font-serif font-bold text-stone-800 flex-shrink-0">
              NT$ {{ (item.price * item.quantity).toLocaleString() }}
            </span>
          </div>
        </div>

        <!-- 底部查件與操作 -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 border-t border-stone-100 gap-3">
          <div class="text-stone-500 text-[11px] flex flex-wrap items-center gap-2">
            <span>{{ order.shippingMethod }}</span>
            <span v-if="order.trackingCode" class="inline-flex items-center gap-1 text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60 font-mono">
              {{ order.trackingCode }}
              <a
                :href="getTrackingUrl(order.shippingMethod, order.trackingCode)"
                target="_blank"
                class="text-brand-600 hover:text-brand-800 ml-1 inline-flex items-center gap-0.5 underline"
              >
                查件
                <ExternalLink class="w-3 h-3" />
              </a>
            </span>
          </div>

          <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
            <div class="text-right">
              <span class="text-[10px] text-stone-400 block tracking-wider uppercase">Total</span>
              <span class="font-serif font-bold text-stone-900 text-sm">NT$ {{ order.amount.toLocaleString() }}</span>
            </div>

            <button
              v-if="order.status === 'PENDING_PAYMENT' || order.status === 'PROCESSING'"
              @click="cancelOrder(order)"
              class="px-3 py-1.5 border border-stone-300 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-medium transition"
            >
              取消訂單
            </button>

            <button
              v-if="order.status === 'COMPLETED'"
              @click="requestRefund(order)"
              class="px-3 py-1.5 border border-stone-300 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-medium transition"
            >
              申請售後
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模組 2：地址簿維護 -->
    <div v-if="activeMainTab === 'addresses'" class="space-y-4">
      <div class="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-200/70 shadow-xs">
        <span class="text-xs text-stone-500">最多儲存 5 組常用地址，結帳時自動代入</span>
        <button
          @click="openAddAddressModal"
          :disabled="(authStore.user?.addresses || []).length >= 5"
          class="text-xs bg-brand-600 hover:bg-brand-700 text-white px-3.5 py-2 rounded-lg font-medium transition disabled:opacity-40"
        >
          + 新增地址
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="addr in (authStore.user?.addresses || [])"
          :key="addr.id"
          class="bg-white rounded-xl border p-5 shadow-xs relative flex flex-col justify-between"
          :class="addr.isDefault ? 'border-brand-500 bg-brand-50/20' : 'border-stone-200/70'"
        >
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-sm text-stone-800">{{ addr.recipient }}</span>
              <span v-if="addr.isDefault" class="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-medium border border-brand-200">
                預設地址
              </span>
            </div>
            <div class="font-mono text-xs text-stone-400 mb-2">{{ addr.phone }}</div>
            <p class="text-xs text-stone-600 leading-relaxed">{{ addr.address }}</p>
          </div>

          <div class="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs font-medium">
            <div class="flex items-center gap-3">
              <button v-if="!addr.isDefault" @click="authStore.setDefaultAddress(addr.id)" class="text-brand-600 hover:underline">設為預設</button>
              <button @click="openEditAddressModal(addr)" class="text-stone-500 hover:text-stone-800">編輯</button>
            </div>
            <button @click="handleRemoveAddress(addr.id)" class="text-stone-400 hover:text-rose-600">刪除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模組 3：個人基本資料 -->
    <div v-if="activeMainTab === 'profile'" class="bg-white rounded-2xl border border-stone-200/70 p-6 sm:p-8 shadow-xs max-w-lg">
      <h3 class="text-sm font-bold text-stone-800 mb-4 tracking-wider uppercase">PROFILE SETTINGS</h3>
      <form @submit.prevent="handleUpdateProfile" class="space-y-4 text-xs">
        <div>
          <label class="block text-stone-600 mb-1">會員姓名 *</label>
          <input v-model="profileForm.name" required type="text" class="w-full border border-stone-200 p-2.5 rounded-lg text-xs outline-none focus:border-brand-500" />
        </div>
        <div>
          <label class="block text-stone-600 mb-1">聯絡信箱 *</label>
          <input v-model="profileForm.email" required type="email" class="w-full border border-stone-200 p-2.5 rounded-lg text-xs font-mono outline-none focus:border-brand-500" />
        </div>
        <div>
          <label class="block text-stone-400 mb-1">綁定手機 (不可修改)</label>
          <input :value="authStore.user?.phone || '0912345678'" disabled class="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-lg text-xs font-mono text-stone-400" />
        </div>
        <button type="submit" class="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-lg text-xs transition">
          儲存變更
        </button>
      </form>
    </div>

    <!-- 地址彈窗 -->
    <Teleport to="body">
      <div v-if="showAddressModal" class="fixed inset-0 z-[9999] bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4" @click.self="showAddressModal = false">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
          <button @click="showAddressModal = false" class="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1">
            <X class="w-4 h-4" />
          </button>
          <h3 class="text-sm font-bold text-stone-800 mb-4">{{ isEditing ? '編輯收件地址' : '新增常用收件地址' }}</h3>
          <form @submit.prevent="saveAddress" class="space-y-3.5 text-xs">
            <div>
              <label class="block text-stone-600 mb-1">收件人姓名 *</label>
              <input v-model="addressForm.recipient" required type="text" class="w-full border border-stone-200 p-2 rounded-lg text-xs outline-none focus:border-brand-500" />
            </div>
            <div>
              <label class="block text-stone-600 mb-1">手機號碼 *</label>
              <input v-model="addressForm.phone" required pattern="^09\d{8}$" type="tel" class="w-full border border-stone-200 p-2 rounded-lg text-xs font-mono outline-none focus:border-brand-500" />
            </div>
            <div>
              <label class="block text-stone-600 mb-1">完整地址 *</label>
              <input v-model="addressForm.address" required type="text" class="w-full border border-stone-200 p-2 rounded-lg text-xs outline-none focus:border-brand-500" />
            </div>
            <div class="flex items-center gap-2 pt-1">
              <input id="default-check" v-model="addressForm.isDefault" type="checkbox" class="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5" />
              <label for="default-check" class="text-stone-600">設為預設常用地址</label>
            </div>
            <button type="submit" class="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-xs transition mt-2">
              儲存
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  LogOut,
  Package,
  MapPin,
  User,
  ExternalLink,
  Plus,
  X,
  Layers,
  CreditCard,
  PackageSearch,
  Truck,
  CheckCircle2,
  RotateCcw,
  Ban
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const activeMainTab = ref('orders')
const currentStatus = ref('ALL')
const showAddressModal = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)

// 7 個步驟
const interactiveSteps = [
  { key: 'ALL', title: '全部', desc: 'ALL', icon: Layers },
  { key: 'PENDING_PAYMENT', title: '待付款', desc: 'UNPAID', icon: CreditCard },
  { key: 'PROCESSING', title: '備貨中', desc: 'PREPARING', icon: PackageSearch },
  { key: 'SHIPPED', title: '已出貨', desc: 'SHIPPED', icon: Truck },
  { key: 'COMPLETED', title: '已完成', desc: 'DELIVERED', icon: CheckCircle2 },
  { key: 'REFUNDING', title: '售後中', desc: 'RETURN', icon: RotateCcw },
  { key: 'CANCELLED', title: '已取消', desc: 'CANCEL', icon: Ban }
]

// 女裝風格訂單資料 (搭配 Unsplash 韓系風格服飾縮圖)
const userOrders = ref([
  {
    id: 'ORD-20261106-01',
    status: 'PENDING_PAYMENT',
    amount: 1480,
    shippingMethod: '7-11 超商取貨',
    trackingCode: '',
    createdAt: '2026-11-06 14:00',
    items: [
      { name: '極簡微抓皺鬆弛感雪紡襯衫 (燕麥白)', quantity: 1, price: 1480, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'ORD-20261105-08',
    status: 'PROCESSING',
    amount: 2280,
    shippingMethod: '黑貓宅配',
    trackingCode: '',
    createdAt: '2026-11-05 09:30',
    items: [
      { name: '法式廓形雙排扣毛呢短大衣 (奶茶咖)', quantity: 1, price: 2280, image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'ORD-20261104-12',
    status: 'SHIPPED',
    amount: 1980,
    shippingMethod: '全家 超商取貨',
    trackingCode: 'FAMI-9921448',
    createdAt: '2026-11-04 14:15',
    items: [
      { name: '慵懶休閒垂墜感西裝落地寬褲 (灰杏)', quantity: 1, price: 990, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=80' },
      { name: '修身方領針織打底上衣 (炭灰)', quantity: 1, price: 990, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'ORD-20261102-03',
    status: 'COMPLETED',
    amount: 1680,
    shippingMethod: '黑貓宅配',
    trackingCode: '9021884299',
    createdAt: '2026-11-02 10:10',
    items: [
      { name: '經典後開叉優雅針織直筒長裙 (淺燕麥)', quantity: 1, price: 1680, image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'ORD-20261029-05',
    status: 'REFUNDING',
    amount: 1280,
    shippingMethod: '黑貓宅配',
    trackingCode: '9021884110',
    createdAt: '2026-10-29 11:20',
    items: [
      { name: '復古V領麻花針織排扣外套 (奶油杏)', quantity: 1, price: 1280, image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'ORD-20261025-01',
    status: 'CANCELLED',
    amount: 890,
    shippingMethod: '7-11 超商取貨',
    trackingCode: '',
    createdAt: '2026-10-25 16:40',
    items: [
      { name: '高領軟糯羊絨感保暖發熱衣 (黑)', quantity: 1, price: 890, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=300&q=80' }
    ]
  }
])

const getOrderCount = (key) => {
  if (key === 'ALL') return userOrders.value.length
  return userOrders.value.filter((o) => o.status === key).length
}

const filteredOrders = computed(() => {
  if (currentStatus.value === 'ALL') return userOrders.value
  return userOrders.value.filter((o) => o.status === currentStatus.value)
})

const stepperProgressWidth = computed(() => {
  const stepKeys = ['ALL', 'PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'REFUNDING', 'CANCELLED']
  const idx = stepKeys.indexOf(currentStatus.value)
  if (idx <= 0) return '0%'
  const percentage = (idx / (stepKeys.length - 1)) * 100
  return `min(${percentage}%, calc(100% - 2rem))`
})

const stepperLineClass = computed(() => {
  if (currentStatus.value === 'CANCELLED') return 'bg-stone-300'
  if (currentStatus.value === 'REFUNDING') return 'bg-rose-400'
  return 'bg-brand-500'
})

const getNodeActiveClass = (key) => {
  if (key === 'CANCELLED') return 'bg-stone-600 text-white shadow-xs'
  if (key === 'REFUNDING') return 'bg-rose-500 text-white shadow-xs'
  return 'bg-brand-600 text-white shadow-sm'
}

const getFilterTitle = (key) => {
  const item = interactiveSteps.find((s) => s.key === key)
  return item ? item.title : '全部'
}

const getStatusText = (status) => {
  const map = {
    PENDING_PAYMENT: '待付款',
    PROCESSING: '備貨中',
    SHIPPED: '已發貨',
    COMPLETED: '交易完成',
    CANCELLED: '已取消',
    REFUNDING: '售後處理中'
  }
  return map[status] || status
}

// 韓系低飽和柔和標籤色
const getBadgeClass = (status) => {
  const map = {
    PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border border-amber-200/50',
    PROCESSING: 'bg-stone-100 text-stone-700 border border-stone-200',
    SHIPPED: 'bg-brand-50 text-brand-700 border border-brand-200/60',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    CANCELLED: 'bg-stone-100 text-stone-400',
    REFUNDING: 'bg-rose-50 text-rose-600 border border-rose-200/50'
  }
  return map[status] || 'bg-stone-100 text-stone-600'
}

const getTrackingUrl = (method, code) => {
  if (method && method.includes('7-11')) {
    return `https://eservice.7-11.com.tw/e-tracking/search.aspx?order_code=${code}`
  } else if (method && method.includes('全家')) {
    return `https://www.famiport.com.tw/Web_Famiport/page/process.aspx?bill_no=${code}`
  }
  return `https://www.t-cat.com.tw/Inquire/TraceDetail.aspx?BillID=${code}`
}

const cancelOrder = (order) => {
  if (confirm(`確定取消訂單 ${order.id} 嗎？`)) {
    order.status = 'CANCELLED'
  }
}

const requestRefund = (order) => {
  if (confirm(`確定為訂單 ${order.id} 申請售後退換貨嗎？`)) {
    order.status = 'REFUNDING'
  }
}

const profileForm = reactive({
  name: authStore.user?.name || '陳大文',
  email: authStore.user?.email || 'user@md-korea.com'
})

const addressForm = reactive({
  recipient: '',
  phone: '',
  address: '',
  isDefault: false
})

const openAddAddressModal = () => {
  isEditing.value = false
  currentEditId.value = null
  addressForm.recipient = authStore.user?.name || ''
  addressForm.phone = authStore.user?.phone || ''
  addressForm.address = ''
  addressForm.isDefault = (authStore.user?.addresses || []).length === 0
  showAddressModal.value = true
}

const openEditAddressModal = (addr) => {
  isEditing.value = true
  currentEditId.value = addr.id
  addressForm.recipient = addr.recipient
  addressForm.phone = addr.phone
  addressForm.address = addr.address
  addressForm.isDefault = addr.isDefault
  showAddressModal.value = true
}

const saveAddress = () => {
  if (isEditing.value && currentEditId.value) {
    authStore.updateAddress(currentEditId.value, addressForm)
  } else {
    authStore.addAddress(addressForm)
  }
  showAddressModal.value = false
}

const handleRemoveAddress = (id) => {
  if (confirm('確定刪除此地址？')) {
    authStore.removeAddress(id)
  }
}

const handleUpdateProfile = () => {
  authStore.updateProfile(profileForm.name, profileForm.email)
  alert('個人資料已更新')
}

const handleLogout = () => {
  if (confirm('確定登出？')) {
    authStore.logout()
    router.push('/')
  }
}
</script>