<template>
  <Teleport to="body">
    <!-- 背景遮罩 -->
    <div
      v-if="cartStore.isDrawerOpen"
      class="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50"
      style="z-index: 1050;"
      @click="cartStore.toggleDrawer(false)"
    ></div>

    <!-- 側欄抽屜本體 -->
    <div
      class="position-fixed top-0 end-0 bg-white h-100 p-4 shadow-lg d-flex flex-column transition"
      style="width: 410px; max-width: 92vw; z-index: 1055; transition: transform 0.3s ease;"
      :style="{ transform: cartStore.isDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }"
    >
      <!-- 標題與關閉按鈕 -->
      <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <h2 class="h6 fw-bold mb-0 text-dark font-serif" style="letter-spacing: 0.05em;">
          SHOPPING BAG ({{ cartStore.totalCount }})
        </h2>
        <button type="button" class="btn-close" @click="cartStore.toggleDrawer(false)" aria-label="關閉購物車"></button>
      </div>

      <!-- 全館滿額免運進度條 -->
      <div class="card-korean p-3 mb-3 bg-light border-0">
        <div class="d-flex justify-content-between align-items-center small mb-1.5">
          <span class="text-secondary" style="font-size: 11px;">
            <span v-if="cartStore.remainingForFreeShipping > 0">
              再消費 <strong class="text-primary font-monospace">NT$ {{ cartStore.remainingForFreeShipping.toLocaleString() }}</strong> 即享全館免運
            </span>
            <span v-else class="text-success fw-bold">✓ 已達成全館免運門檻！</span>
          </span>
          <span class="font-monospace text-muted" style="font-size: 11px;">
            NT$ {{ cartStore.subtotal.toLocaleString() }} / {{ cartStore.FREE_SHIPPING_THRESHOLD }}
          </span>
        </div>
        <div class="progress" style="height: 4px;">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{
              width: `${Math.min(100, (cartStore.subtotal / cartStore.FREE_SHIPPING_THRESHOLD) * 100)}%`,
              backgroundColor: '#9b7e68'
            }"
          ></div>
        </div>
      </div>

      <!-- 購物清單 -->
      <div class="flex-grow-1 overflow-y-auto no-scrollbar mb-3">
        <div v-if="cartStore.items.length === 0" class="text-center py-5 text-muted small">
          購物袋內目前沒有任何商品
        </div>

        <div
          v-for="item in cartStore.items"
          :key="item.skuId"
          class="border rounded-3 p-3 mb-2.5 transition position-relative"
          :class="isErrorItem(item.skuId) ? 'border-danger bg-danger-subtle bg-opacity-10' : 'border-stone-200/80 bg-white'"
        >
          <div v-if="isErrorItem(item.skuId)" class="badge bg-danger text-white mb-2 py-1 px-2 font-monospace" style="font-size: 10px;">
            ⚠ 此規格庫存不足，請調整購買數量
          </div>

          <div class="d-flex gap-3">
            <img :src="item.image" class="rounded object-fit-cover flex-shrink-0" style="width: 58px; height: 76px;" />

            <div class="flex-grow-1 small min-w-0">
              <div class="fw-semibold text-truncate mb-1 text-dark">{{ item.name }}</div>
              <div class="text-muted" style="font-size: 11px;">規格：{{ item.skuName }}</div>
              <div class="fw-bold font-monospace mt-1" style="color: #9b7e68;">
                NT$ {{ item.price.toLocaleString() }}
              </div>

              <div class="d-flex align-items-center gap-2 mt-2">
                <div class="input-group input-group-sm" style="width: 90px;">
                  <button class="btn btn-outline-secondary py-0 px-2" @click="cartStore.updateQuantity(item.skuId, -1)">-</button>
                  <input type="text" readonly class="form-control text-center p-0 font-monospace bg-white" :value="item.quantity" />
                  <button class="btn btn-outline-secondary py-0 px-2" @click="cartStore.updateQuantity(item.skuId, 1)">+</button>
                </div>

                <span class="font-monospace text-muted" style="font-size: 11px;">
                  小計: NT$ {{ (item.price * item.quantity).toLocaleString() }}
                </span>

                <button
                  class="btn btn-link btn-sm text-danger p-0 ms-auto text-decoration-none"
                  style="font-size: 11px;"
                  @click="cartStore.removeFromCart(item.skuId)"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== 優惠券折抵模組 (ST-09) ==================== -->
      <div class="border-top pt-3 pb-2 small">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold text-dark" style="font-size: 11px; letter-spacing: 0.05em;">優惠代碼與優惠券折抵</span>
          <button
            type="button"
            class="btn btn-link btn-sm p-0 text-primary text-decoration-none"
            style="font-size: 11px;"
            @click="showCouponDrawer = !showCouponDrawer"
          >
            {{ showCouponDrawer ? '收合優惠券' : '查看可用優惠券' }}
          </button>
        </div>

        <!-- 已套用優惠券標籤 -->
        <div v-if="cartStore.appliedCoupon" class="alert alert-success d-flex justify-content-between align-items-center py-1.5 px-2.5 mb-2 rounded-3 small">
          <div>
            <span class="badge bg-success font-monospace me-1.5">{{ cartStore.appliedCoupon.code }}</span>
            <span class="text-dark">{{ cartStore.appliedCoupon.title }}</span>
          </div>
          <button type="button" class="btn btn-link btn-sm text-danger p-0 text-decoration-none fw-bold" @click="cartStore.removeCoupon">
            移除
          </button>
        </div>

        <!-- 優惠代碼手動輸入框 -->
        <div v-else class="input-group input-group-sm mb-2">
          <input
            v-model="inputCode"
            type="text"
            placeholder="請輸入折扣碼 (如: MD100)"
            class="form-control rounded-start font-monospace text-uppercase"
            @keyup.enter="handleApplyInputCode"
          />
          <button type="button" class="btn btn-outline-secondary rounded-end px-3" @click="handleApplyInputCode">
            套用
          </button>
        </div>

        <!-- 可用優惠券下拉選擇清單 -->
        <div v-if="showCouponDrawer" class="border rounded-3 p-2 bg-light mb-2 overflow-y-auto no-scrollbar" style="max-height: 160px;">
          <div
            v-for="coupon in cartStore.availableCoupons"
            :key="coupon.code"
            class="card-korean p-2 mb-1.5 bg-white border d-flex flex-column gap-1"
          >
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span class="badge bg-dark font-monospace me-1" style="font-size: 9px;">{{ coupon.code }}</span>
                <strong class="text-dark" style="font-size: 11.5px;">{{ coupon.title }}</strong>
              </div>
              <button
                type="button"
                class="btn btn-sm py-0.5 px-2 rounded-pill font-monospace"
                :class="cartStore.appliedCoupon?.code === coupon.code ? 'btn-success text-white' : 'btn-outline-primary'"
                style="font-size: 10px;"
                @click="handleSelectCoupon(coupon)"
              >
                {{ cartStore.appliedCoupon?.code === coupon.code ? '已套用' : '點擊套用' }}
              </button>
            </div>
            <div class="text-muted" style="font-size: 10px;">{{ coupon.description }}</div>
            <div class="text-muted" style="font-size: 9.5px;">
              有效期限至：{{ coupon.endDate.slice(0, 10) }} · 適用品類：{{ coupon.targetCategory === 'ALL' ? '全館商品' : coupon.targetCategory }}
            </div>
          </div>
        </div>
      </div>

      <!-- 金額總結算區 (ST-09 規範 2: 實付總額不得為負數) -->
      <div class="border-top pt-2 small">
        <div class="d-flex justify-content-between mb-1 text-muted">
          <span>商品小計</span>
          <span class="font-monospace">NT$ {{ cartStore.subtotal.toLocaleString() }}</span>
        </div>
        <div class="d-flex justify-content-between mb-1 text-muted">
          <span>配送運費</span>
          <span>{{ cartStore.shippingFee === 0 ? '全館免運' : `NT$ ${cartStore.shippingFee}` }}</span>
        </div>
        <div v-if="cartStore.discountAmount > 0" class="d-flex justify-content-between text-success mb-1">
          <span>優惠券折抵 ({{ cartStore.appliedCoupon?.code }})</span>
          <span class="font-monospace fw-bold">- NT$ {{ cartStore.discountAmount.toLocaleString() }}</span>
        </div>
        <div class="d-flex justify-content-between fw-bold fs-6 mb-3 text-dark border-top pt-2 mt-2">
          <span>實付總額</span>
          <span class="font-monospace" style="color: #9b7e68;">NT$ {{ cartStore.total.toLocaleString() }}</span>
        </div>

        <button
          @click="handlePreCheckout"
          :disabled="cartStore.items.length === 0"
          class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold tracking-wide"
        >
          前往結帳流程
        </button>
      </div>
    </div>

    <!-- 庫存不足警示彈窗 -->
    <div
      v-if="showStockModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(2px); z-index: 1060;"
    >
      <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
        <div class="modal-content rounded-4 border-0 p-3 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h3 class="modal-title fs-6 fw-bold text-danger d-flex align-items-center gap-1.5">
              <span>⚠ 部分商品庫存不足</span>
            </h3>
            <button type="button" class="btn-close" @click="showStockModal = false"></button>
          </div>
          <div class="modal-body small">
            <p class="text-secondary mb-3">以下規格已被搶購或庫存不足，請先調整數量再繼續結帳：</p>
            <ul class="list-group list-group-flush border rounded-3 mb-3">
              <li
                v-for="err in stockErrors"
                :key="err.skuId"
                class="list-group-item d-flex justify-content-between align-items-center p-2.5"
              >
                <div>
                  <div class="fw-bold text-dark">{{ err.name }}</div>
                  <div class="text-muted" style="font-size: 11px;">規格：{{ err.skuName }}</div>
                </div>
                <span class="badge bg-danger rounded-pill">{{ err.reason }}</span>
              </li>
            </ul>
            <button
              type="button"
              class="btn btn-dark w-100 rounded-pill py-2"
              @click="showStockModal = false"
            >
              我知道了，返回修改數量
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'

const cartStore = useCartStore()
const router = useRouter()

const inputCode = ref('')
const showCouponDrawer = ref(false)
const showStockModal = ref(false)
const stockErrors = ref([])

const isErrorItem = (skuId) => cartStore.outOfStockItems.includes(skuId)

const handleApplyInputCode = () => {
  if (!inputCode.value) return
  const res = cartStore.applyCoupon(inputCode.value)
  alert(res.message)
  if (res.success) inputCode.value = ''
}

const handleSelectCoupon = (coupon) => {
  if (cartStore.appliedCoupon?.code === coupon.code) {
    cartStore.removeCoupon()
    return
  }
  const res = cartStore.applyCoupon(coupon.code)
  alert(res.message)
}

const handlePreCheckout = () => {
  const validation = cartStore.validateCartInventory()
  if (!validation.isValid) {
    stockErrors.value = validation.errors
    showStockModal.value = true
    return
  }
  cartStore.toggleDrawer(false)
  router.push('/checkout')
}
</script>