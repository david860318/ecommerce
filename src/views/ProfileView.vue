<template>
  <div class="container py-5" style="max-width: 1040px;">
    <!-- 會員名片 -->
    <div class="card-korean p-4 p-md-5 mb-4 shadow-sm bg-white">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
        <div class="d-flex align-items-center gap-3">
          <div
            class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-4 flex-shrink-0"
            style="width: 60px; height: 60px; background-color: #9b7e68;"
          >
            {{ authStore.user?.name ? authStore.user.name[0] : 'M' }}
          </div>
          <div>
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <h1 class="h5 fw-bold mb-0 text-dark">{{ authStore.user?.name || '陳大文' }}</h1>
              <span class="badge rounded-pill" style="background-color: #f5f0eb; color: #7f6450; border: 1px solid #e8ded4;">
                {{ authStore.user?.tier || 'VIP MEMBER' }}
              </span>
            </div>
            <div class="small text-muted mt-1 font-monospace">
              {{ authStore.user?.phone || '0912-345-678' }} · {{ authStore.user?.email || 'user@md-korea.com' }}
            </div>
          </div>
        </div>

        <div class="d-flex align-items-center justify-content-between w-100 w-md-auto gap-3">
          <div class="bg-light px-3 py-2 rounded-3 text-center border cursor-pointer" @click="activeMainTab = 'points'">
            <div class="text-muted" style="font-size: 10px; letter-spacing: 0.05em;">AVAILABLE POINTS</div>
            <div class="fw-bold fs-5" style="color: #9b7e68;">
              {{ authStore.user?.points || 0 }} <small class="fs-6 text-muted fw-normal">點</small>
            </div>
          </div>

          <button @click="handleLogout" class="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-1">
            <LogOut style="width: 14px; height: 14px;" />
            登出
          </button>
        </div>
      </div>
    </div>

    <!-- 頁籤導航 -->
    <ul class="nav nav-underline border-bottom mb-4">
      <li class="nav-item">
        <button
          class="nav-link text-uppercase fw-semibold py-2 px-3"
          :class="{ 'active text-primary border-primary': activeMainTab === 'orders', 'text-secondary': activeMainTab !== 'orders' }"
          @click="activeMainTab = 'orders'"
        >
          <Package class="me-1" style="width: 15px; height: 15px;" />
          訂單紀錄 ({{ displayOrders.length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link text-uppercase fw-semibold py-2 px-3"
          :class="{ 'active text-primary border-primary': activeMainTab === 'points', 'text-secondary': activeMainTab !== 'points' }"
          @click="activeMainTab = 'points'"
        >
          <Coins class="me-1" style="width: 15px; height: 15px;" />
          紅利點數專區
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link text-uppercase fw-semibold py-2 px-3"
          :class="{ 'active text-primary border-primary': activeMainTab === 'wishlist', 'text-secondary': activeMainTab !== 'wishlist' }"
          @click="activeMainTab = 'wishlist'"
        >
          <Heart class="me-1" style="width: 15px; height: 15px;" />
          願望清單 ({{ (authStore.user?.wishlist || []).length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link text-uppercase fw-semibold py-2 px-3"
          :class="{ 'active text-primary border-primary': activeMainTab === 'restock', 'text-secondary': activeMainTab !== 'restock' }"
          @click="activeMainTab = 'restock'"
        >
          <Bell class="me-1" style="width: 15px; height: 15px;" />
          補貨提醒 ({{ (authStore.user?.restockRequests || []).length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          class="nav-link text-uppercase fw-semibold py-2 px-3"
          :class="{ 'active text-primary border-primary': activeMainTab === 'profile', 'text-secondary': activeMainTab !== 'profile' }"
          @click="activeMainTab = 'profile'"
        >
          <User class="me-1" style="width: 15px; height: 15px;" />
          個人資料
        </button>
      </li>
    </ul>

    <!-- ==================== 模組 1：訂單紀錄與步驟條 ==================== -->
    <div v-if="activeMainTab === 'orders'" class="d-flex flex-column gap-4">
      
      <!-- ★ 核心步驟條（強制渲染，支援點擊過濾） ★ -->
      <div class="card-korean p-4 shadow-sm bg-white">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="d-flex align-items-center gap-2">
            <span class="rounded-circle" style="width: 8px; height: 8px; background-color: #9b7e68;"></span>
            <span class="fw-bold small text-uppercase" style="letter-spacing: 0.05em;">ORDER TIMELINE</span>
          </div>
          <span class="small text-muted">點選步驟節點過濾訂單</span>
        </div>

        <div class="overflow-x-auto no-scrollbar py-2">
          <div class="position-relative d-flex justify-content-between align-items-center px-3" style="min-width: 660px;">
            <!-- 背景灰色底線 -->
            <div class="position-absolute bg-light rounded-pill" style="left: 40px; right: 40px; top: 22px; height: 3px; z-index: 0;"></div>

            <!-- 動態進度連線 -->
            <div
              class="position-absolute rounded-pill"
              :style="{
                left: '40px',
                top: '22px',
                height: '3px',
                backgroundColor: currentStatus === 'CANCELLED' ? '#adb5bd' : '#9b7e68',
                width: stepperProgressWidth,
                transition: 'all 0.3s ease',
                zIndex: 0
              }"
            ></div>

            <!-- 步驟節點 -->
            <button
              v-for="step in interactiveSteps"
              :key="step.key"
              type="button"
              class="step-node-btn position-relative"
              style="z-index: 1;"
              @click="currentStatus = step.key"
            >
              <div class="position-relative d-inline-block">
                <div class="step-circle" :class="{ 'active': currentStatus === step.key }">
                  <component :is="step.icon" style="width: 18px; height: 18px;" />
                </div>
                <span
                  v-if="getOrderCount(step.key) > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark"
                  style="font-size: 9px;"
                >
                  {{ getOrderCount(step.key) }}
                </span>
              </div>
              <div class="small fw-semibold mt-2 text-nowrap" :class="currentStatus === step.key ? 'text-primary' : 'text-secondary'">
                {{ step.title }}
              </div>
              <div class="text-muted" style="font-size: 10px;">{{ step.desc }}</div>
            </button>
          </div>
        </div>
      </div>

      <!-- 篩選狀態提示列 -->
      <div class="d-flex justify-content-between align-items-center small text-secondary px-1">
        <div>
          目前檢視：<strong class="text-dark">{{ getFilterTitle(currentStatus) }}</strong> (共 {{ filteredOrders.length }} 筆訂單)
        </div>
        <button v-if="currentStatus !== 'ALL'" @click="currentStatus = 'ALL'" class="btn btn-link btn-sm p-0 text-primary text-decoration-none">
          查看全部訂單 →
        </button>
      </div>

      <!-- 查無訂單提示 -->
      <div v-if="filteredOrders.length === 0" class="card-korean text-center py-5 text-muted bg-white">
        <Package class="mb-2 opacity-50" style="width: 44px; height: 44px;" />
        <div class="small">在此狀態下目前尚無訂單紀錄</div>
      </div>

      <!-- 訂單卡片清單 -->
      <div v-for="order in filteredOrders" :key="order.id" class="card-korean p-4 shadow-sm bg-white">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <div class="d-flex align-items-center gap-3">
            <span class="fw-bold font-monospace text-dark">{{ order.id }}</span>
            <span class="text-muted small">{{ order.createdAt }}</span>
          </div>
          <span class="badge py-1 px-2" :class="getBadgeClass(order.shippingStatus || order.status)">
            {{ getStatusText(order.shippingStatus || order.status) }}
          </span>
        </div>

        <div class="d-flex flex-column gap-3 mb-3">
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="d-flex justify-content-between align-items-center small"
          >
            <div>
              <span class="fw-semibold text-dark">{{ item.name }}</span>
              <span class="text-muted ms-1">× {{ item.quantity }}</span>
            </div>
            <div class="d-flex align-items-center gap-3">
              <span class="font-monospace fw-bold">NT$ {{ (item.price * item.quantity).toLocaleString() }}</span>
              <template v-if="(order.shippingStatus || order.status) === 'DELIVERED'">
                <button
                  v-if="!isItemReviewed(order.id, item.name)"
                  type="button"
                  class="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 font-monospace"
                  style="font-size: 11px;"
                  @click="openReviewModal(order, item)"
                >
                  ★ 評價商品與曬圖
                </button>
                <span v-else class="badge bg-light text-muted border font-monospace" style="font-size: 11px;">
                  ✓ 已完成評價
                </span>
              </template>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center pt-3 border-top small">
          <div class="text-muted">{{ order.shippingMethod }}</div>
          <div class="d-flex align-items-center gap-3">
            <div class="text-end">
              <span class="text-muted d-block" style="font-size: 10px;">實付總額</span>
              <span class="fw-bold fs-6 font-monospace text-dark">NT$ {{ order.amount.toLocaleString() }}</span>
            </div>
            <button
              v-if="(order.shippingStatus || order.status) === 'SHIPPED'"
              class="btn btn-outline-success btn-sm rounded-pill px-3"
              @click="adminStore.markAsDelivered(order.id)"
            >
              模擬確認送達 (自動發放點數)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 模組 2：紅利點數專區 -->
    <div v-if="activeMainTab === 'points'" class="d-flex flex-column gap-4">
      <div class="card-korean p-4 shadow-sm bg-white" style="background: linear-gradient(135deg, #faf8f5 0%, #ede8e1 100%);">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <span class="badge bg-dark rounded-pill px-2.5 py-1 mb-2 font-monospace" style="font-size: 10px;">MD REWARD CLUB</span>
            <h2 class="h5 fw-bold text-dark mb-1">我的紅利點數餘額</h2>
            <div class="text-muted small">1 點紅利 = NT$ 1 元，結帳最高折抵訂單 20%</div>
          </div>
          <div class="text-end">
            <div class="display-6 fw-bold font-monospace" style="color: #9b7e68;">
              {{ authStore.user?.points || 0 }} <span class="fs-6 text-dark font-sans">點</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-korean p-4 shadow-sm bg-white">
        <h3 class="fs-6 fw-bold text-dark mb-3">點數收支異動紀錄</h3>
        <div v-if="(authStore.user?.pointsHistory || []).length === 0" class="text-center py-4 text-muted small">
          尚無點數收支紀錄
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle small mb-0">
            <thead class="table-light">
              <tr class="text-secondary" style="font-size: 11px;">
                <th>時間</th>
                <th>摘要</th>
                <th>關聯單號</th>
                <th class="text-end">變動點數</th>
                <th class="text-end">餘額</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in authStore.user.pointsHistory" :key="h.id">
                <td class="text-muted font-monospace">{{ h.createdAt }}</td>
                <td>{{ h.title }}</td>
                <td class="font-monospace text-muted">{{ h.orderId || '—' }}</td>
                <td class="text-end font-monospace fw-bold" :class="h.amount > 0 ? 'text-success' : 'text-primary'">
                  {{ h.amount > 0 ? `+${h.amount}` : h.amount }} 點
                </td>
                <td class="text-end font-monospace">{{ h.balance }} 點</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 模組 3：願望清單 -->
    <div v-if="activeMainTab === 'wishlist'" class="d-flex flex-column gap-3">
      <div v-if="wishlistProducts.length === 0" class="card-korean text-center py-5 text-muted bg-white">
        <Heart class="mb-2 opacity-40 text-danger" style="width: 44px; height: 44px;" />
        <h2 class="h6 fw-bold text-dark">願望清單目前是空的</h2>
      </div>
      <div v-else class="row g-3">
        <div v-for="p in wishlistProducts" :key="p.id" class="col-12 col-md-6">
          <div class="card-korean p-3 d-flex gap-3 align-items-center bg-white shadow-xs">
            <img :src="p.image" class="rounded object-fit-cover" style="width: 64px; height: 84px;" />
            <div class="flex-grow-1 min-w-0">
              <h3 class="fw-bold fs-6 text-dark text-truncate mb-1 cursor-pointer" @click="$router.push(`/product/${p.id}`)">{{ p.name }}</h3>
              <div class="fw-bold font-monospace mb-2" style="color: #9b7e68;">NT$ {{ p.basePrice.toLocaleString() }}</div>
              <button class="btn btn-primary btn-sm rounded-pill px-3 py-1 small" @click="$router.push(`/product/${p.id}`)">前往選購</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模組 4：補貨提醒 -->
    <div v-if="activeMainTab === 'restock'" class="d-flex flex-column gap-3">
      <div v-for="req in authStore.user?.restockRequests" :key="req.id" class="card-korean p-3 bg-white">
        <div class="d-flex justify-content-between mb-1">
          <strong class="text-dark">{{ req.productName }}</strong>
          <span class="badge bg-warning-subtle text-warning-emphasis">待補貨中</span>
        </div>
        <div class="small text-muted mb-2">預約規格：{{ req.skuName }}</div>
        <button class="btn btn-link btn-sm text-danger p-0 text-decoration-none" @click="authStore.cancelRestockAlert(req.id)">取消提醒</button>
      </div>
    </div>

    <!-- 模組 5：個人資料 -->
    <div v-if="activeMainTab === 'profile'" class="card-korean p-4 p-md-5 bg-white" style="max-width: 540px;">
      <h2 class="h6 fw-bold text-uppercase mb-4">PROFILE SETTINGS</h2>
      <div class="small d-flex flex-column gap-3">
        <div>
          <label class="form-label text-muted mb-1">姓名</label>
          <input :value="authStore.user?.name" disabled class="form-control form-control-sm bg-light" />
        </div>
        <div>
          <label class="form-label text-muted mb-1">信箱</label>
          <input :value="authStore.user?.email" disabled class="form-control form-control-sm bg-light font-monospace" />
        </div>
      </div>
    </div>

    <!-- 評價彈窗 -->
    <ReviewModal
      :is-open="showReviewModal"
      :order-id="activeOrder?.id"
      :product-id="activeProductId"
      :item="activeItem"
      @close="showReviewModal = false"
      @submitted="showReviewModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Package, Heart, Bell, User, Coins, CreditCard, PackageSearch, Truck, CheckCircle2, RotateCcw, Ban, Layers } from 'lucide-vue-next'
import ReviewModal from '../components/ReviewModal.vue'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { useAdminStore } from '../stores/adminStore'

const authStore = useAuthStore()
const productStore = useProductStore()
const adminStore = useAdminStore()
const router = useRouter()

// ★ 預設固定停留在 'orders' 頁籤，確保一進來就能看到步驟條與訂單
const activeMainTab = ref('orders')
const currentStatus = ref('ALL')

const showReviewModal = ref(false)
const activeOrder = ref(null)
const activeItem = ref(null)
const activeProductId = ref(1)

// 7 個步驟條節點設定
const interactiveSteps = [
  { key: 'ALL', title: '全部', desc: 'ALL', icon: Layers },
  { key: 'PENDING_PAYMENT', title: '待付款', desc: 'UNPAID', icon: CreditCard },
  { key: 'PENDING', title: '備貨中', desc: 'PREPARING', icon: PackageSearch },
  { key: 'SHIPPED', title: '已出貨', desc: 'SHIPPED', icon: Truck },
  { key: 'DELIVERED', title: '已送達', desc: 'DELIVERED', icon: CheckCircle2 },
  { key: 'REFUNDING', title: '售後中', desc: 'RETURN', icon: RotateCcw },
  { key: 'CANCELLED', title: '已取消', desc: 'CANCEL', icon: Ban }
]

const displayOrders = computed(() => adminStore.orders || [])

const getOrderCount = (key) => {
  if (key === 'ALL') return displayOrders.value.length
  return displayOrders.value.filter((o) => (o.shippingStatus || o.status) === key).length
}

const filteredOrders = computed(() => {
  if (currentStatus.value === 'ALL') return displayOrders.value
  return displayOrders.value.filter((o) => (o.shippingStatus || o.status) === currentStatus.value)
})

// 計算步驟條動態寬度
const stepperProgressWidth = computed(() => {
  const stepKeys = ['ALL', 'PENDING_PAYMENT', 'PENDING', 'SHIPPED', 'DELIVERED', 'REFUNDING', 'CANCELLED']
  const idx = stepKeys.indexOf(currentStatus.value)
  if (idx <= 0) return '0%'
  const percentage = (idx / (stepKeys.length - 1)) * 100
  return `min(${percentage}%, calc(100% - 2.5rem))`
})

const getFilterTitle = (key) => {
  const item = interactiveSteps.find((s) => s.key === key)
  return item ? item.title : '全部'
}

const getStatusText = (status) => {
  const map = {
    PENDING_PAYMENT: '待付款',
    PENDING: '備貨中',
    SHIPPED: '已出貨',
    DELIVERED: '交易完成',
    CANCELLED: '已取消',
    REFUNDING: '售後處理中'
  }
  return map[status] || status
}

const getBadgeClass = (status) => {
  const map = {
    PENDING_PAYMENT: 'bg-warning-subtle text-warning-emphasis',
    PENDING: 'bg-secondary-subtle text-secondary-emphasis',
    SHIPPED: 'bg-info-subtle text-info-emphasis',
    DELIVERED: 'bg-success-subtle text-success-emphasis',
    CANCELLED: 'bg-light text-muted border',
    REFUNDING: 'bg-danger-subtle text-danger-emphasis'
  }
  return map[status] || 'bg-light text-dark'
}

const isItemReviewed = (orderId, itemName) => {
  return productStore.reviews.some((r) => r.orderId === orderId)
}

const openReviewModal = (order, item) => {
  activeOrder.value = order
  activeItem.value = item
  const found = productStore.products.find((p) => item.name.includes(p.name))
  activeProductId.value = found ? found.id : 1
  showReviewModal.value = true
}

const wishlistProducts = computed(() => {
  const ids = authStore.user?.wishlist || []
  return productStore.products.filter((p) => ids.includes(p.id))
})

const handleLogout = () => {
  if (confirm('確定登出？')) {
    authStore.logout()
    router.push('/')
  }
}
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
</style>