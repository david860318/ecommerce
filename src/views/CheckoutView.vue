<template>
  <div class="container py-4 py-md-5" style="max-width: 1040px;">
    <!-- 結帳標題 -->
    <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
      <div>
        <h1 class="h4 fw-bold text-dark font-serif mb-1" style="letter-spacing: 0.05em;">CHECKOUT</h1>
        <p class="small text-muted mb-0">請填寫完整的收件配送資訊、選擇金流並確認發票載具</p>
      </div>
      <router-link to="/" class="btn btn-link btn-sm text-decoration-none text-muted">
        ← 返回繼續選購
      </router-link>
    </div>

    <!-- 購物清單為空防呆 -->
    <div v-if="cartStore.items.length === 0" class="card-korean text-center py-5 my-4 text-muted">
      <Package class="mb-2 opacity-50" style="width: 44px; height: 44px;" />
      <div class="h6 fw-bold text-dark mb-1">購物袋目前為空</div>
      <div class="small text-muted mb-3">請先挑選喜愛的韓系單品再進行結帳</div>
      <router-link to="/" class="btn btn-primary btn-sm rounded-pill px-4">前往探索新品</router-link>
    </div>

    <div v-else class="row g-4">
      <!-- 左側：結帳步驟表單 -->
      <form @submit.prevent="handleSubmitOrder" class="col-12 col-lg-7 d-flex flex-column gap-4">
        
        <!-- STEP 1：收件與配送 -->
        <div class="card-korean p-4 shadow-sm bg-white">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fs-6 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <span class="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center" style="width: 22px; height: 22px; font-size: 11px;">1</span>
              <span>收件人與配送方式</span>
            </h2>
            <div v-if="authStore.user?.addresses?.length > 0" class="dropdown">
              <button class="btn btn-outline-secondary btn-sm rounded-pill dropdown-toggle" type="button" data-bs-toggle="dropdown" style="font-size: 11px;">
                選擇常用地址代入
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                <li v-for="addr in authStore.user.addresses" :key="addr.id">
                  <a class="dropdown-item py-2" href="javascript:void(0)" @click="applySavedAddress(addr)">
                    <strong>{{ addr.recipient }}</strong> ({{ addr.phone }})
                    <div class="text-muted text-truncate" style="max-width: 260px; font-size: 11px;">{{ addr.address }}</div>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="row g-3 small">
            <div class="col-6">
              <label class="form-label text-secondary mb-1">收件人姓名 *</label>
              <input v-model="form.recipient" required type="text" class="form-control form-control-sm rounded-3" placeholder="請填寫真實姓名" />
            </div>
            <div class="col-6">
              <label class="form-label text-secondary mb-1">手機號碼 *</label>
              <input v-model="form.phone" required pattern="^09\d{8}$" type="tel" class="form-control form-control-sm rounded-3 font-monospace" placeholder="0912345678" />
            </div>

            <div class="col-12">
              <label class="form-label text-secondary mb-1">物流配送方式 *</label>
              <div class="row g-2">
                <div class="col-6">
                  <label
                    class="border rounded-3 p-3 w-100 d-flex align-items-center gap-2 cursor-pointer transition"
                    :class="form.shippingMethod === 'HOME' ? 'border-primary bg-light' : 'border-stone-200'"
                  >
                    <input type="radio" v-model="form.shippingMethod" value="HOME" class="form-check-input mt-0" />
                    <div>
                      <div class="fw-bold text-dark">黑貓宅配到府</div>
                      <div class="text-muted" style="font-size: 11px;">單筆滿 1,500 免運</div>
                    </div>
                  </label>
                </div>
                <div class="col-6">
                  <label
                    class="border rounded-3 p-3 w-100 d-flex align-items-center gap-2 cursor-pointer transition"
                    :class="form.shippingMethod === 'CVS' ? 'border-primary bg-light' : 'border-stone-200'"
                  >
                    <input type="radio" v-model="form.shippingMethod" value="CVS" class="form-check-input mt-0" />
                    <div>
                      <div class="fw-bold text-dark">超商取貨 (CVS)</div>
                      <div class="text-muted" style="font-size: 11px;">7-11 / 全家便利商店</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="form.shippingMethod === 'HOME'" class="col-12">
              <label class="form-label text-secondary mb-1">宅配收件地址 *</label>
              <input v-model="form.address" required type="text" class="form-control form-control-sm rounded-3" placeholder="請填寫完整地址 (含縣市區街巷門牌樓層)" />
            </div>

            <div v-else class="col-12">
              <label class="form-label text-secondary mb-1">取貨超商門市 *</label>
              <div class="d-flex gap-2">
                <div class="form-control form-control-sm rounded-3 bg-light d-flex align-items-center text-truncate font-monospace">
                  <span v-if="selectedStore">
                    <strong class="text-dark">[{{ selectedStore.cvsType }}] {{ selectedStore.storeName }}</strong>
                    <span class="text-muted ms-1">(店號: {{ selectedStore.storeId }}) - {{ selectedStore.address }}</span>
                  </span>
                  <span v-else class="text-muted">尚未選擇超商取件門市</span>
                </div>
                <button type="button" @click="openCvsMapModal" class="btn btn-outline-secondary btn-sm rounded-3 text-nowrap px-3">
                  <MapPin style="width: 14px; height: 14px;" class="me-1" />
                  開啟電子地圖選店
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2：多元金流 -->
        <div class="card-korean p-4 shadow-sm bg-white">
          <h2 class="fs-6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <span class="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center" style="width: 22px; height: 22px; font-size: 11px;">2</span>
            <span>付款方式與金流支付</span>
          </h2>

          <div class="d-flex flex-column gap-2.5 small">
            <label
              class="border rounded-3 p-3 cursor-pointer transition"
              :class="form.paymentMethod === 'CREDIT' ? 'border-primary bg-light' : 'border-stone-200'"
            >
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <input type="radio" v-model="form.paymentMethod" value="CREDIT" class="form-check-input mt-0" />
                  <span class="fw-bold text-dark">信用卡一次付清 (支援 Visa, Master, JCB)</span>
                </div>
                <span class="badge bg-secondary-subtle text-secondary font-monospace" style="font-size: 10px;">需 3D 簡訊驗證</span>
              </div>
            </label>

            <label
              class="border rounded-3 p-3 cursor-pointer transition"
              :class="form.paymentMethod === 'ATM' ? 'border-primary bg-light' : 'border-stone-200'"
            >
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <input type="radio" v-model="form.paymentMethod" value="ATM" class="form-check-input mt-0" />
                  <span class="fw-bold text-dark">ATM 虛擬帳號轉帳</span>
                </div>
                <span class="text-muted" style="font-size: 11px;">提供國泰世華專屬繳款帳號</span>
              </div>
            </label>

            <label
              class="border rounded-3 p-3 cursor-pointer transition"
              :class="form.paymentMethod === 'LINEPAY' ? 'border-primary bg-light' : 'border-stone-200'"
            >
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                  <input type="radio" v-model="form.paymentMethod" value="LINEPAY" class="form-check-input mt-0" />
                  <span class="fw-bold text-dark">LINE Pay 行動支付</span>
                </div>
                <span class="badge bg-success-subtle text-success font-monospace" style="font-size: 10px;">快速授權</span>
              </div>
            </label>
          </div>
        </div>

        <!-- STEP 3：發票與載具 -->
        <div class="card-korean p-4 shadow-sm bg-white">
          <h2 class="fs-6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <span class="rounded-circle bg-dark text-white d-inline-flex align-items-center justify-content-center" style="width: 22px; height: 22px; font-size: 11px;">3</span>
            <span>發票開立與載具填寫</span>
          </h2>

          <div class="d-flex flex-column gap-3 small">
            <div class="d-flex gap-2">
              <button
                type="button"
                v-for="inv in invoiceOptions"
                :key="inv.type"
                class="btn btn-sm rounded-pill px-3"
                :class="form.invoiceType === inv.type ? 'btn-primary' : 'btn-outline-secondary'"
                @click="form.invoiceType = inv.type"
              >
                {{ inv.label }}
              </button>
            </div>

            <div v-if="form.invoiceType === 'CLOUD'" class="bg-light p-3 rounded-3">
              <div class="d-flex gap-3 mb-2">
                <div class="form-check">
                  <input id="car-phone" v-model="form.cloudCarrierType" value="PHONE" type="radio" class="form-check-input" />
                  <label for="car-phone" class="form-check-label">手機條碼載具</label>
                </div>
                <div class="form-check">
                  <input id="car-member" v-model="form.cloudCarrierType" value="MEMBER" type="radio" class="form-check-input" />
                  <label for="car-member" class="form-check-label">會員載具</label>
                </div>
              </div>

              <div v-if="form.cloudCarrierType === 'PHONE'">
                <input
                  v-model="form.phoneCarrier"
                  type="text"
                  maxlength="8"
                  class="form-control form-control-sm font-monospace text-uppercase"
                  placeholder="/AB12+CD"
                />
              </div>
            </div>

            <div v-if="form.invoiceType === 'COMPANY'" class="bg-light p-3 rounded-3 row g-2">
              <div class="col-6">
                <label class="form-label text-secondary mb-1">統一編號 (8 碼) *</label>
                <input v-model="form.companyTaxId" maxlength="8" type="text" class="form-control form-control-sm font-monospace" placeholder="12345678" />
              </div>
              <div class="col-6">
                <label class="form-label text-secondary mb-1">公司抬頭 *</label>
                <input v-model="form.companyTitle" required type="text" class="form-control form-control-sm" placeholder="例如：首爾時尚選品" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary rounded-pill py-3 fw-bold tracking-wide fs-6 d-flex align-items-center justify-content-center gap-2 shadow-sm"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
          <span>確認結帳 NT$ {{ cartStore.total.toLocaleString() }}</span>
        </button>
      </form>

      <!-- ==================== 右側：訂單明細與會員點數折抵核心 (ST-11) ==================== -->
      <div class="col-12 col-lg-5">
        <div class="card-korean p-4 shadow-sm bg-white position-sticky" style="top: 80px;">
          <h2 class="fs-6 fw-bold text-dark mb-3">訂單明細 ({{ cartStore.totalCount }} 件)</h2>

          <!-- 品項列表 -->
          <div class="border-bottom pb-2 mb-3 max-vh-50 overflow-y-auto no-scrollbar">
            <div
              v-for="item in cartStore.items"
              :key="item.skuId"
              class="d-flex justify-content-between align-items-center py-2"
            >
              <div class="d-flex align-items-center gap-2.5 min-w-0">
                <img :src="item.image" class="rounded object-fit-cover flex-shrink-0" style="width: 44px; height: 58px;" />
                <div class="small min-w-0">
                  <div class="fw-semibold text-truncate text-dark" style="max-width: 170px;">{{ item.name }}</div>
                  <div class="text-muted" style="font-size: 11px;">{{ item.skuName }} × {{ item.quantity }}</div>
                </div>
              </div>
              <span class="font-monospace fw-bold small text-dark flex-shrink-0">
                NT$ {{ (item.price * item.quantity).toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- 優惠折扣與會員點數折抵面板 (ST-11 規範 1) -->
          <div class="d-flex flex-column gap-3 mb-3 pb-3 border-bottom small">
            
            <!-- A. 優惠代碼 -->
            <div>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label text-dark fw-semibold mb-0" style="font-size: 11px;">優惠折扣券 (限用一組)</label>
              </div>
              <div v-if="cartStore.appliedCoupon" class="alert alert-success d-flex justify-content-between align-items-center py-1.5 px-2.5 mb-0 rounded-3">
                <div>
                  <span class="badge bg-success font-monospace me-1.5">{{ cartStore.appliedCoupon.code }}</span>
                  <span class="text-dark">{{ cartStore.appliedCoupon.title }}</span>
                </div>
                <button type="button" class="btn btn-link btn-sm text-danger p-0 text-decoration-none fw-bold" @click="cartStore.removeCoupon">
                  移除
                </button>
              </div>
              <div v-else class="input-group input-group-sm">
                <input v-model="inputCoupon" type="text" class="form-control rounded-start font-monospace text-uppercase" placeholder="輸入折扣碼 (如: MD100)" />
                <button type="button" @click="handleApplyCoupon" class="btn btn-outline-secondary rounded-end px-3">套用</button>
              </div>
            </div>

            <!-- B. 會員紅利點數折抵（顯示可用餘額與 20% 上限） -->
            <div v-if="authStore.user?.isLoggedIn" class="bg-light p-3 rounded-3 border">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <div class="d-flex align-items-center gap-1.5">
                  <Coins style="width: 14px; height: 14px;" class="text-primary" />
                  <strong class="text-dark" style="font-size: 11.5px;">會員紅利點數折抵</strong>
                </div>
                <span class="badge bg-white text-dark border font-monospace" style="font-size: 10px;">
                  目前餘額：{{ authStore.user.points }} 點
                </span>
              </div>

              <div class="text-muted mb-2 lh-sm" style="font-size: 10.5px;">
                規則：1 點折抵 NT$ 1，單筆最高折抵總額 20%（此單上限：<strong class="text-primary font-monospace">{{ cartStore.maxPointsAllowed }} 點</strong>）
              </div>

              <!-- 輸入框與一鍵全額折抵 -->
              <div class="d-flex gap-2">
                <div class="input-group input-group-sm">
                  <input
                    v-model.number="inputPoints"
                    type="number"
                    min="0"
                    :max="cartStore.maxPointsAllowed"
                    class="form-control rounded-start font-monospace"
                    placeholder="輸入點數"
                    @input="handlePointsChange"
                  />
                  <button
                    type="button"
                    class="btn btn-primary rounded-end px-2.5"
                    @click="applyPointsInput"
                  >
                    套用
                  </button>
                </div>

                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm text-nowrap rounded-3 py-1 px-2.5"
                  style="font-size: 11px;"
                  :disabled="cartStore.maxPointsAllowed === 0"
                  @click="applyMaxPoints"
                >
                  上限全折
                </button>
              </div>

              <!-- 目前折抵狀態 -->
              <div v-if="cartStore.usedPoints > 0" class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top text-primary" style="font-size: 11px;">
                <span>已成功套用紅利折抵</span>
                <span class="font-monospace fw-bold">- NT$ {{ cartStore.usedPoints }}</span>
              </div>
            </div>
          </div>

          <!-- 金額結算清單 -->
          <div class="d-flex flex-column gap-1.5 small">
            <div class="d-flex justify-content-between text-muted">
              <span>商品小計</span>
              <span class="font-monospace">NT$ {{ cartStore.subtotal.toLocaleString() }}</span>
            </div>
            <div class="d-flex justify-content-between text-muted">
              <span>配送運費</span>
              <span>{{ cartStore.shippingFee === 0 ? '全館免運' : `NT$ ${cartStore.shippingFee}` }}</span>
            </div>
            <div v-if="cartStore.discountAmount > 0" class="d-flex justify-content-between text-success">
              <span>優惠代碼折抵 ({{ cartStore.appliedCoupon?.code }})</span>
              <span class="font-monospace fw-bold">- NT$ {{ cartStore.discountAmount.toLocaleString() }}</span>
            </div>
            <div v-if="cartStore.usedPoints > 0" class="d-flex justify-content-between text-primary">
              <span>紅利點數折抵</span>
              <span class="font-monospace fw-bold">- NT$ {{ cartStore.usedPoints.toLocaleString() }}</span>
            </div>
            <div class="d-flex justify-content-between fw-bold fs-5 text-dark border-top pt-2 mt-2">
              <span>應付總金額</span>
              <span class="font-monospace" style="color: #9b7e68;">NT$ {{ cartStore.total.toLocaleString() }}</span>
            </div>
            <!-- 預估獲得消費回饋 -->
            <div v-if="authStore.user?.isLoggedIn" class="text-end text-muted mt-1" style="font-size: 10px;">
              完成訂單預計獲得消費回饋：<strong class="text-dark font-monospace">+{{ Math.floor(cartStore.total / 100) }} 點</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 超商地圖選店 Modal -->
    <Teleport to="body">
      <div v-if="showCvsModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px); z-index: 1060;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 520px;">
          <div class="modal-content rounded-4 border-0 p-3 shadow-lg">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-6 fw-bold text-dark d-flex align-items-center gap-2">
                <MapPin style="width: 18px; height: 18px;" class="text-primary" />
                <span>超商電子地圖選取系統</span>
              </h3>
              <button type="button" class="btn-close" @click="showCvsModal = false"></button>
            </div>
            <div class="modal-body small">
              <div class="list-group list-group-flush border rounded-3">
                <button
                  type="button"
                  v-for="store in mockCvsStores"
                  :key="store.storeId"
                  class="list-group-item list-group-item-action text-start p-3"
                  @click="confirmSelectStore(store)"
                >
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="text-dark">[{{ store.cvsType }}] {{ store.storeName }}</strong>
                    <span class="badge bg-light text-muted border font-monospace">店號: {{ store.storeId }}</span>
                  </div>
                  <div class="text-muted" style="font-size: 11px;">{{ store.address }}</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, Coins, Package } from 'lucide-vue-next'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'

const cartStore = useCartStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()
const router = useRouter()

const form = reactive({
  recipient: authStore.user?.name || '陳大文',
  phone: authStore.user?.phone || '0912345678',
  shippingMethod: 'HOME',
  address: authStore.user?.addresses?.[0]?.address || '台北市大安區忠孝東路四段 100 號 5 樓',
  paymentMethod: 'CREDIT',
  invoiceType: 'CLOUD',
  cloudCarrierType: 'PHONE',
  phoneCarrier: '/AB12+CD',
  companyTaxId: '',
  companyTitle: ''
})

const isSubmitting = ref(false)
const inputCoupon = ref('')
const inputPoints = ref(0)
const showCvsModal = ref(false)

const invoiceOptions = [
  { type: 'CLOUD', label: '個人雲端發票' },
  { type: 'COMPANY', label: '公司三聯式 (統編)' }
]

const selectedStore = ref({
  cvsType: '7-11',
  storeId: '981242',
  storeName: '鑫鑫門市',
  address: '台北市大安區忠孝東路四段 102 號'
})

const mockCvsStores = [
  { cvsType: '7-11', storeId: '981242', storeName: '鑫鑫門市', address: '台北市大安區忠孝東路四段 102 號' },
  { cvsType: '全家', storeId: '018821', storeName: '全家 忠孝東店', address: '台北市大安區忠孝東路四段 181 巷 7 號' }
]

const openCvsMapModal = () => { showCvsModal.value = true }
const confirmSelectStore = (store) => {
  selectedStore.value = store
  showCvsModal.value = false
}

const applySavedAddress = (addr) => {
  form.recipient = addr.recipient
  form.phone = addr.phone
  form.address = addr.address
}

// 點數折抵操作 (ST-11 規範 1)
const handlePointsChange = () => {
  const cap = cartStore.maxPointsAllowed
  if (inputPoints.value > cap) {
    inputPoints.value = cap
  }
}

const applyPointsInput = () => {
  const res = cartStore.setUsedPoints(inputPoints.value)
  alert(res.message)
}

const applyMaxPoints = () => {
  inputPoints.value = cartStore.maxPointsAllowed
  cartStore.setUsedPoints(inputPoints.value)
}

const handleApplyCoupon = () => {
  if (!inputCoupon.value) return
  const res = cartStore.applyCoupon(inputCoupon.value)
  alert(res.message)
  if (res.success) inputCoupon.value = ''
}

// 送出訂單扣除點數並建立訂單紀錄 (ST-11 規範 2)
const handleSubmitOrder = () => {
  const validation = cartStore.validateCartInventory()
  if (!validation.isValid) {
    alert('購物車部分商品庫存不足，請先回購物袋調整數量！')
    cartStore.toggleDrawer(true)
    return
  }

  isSubmitting.value = true
  const orderId = 'ORD-' + Date.now().toString().slice(-8)

  // 1. 若有使用紅利點數，先從會員帳本扣除
  if (cartStore.usedPoints > 0) {
    authStore.deductPoints(cartStore.usedPoints, orderId)
  }

  // 2. 建立新訂單
  const newOrder = {
    id: orderId,
    customerName: form.recipient,
    phone: form.phone,
    amount: cartStore.total,
    discountAmount: cartStore.discountAmount,
    usedPoints: cartStore.usedPoints,
    couponCode: cartStore.appliedCoupon?.code || '',
    paymentMethod: form.paymentMethod === 'CREDIT' ? '信用卡一次付清' : form.paymentMethod === 'LINEPAY' ? 'LINE Pay' : 'ATM 虛擬帳號',
    paymentStatus: form.paymentMethod === 'ATM' ? 'UNPAID' : 'PAID',
    shippingMethod: form.shippingMethod === 'HOME' ? `黑貓宅配 (${form.address})` : `超商取貨 - ${selectedStore.value.storeName}`,
    shippingStatus: form.paymentMethod === 'ATM' ? 'PENDING_PAYMENT' : 'PENDING',
    trackingCode: '',
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    items: cartStore.items.map((i) => ({
      name: `${i.name} (${i.skuName})`,
      quantity: i.quantity,
      price: i.price
    }))
  }

  adminStore.orders.unshift(newOrder)
  cartStore.clearCart()
  isSubmitting.value = false

  alert(`訂單 ${orderId} 已成功成立！`)
  router.push('/profile')
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.max-vh-50 { max-height: 45vh; }
</style>