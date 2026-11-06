<template>
  <div class="max-w-4xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-bold text-slate-900 mb-8">訂單結帳流程</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- 結帳表單 -->
      <form @submit.prevent="submitOrder" class="md:col-span-2 space-y-6">
        <!-- 1. 配送收件人 (AC: ST-02, ST-07) -->
        <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">1</span>
            收件人配送資訊
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">收件人姓名 *</label>
              <input
                v-model="form.name"
                required
                type="text"
                class="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="例如：王小明"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">聯絡手機號碼 (09xxxxxxxx) *</label>
              <input
                v-model="form.phone"
                required
                type="tel"
                class="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                placeholder="0912345678"
              />
            </div>
          </div>

          <!-- 物流選擇 -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-2">物流方式 *</label>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="border rounded-xl p-3 flex items-center gap-2 cursor-pointer text-sm font-medium transition"
                :class="form.shippingMethod === 'home' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-200'"
              >
                <input type="radio" v-model="form.shippingMethod" value="home" class="text-indigo-600" />
                黑貓宅配到府
              </label>
              <label
                class="border rounded-xl p-3 flex items-center gap-2 cursor-pointer text-sm font-medium transition"
                :class="form.shippingMethod === 'cvs' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' : 'border-slate-200'"
              >
                <input type="radio" v-model="form.shippingMethod" value="cvs" class="text-indigo-600" />
                超商取貨 (7-11/全家)
              </label>
            </div>
          </div>

          <!-- 宅配地址填寫 或 超商門市選擇 (AC: ST-07) -->
          <div v-if="form.shippingMethod === 'home'">
            <label class="block text-xs font-semibold text-slate-600 mb-1">詳細收件地址 *</label>
            <input
              v-model="form.address"
              required
              type="text"
              class="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="請填寫完整地址 (如台北市中正區重慶南路一段...)"
            />
          </div>
          <div v-else class="space-y-2">
            <label class="block text-xs font-semibold text-slate-600">超商指定取貨門市 *</label>
            <div class="flex gap-2">
              <input
                v-model="form.cvsStore"
                readonly
                required
                type="text"
                class="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-sm text-slate-700"
                placeholder="尚未選擇超商門市"
              />
              <button
                type="button"
                @click="simulateCvsMap"
                class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-xl transition"
              >
                模擬門市選店 (CVS Map)
              </button>
            </div>
          </div>
        </section>

        <!-- 2. 電子發票開立 (AC: ST-07, AD-06) -->
        <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">2</span>
            電子發票選項
          </h2>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              v-for="inv in [
                { id: 'carrier', label: '手機條碼載具' },
                { id: 'company', label: '公司統編發票' },
                { id: 'personal', label: '會員載具' }
              ]"
              :key="inv.id"
              @click="form.invoiceType = inv.id"
              class="py-2 px-3 border rounded-xl text-xs font-medium transition"
              :class="form.invoiceType === inv.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'"
            >
              {{ inv.label }}
            </button>
          </div>

          <!-- 手機條碼載具 (以 / 開頭共 8 碼) -->
          <div v-if="form.invoiceType === 'carrier'">
            <label class="block text-xs font-semibold text-slate-600 mb-1">手機條碼載具 (必須以 / 開頭共 8 碼) *</label>
            <input
              v-model="form.carrierCode"
              required
              type="text"
              class="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono uppercase focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="/ABC1234"
            />
          </div>

          <!-- 公司統一編號 (8 碼數字) -->
          <div v-if="form.invoiceType === 'company'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">統一編號 (8碼數字) *</label>
              <input
                v-model="form.taxId"
                required
                type="text"
                maxlength="8"
                class="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="例如 12345678"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-600 mb-1">發票買受人抬頭 *</label>
              <input
                v-model="form.taxTitle"
                required
                type="text"
                class="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="例如 範例科技有限公司"
              />
            </div>
          </div>
        </section>

        <!-- 3. 付款方式 (AC: ST-07) -->
        <section class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 class="text-base font-bold text-slate-800 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">3</span>
            付款方式選擇
          </h2>
          <div class="grid grid-cols-3 gap-3">
            <label
              v-for="p in ['信用卡線上刷卡', 'LINE Pay 快捷', 'ATM 虛擬帳號']"
              :key="p"
              class="border rounded-xl p-3 text-center cursor-pointer text-xs font-medium transition"
              :class="form.paymentMethod === p ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold' : 'border-slate-200 text-slate-700'"
            >
              <input type="radio" v-model="form.paymentMethod" :value="p" class="hidden" />
              {{ p }}
            </label>
          </div>
        </section>

        <!-- 送出結帳按鈕 -->
        <button
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-base shadow-md transition active:scale-[0.99]"
        >
          確認授權並付款 NT$ {{ cartStore.total.toLocaleString() }}
        </button>
      </form>

      <!-- 側欄金額清單摘要 -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 h-fit space-y-4">
        <h3 class="font-bold text-slate-800 text-sm">購買明細 ({{ cartStore.totalCount }} 件)</h3>
        <div class="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          <div v-for="item in cartStore.items" :key="item.skuId" class="py-3 flex justify-between text-xs">
            <div>
              <p class="font-semibold text-slate-800">{{ item.name }}</p>
              <p class="text-[11px] text-slate-400">{{ item.skuName }} × {{ item.quantity }}</p>
            </div>
            <span class="font-bold text-slate-800">NT$ {{ (item.price * item.quantity).toLocaleString() }}</span>
          </div>
        </div>

        <div class="border-t border-slate-100 pt-3 text-xs space-y-2">
          <div class="flex justify-between text-slate-500">
            <span>商品小計</span>
            <span>NT$ {{ cartStore.subtotal.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-slate-500">
            <span>物流運費</span>
            <span>{{ cartStore.shippingFee === 0 ? '免運' : `NT$ ${cartStore.shippingFee}` }}</span>
          </div>
          <div v-if="cartStore.discountAmount > 0" class="flex justify-between text-emerald-600 font-semibold">
            <span>促銷折抵</span>
            <span>- NT$ {{ cartStore.discountAmount.toLocaleString() }}</span>
          </div>
          <div class="flex justify-between font-bold text-base text-slate-900 pt-2 border-t border-slate-100">
            <span>實付總金額</span>
            <span>NT$ {{ cartStore.total.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()
const router = useRouter()

const form = reactive({
  name: '',
  phone: '',
  shippingMethod: 'home',
  address: '',
  cvsStore: '',
  invoiceType: 'carrier',
  carrierCode: '',
  taxId: '',
  taxTitle: '',
  paymentMethod: '信用卡線上刷卡'
})

const simulateCvsMap = () => {
  form.cvsStore = '7-ELEVEN 鑫鑫門市 (店號: 981242)'
}

const submitOrder = () => {
  if (cartStore.items.length === 0) {
    alert('購物車目前沒有商品，無法進行結帳！')
    return
  }

  // 1. 驗證台灣手機號碼 (AC: ST-01, ST-07)
  const phoneRegex = /^09\d{8}$/
  if (!phoneRegex.test(form.phone)) {
    alert('手機號碼格式不正確，請輸入 09 開頭共 10 碼數字！')
    return
  }

  // 2. 驗證超商門市選取
  if (form.shippingMethod === 'cvs' && !form.cvsStore) {
    alert('請先點擊按鈕選取指定超商取件門市！')
    return
  }

  // 3. 驗證發票載具條碼合法性 (AC: ST-07)
  if (form.invoiceType === 'carrier') {
    const carrierRegex = /^\/[0-9A-Z\.\-\+]{7}$/
    if (!carrierRegex.test(form.carrierCode.toUpperCase())) {
      alert('手機條碼載具格式錯誤！必須為「/」開頭加 7 碼英數或符號 (例如 /ABC1234)')
      return
    }
  }

  // 4. 驗證統一編號
  if (form.invoiceType === 'company') {
    const taxRegex = /^\d{8}$/
    if (!taxRegex.test(form.taxId)) {
      alert('統一編號格式錯誤！必須為 8 碼數字。')
      return
    }
  }

  const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000)
  cartStore.clearCart()
  router.push({ path: '/success', query: { orderId } })
}
</script>