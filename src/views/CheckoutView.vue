<template>
  <main class="container py-3 py-md-5 checkout-page-container">
    
    <!-- 麵包屑導航與標題 -->
    <div class="mb-4">
      <nav class="small text-muted mb-2" aria-label="breadcrumb">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none text-muted">首頁</router-link>
          </li>
          <li class="breadcrumb-item active text-dark fw-semibold" aria-current="page">購物結帳</li>
        </ol>
      </nav>
      <h1 class="h3 fw-bold text-dark font-serif mb-1">訂單結帳確認</h1>
      <p class="small text-muted mb-0">請填寫完整的收件資訊與選擇付款配送方式</p>
    </div>

    <!-- ★ 風控管制即時警戒橫幅 (若會員處於特定管制狀態) ★ -->
    <div
      v-if="currentRiskStatus === 'BLOCK_ORDER' || currentRiskStatus === 'BANNED'"
      class="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3 border-0 shadow-2xs"
    >
      <ShieldAlert style="width: 20px; height: 20px;" class="flex-shrink-0" />
      <div class="small">
        <strong>【帳號權限受限】</strong>
        {{ authStore.user?.blockReason || '您的帳號目前暫停下單交易權限，如有疑問請聯繫客服專員。' }}
      </div>
    </div>

    <div
      v-else-if="currentRiskStatus === 'RESTRICT_COD'"
      class="alert alert-warning d-flex align-items-center gap-2 mb-4 rounded-3 border-0 shadow-2xs"
    >
      <AlertTriangle style="width: 20px; height: 20px;" class="flex-shrink-0 text-warning-emphasis" />
      <div class="small text-warning-emphasis">
        <strong>【溫馨提醒】</strong> 因先前包裹逾期未取次數較多，本帳號目前暫停「貨到付款 / 超取付款」，請改用線上預先支付。
      </div>
    </div>

    <!-- 購物車為空時提示 -->
    <div v-if="cartStore.items.length === 0" class="card-korean text-center py-5 my-4 bg-white shadow-xs">
      <ShoppingBag class="mb-2 opacity-40 text-muted" style="width: 44px; height: 44px;" />
      <h2 class="h5 fw-bold text-dark">購物袋內目前沒有商品</h2>
      <p class="small text-muted mb-3">歡迎前往探索韓國東大門當季新款！</p>
      <router-link to="/" class="btn btn-primary btn-sm rounded-pill px-4">
        前往選購商品
      </router-link>
    </div>

    <!-- 結帳主內容雙欄佈局 (RWD: 桌機左右 7:5，手機單欄串流) -->
    <div v-else class="row g-4">
      
      <!-- ==================== 左欄：填寫結帳資訊 ==================== -->
      <div class="col-12 col-lg-7 d-flex flex-column gap-3.5">
        
        <!-- 1. 訂購人與收件資料 -->
        <div class="card-korean bg-white p-3.5 p-md-4 border shadow-xs">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fs-6 fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
              <User style="width: 16px; height: 16px;" class="text-primary" />
              <span>收件人資訊</span>
            </h2>
            <button
              v-if="authStore.user?.isLoggedIn"
              type="button"
              class="btn btn-outline-secondary btn-sm rounded-pill font-monospace"
              style="font-size: 11px;"
              @click="autofillMemberInfo"
            >
              帶入會員資料
            </button>
          </div>

          <div class="row g-3">
            <div class="col-12 col-sm-6">
              <label class="form-label text-secondary small mb-1">收件人真實姓名 *</label>
              <input
                v-model="form.recipientName"
                required
                type="text"
                class="form-control form-control-sm"
                placeholder="請輸入身分證證件姓名"
              />
            </div>
            <div class="col-12 col-sm-6">
              <label class="form-label text-secondary small mb-1">收件人手機號碼 *</label>
              <input
                v-model="form.phone"
                required
                type="tel"
                class="form-control form-control-sm font-monospace"
                placeholder="0912345678"
              />
            </div>
            <div class="col-12">
              <label class="form-label text-secondary small mb-1">電子郵件信箱 (接收訂單通知) *</label>
              <input
                v-model="form.email"
                required
                type="email"
                class="form-control form-control-sm font-monospace"
                placeholder="example@gmail.com"
              />
            </div>
          </div>
        </div>

        <!-- 2. 配送方式選擇 -->
        <div class="card-korean bg-white p-3.5 p-md-4 border shadow-xs">
          <h2 class="fs-6 fw-bold text-dark mb-3 d-flex align-items-center gap-1.5">
            <Truck style="width: 16px; height: 16px;" class="text-primary" />
            <span>配送方式</span>
          </h2>

          <div class="d-flex flex-column gap-2 mb-3">
            <label
              class="d-flex align-items-center justify-content-between p-3 rounded-3 border delivery-radio-option"
              :class="{ 'border-primary bg-light': form.shippingMethod === 'HOME' }"
            >
              <div class="d-flex align-items-center gap-2.5">
                <input
                  v-model="form.shippingMethod"
                  type="radio"
                  value="HOME"
                  class="form-check-input m-0"
                />
                <div>
                  <strong class="text-dark d-block small">黑貓宅急便 / 宅配到府</strong>
                  <span class="text-muted font-monospace" style="font-size: 11px;">首爾直送出貨後約 2~3 個工作日抵達</span>
                </div>
              </div>
              <span class="font-monospace fw-bold small text-dark">
                {{ shippingFee === 0 ? '免運費' : 'NT$ ' + shippingFee }}
              </span>
            </label>

            <label
              class="d-flex align-items-center justify-content-between p-3 rounded-3 border delivery-radio-option"
              :class="{ 'border-primary bg-light': form.shippingMethod === 'CVS' }"
            >
              <div class="d-flex align-items-center gap-2.5">
                <input
                  v-model="form.shippingMethod"
                  type="radio"
                  value="CVS"
                  class="form-check-input m-0"
                />
                <div>
                  <strong class="text-dark d-block small">7-ELEVEN / 全家超商純取貨</strong>
                  <span class="text-muted font-monospace" style="font-size: 11px;">簡訊通知門司取件，須出示有效證件</span>
                </div>
              </div>
              <span class="font-monospace fw-bold small text-dark">
                {{ shippingFee === 0 ? '免運費' : 'NT$ ' + shippingFee }}
              </span>
            </label>
          </div>

          <!-- 配送地址輸入 -->
          <div v-if="form.shippingMethod === 'HOME'" class="row g-2">
            <div class="col-6">
              <input v-model="form.city" type="text" class="form-control form-control-sm" placeholder="縣市 (如: 台北市)" />
            </div>
            <div class="col-6">
              <input v-model="form.district" type="text" class="form-control form-control-sm" placeholder="鄉鎮市區 (如: 大安區)" />
            </div>
            <div class="col-12">
              <input v-model="form.addressDetail" type="text" class="form-control form-control-sm" placeholder="詳細收件地址 (路街名、樓層)" />
            </div>
          </div>
          <div v-else class="row g-2">
            <div class="col-12 col-sm-6">
              <input v-model="form.cvsStoreName" type="text" class="form-control form-control-sm" placeholder="門市名稱 (如: 鑫東門市)" />
            </div>
            <div class="col-12 col-sm-6">
              <input v-model="form.cvsStoreId" type="text" class="form-control form-control-sm font-monospace" placeholder="門市店號 (6碼數字)" />
            </div>
          </div>
        </div>

        <!-- 3. 付款方式 (整合黑名單與風控攔截防護) -->
        <div class="card-korean bg-white p-3.5 p-md-4 border shadow-xs">
          <h2 class="fs-6 fw-bold text-dark mb-3 d-flex align-items-center gap-1.5">
            <CreditCard style="width: 16px; height: 16px;" class="text-primary" />
            <span>付款方式</span>
          </h2>

          <div class="d-flex flex-column gap-2">
            <!-- 線上信用卡 -->
            <label
              class="d-flex align-items-center justify-content-between p-3 rounded-3 border payment-radio-option"
              :class="{ 'border-primary bg-light': form.paymentMethod === 'CREDIT_CARD' }"
            >
              <div class="d-flex align-items-center gap-2.5">
                <input
                  v-model="form.paymentMethod"
                  type="radio"
                  value="CREDIT_CARD"
                  class="form-check-input m-0"
                />
                <div>
                  <strong class="text-dark d-block small">信用卡線上無縫刷卡 (Visa / Master / JCB)</strong>
                  <span class="text-muted font-monospace" style="font-size: 11px;">SSL 256-bit 加密安全支付</span>
                </div>
              </div>
            </label>

            <!-- ATM 虛擬帳號 -->
            <label
              class="d-flex align-items-center justify-content-between p-3 rounded-3 border payment-radio-option"
              :class="{ 'border-primary bg-light': form.paymentMethod === 'ATM' }"
            >
              <div class="d-flex align-items-center gap-2.5">
                <input
                  v-model="form.paymentMethod"
                  type="radio"
                  value="ATM"
                  class="form-check-input m-0"
                />
                <div>
                  <strong class="text-dark d-block small">ATM 虛擬帳號轉帳</strong>
                  <span class="text-muted font-monospace" style="font-size: 11px;">取得專屬繳費帳號，支援全台網銀/實體 ATM</span>
                </div>
              </div>
            </label>

            <!-- ★ 超商取貨付款 / 貨到付款 (若為 RESTRICT_COD 黑名單則自動停用) ★ -->
            <label
              class="d-flex align-items-center justify-content-between p-3 rounded-3 border payment-radio-option"
              :class="{
                'border-primary bg-light': form.paymentMethod === 'COD' && currentRiskStatus !== 'RESTRICT_COD',
                'opacity-50 cursor-not-allowed bg-light': currentRiskStatus === 'RESTRICT_COD'
              }"
            >
              <div class="d-flex align-items-center gap-2.5">
                <input
                  v-model="form.paymentMethod"
                  type="radio"
                  value="COD"
                  class="form-check-input m-0"
                  :disabled="currentRiskStatus === 'RESTRICT_COD'"
                />
                <div>
                  <strong class="text-dark d-block small">
                    超商取貨付款 / 貨到付款
                    <span v-if="currentRiskStatus === 'RESTRICT_COD'" class="text-danger ms-1" style="font-size: 10px;">
                      (因未取紀錄暫停使用)
                    </span>
                  </strong>
                  <span class="text-muted font-monospace" style="font-size: 11px;">包裹送達時以現金交付</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- 4. 訂單備註 -->
        <div class="card-korean bg-white p-3.5 p-md-4 border shadow-xs">
          <label class="form-label text-secondary small mb-1 fw-semibold">訂單特殊需求備註 (選填)</label>
          <textarea
            v-model="form.orderNotes"
            rows="2"
            class="form-control form-control-sm"
            placeholder="如有配送時段或特別叮嚀請在此備註..."
          ></textarea>
        </div>

      </div>

      <!-- ==================== 右欄：訂單金額明細與結帳按鈕 (桌機黏性固定) ==================== -->
      <div class="col-12 col-lg-5">
        <div class="card-korean bg-white p-3.5 p-md-4 border shadow-xs sticky-order-summary">
          <h2 class="fs-6 fw-bold text-dark mb-3 border-bottom pb-2 font-serif">
            選購明細 (共 {{ cartStore.totalCount }} 件)
          </h2>

          <!-- 商品簡明清單 -->
          <div class="d-flex flex-column gap-2.5 mb-3.5 max-h-cart-list overflow-y-auto no-scrollbar">
            <div
              v-for="item in cartStore.items"
              :key="item.skuId"
              class="d-flex align-items-center justify-content-between gap-2 py-1"
            >
              <div class="d-flex align-items-center gap-2 min-w-0">
                <div class="rounded-2 overflow-hidden border flex-shrink-0" style="width: 42px; height: 52px; background-color: #f5f2ed;">
                  <img :src="item.image" class="w-100 h-100 object-fit-cover" />
                </div>
                <div class="min-w-0">
                  <div class="small fw-semibold text-dark text-truncate" style="max-width: 170px;">
                    {{ item.name }}
                  </div>
                  <div class="text-muted font-monospace" style="font-size: 10.5px;">
                    {{ item.color }} / {{ item.size }} × {{ item.quantity }}
                  </div>
                </div>
              </div>

              <div class="font-monospace small fw-bold text-dark text-nowrap">
                NT$ {{ (item.price * item.quantity).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- 紅利點數折抵 (若非 RESTRICT_PROMO) -->
          <div v-if="authStore.user?.isLoggedIn && currentRiskStatus !== 'RESTRICT_PROMO'" class="border-top pt-3 mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1.5">
              <span class="small text-secondary">可用會員點數 ({{ authStore.user.points || 0 }} 點)</span>
              <div class="form-check form-switch m-0">
                <input
                  v-model="usePoints"
                  class="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="switchUsePoints"
                  :disabled="!authStore.user.points"
                />
              </div>
            </div>
            <div v-if="usePoints" class="text-muted font-monospace" style="font-size: 11px;">
              本次折抵 {{ appliedPointsDiscount }} 點（折抵 NT$ {{ appliedPointsDiscount }}）
            </div>
          </div>

          <!-- 金額小計計算表 -->
          <div class="border-top pt-3 d-flex flex-column gap-2 font-sans small">
            <div class="d-flex justify-content-between text-secondary">
              <span>商品小計</span>
              <span class="font-monospace">NT$ {{ rawSubtotal.toLocaleString() }}</span>
            </div>
            
            <div class="d-flex justify-content-between text-secondary">
              <span>物流運費</span>
              <span class="font-monospace">{{ shippingFee === 0 ? '免運費' : 'NT$ ' + shippingFee }}</span>
            </div>

            <div v-if="usePoints && appliedPointsDiscount > 0" class="d-flex justify-content-between text-primary">
              <span>點數折抵</span>
              <span class="font-monospace">- NT$ {{ appliedPointsDiscount.toLocaleString() }}</span>
            </div>

            <div class="border-top pt-2.5 mt-1 d-flex justify-content-between align-items-baseline">
              <strong class="fs-6 text-dark font-serif">應付總金額</strong>
              <div class="font-monospace fs-4 fw-bold text-dark">
                NT$ {{ finalTotalAmount.toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- 桌面版送出結帳按鈕 -->
          <div class="pt-3.5 d-none d-lg-block">
            <button
              type="button"
              class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold shadow-xs d-flex align-items-center justify-content-center gap-2"
              :disabled="isSubmitting || isBlockedFromCheckout"
              @click="submitOrder"
            >
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
              <Lock style="width: 14px; height: 14px;" />
              <span>{{ isBlockedFromCheckout ? '帳號暫停結帳' : '確認送出訂單並付款' }}</span>
            </button>
            <div class="text-center text-muted font-monospace mt-2" style="font-size: 10.5px;">
              點擊確認即代表同意 MD.SELECT 購買合約與退換貨規範
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- ==================== 手機端專屬：底部浮動結帳列 (Sticky Bar) ==================== -->
    <div class="mobile-sticky-checkout-bar d-lg-none">
      <div class="d-flex align-items-center justify-content-between gap-2.5">
        <div>
          <span class="text-muted font-monospace" style="font-size: 10.5px;">應付總計</span>
          <div class="font-monospace fs-5 fw-bold text-dark lh-1">
            NT$ {{ finalTotalAmount.toLocaleString() }}
          </div>
        </div>

        <button
          type="button"
          class="btn btn-primary rounded-pill px-4 py-2.5 fw-bold font-sans shadow-xs flex-grow-1"
          style="max-width: 220px;"
          :disabled="isSubmitting || isBlockedFromCheckout || cartStore.items.length === 0"
          @click="submitOrder"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
          <span>{{ isBlockedFromCheckout ? '帳號受限' : '送出訂單' }}</span>
        </button>
      </div>
    </div>

  </main>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ShoppingBag,
  User,
  Truck,
  CreditCard,
  Lock,
  ShieldAlert,
  AlertTriangle
} from 'lucide-vue-next'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const isSubmitting = ref(false)
const usePoints = ref(false)

// 結帳表單狀態
const form = reactive({
  recipientName: '',
  phone: '',
  email: '',
  shippingMethod: 'HOME', // 'HOME' | 'CVS'
  city: '台北市',
  district: '大安區',
  addressDetail: '',
  cvsStoreName: '',
  cvsStoreId: '',
  paymentMethod: 'CREDIT_CARD', // 'CREDIT_CARD' | 'ATM' | 'COD'
  orderNotes: ''
})

// 當前會員管制等級
const currentRiskStatus = computed(() => {
  return authStore.user?.riskStatus || 'NORMAL'
})

// 是否被全面禁止下單
const isBlockedFromCheckout = computed(() => {
  return currentRiskStatus.value === 'BLOCK_ORDER' || currentRiskStatus.value === 'BANNED'
})

// 自動帶入會員資料
const autofillMemberInfo = () => {
  if (!authStore.user) return
  form.recipientName = authStore.user.name || ''
  form.phone = authStore.user.phone || ''
  form.email = authStore.user.email || ''

  const defaultAddr = authStore.user.savedAddresses?.[0]
  if (defaultAddr) {
    form.city = defaultAddr.city || '台北市'
    form.district = defaultAddr.district || '大安區'
    form.addressDetail = defaultAddr.detail || ''
  }
}

// 原始商品小計
const rawSubtotal = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// 滿 1,500 免運，否則運費 80
const shippingFee = computed(() => {
  return rawSubtotal.value >= 1500 ? 0 : 80
})

// 點數折抵金額計算 (最高折抵訂單 30%)
const appliedPointsDiscount = computed(() => {
  if (!usePoints.value || !authStore.user?.points) return 0
  const maxDiscount = Math.floor(rawSubtotal.value * 0.3)
  return Math.min(authStore.user.points, maxDiscount)
})

// 最終訂單應付總額
const finalTotalAmount = computed(() => {
  return Math.max(0, rawSubtotal.value + shippingFee.value - appliedPointsDiscount.value)
})

// 訂單送出處理解析
const submitOrder = async () => {
  // 1. 黑名單與風控校驗
  const eligibility = authStore.checkCheckoutEligibility(form.paymentMethod)
  if (!eligibility.allowed) {
    alert(`【交易無法繼續】\n${eligibility.reason}`)
    return
  }

  // 2. 表單基本驗證
  if (!form.recipientName.trim()) {
    alert('請填寫收件人姓名！')
    return
  }
  if (!form.phone.trim()) {
    alert('請填寫收件人聯絡手機！')
    return
  }
  if (form.shippingMethod === 'HOME' && !form.addressDetail.trim()) {
    alert('請填寫詳細宅配收件地址！')
    return
  }
  if (form.shippingMethod === 'CVS' && !form.cvsStoreName.trim()) {
    alert('請輸入超商門市名稱！')
    return
  }

  isSubmitting.value = true

  try {
    // 扣除折抵點數
    if (usePoints.value && appliedPointsDiscount.value > 0) {
      authStore.user.points -= appliedPointsDiscount.value
    }

    const orderId = 'ORD-' + Date.now().toString().slice(-8)
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      recipientName: form.recipientName,
      phone: form.phone,
      email: form.email,
      items: [...cartStore.items],
      totalAmount: finalTotalAmount.value,
      shippingMethod: form.shippingMethod,
      paymentMethod: form.paymentMethod,
      status: form.paymentMethod === 'COD' ? '處理中' : '已付款',
      notes: form.orderNotes
    }

    // 寫入後台稽核日誌
    adminStore.addAuditLog('顧客建立新訂單', `訂單編號 #${orderId}，金額 NT$ ${finalTotalAmount.value}`)

    // 清空購物袋
    cartStore.clearCart()

    // 模擬網路延遲後前往成功頁
    setTimeout(() => {
      isSubmitting.value = false
      router.push({
        path: '/order-success',
        query: { orderId, total: finalTotalAmount.value }
      })
    }, 600)
  } catch (err) {
    console.error(err)
    isSubmitting.value = false
    alert('結帳過程發生問題，請稍候重試！')
  }
}
</script>

<style scoped>
.checkout-page-container {
  max-width: 1140px;
  margin: 0 auto;
}

.delivery-radio-option,
.payment-radio-option {
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.delivery-radio-option:hover,
.payment-radio-option:hover {
  background-color: var(--md-surface-subtle, #f5f2ed);
}

.cursor-not-allowed {
  cursor: not-allowed !important;
}

.sticky-order-summary {
  position: sticky;
  top: 90px;
}

.max-h-cart-list {
  max-height: 280px;
}

/* 手機端底部浮動結帳列 */
.mobile-sticky-checkout-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--md-border, #ede8e1);
  padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
  z-index: 1020;
  box-shadow: 0 -4px 16px rgba(45, 38, 33, 0.08);
}
</style>