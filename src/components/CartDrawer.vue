<template>
  <Teleport to="body">
    <div
      v-if="cartStore.isDrawerOpen"
      class="position-fixed top-0 start-0 w-100 h-100 modal-backdrop-custom"
      style="z-index: 1050;"
      @click="cartStore.toggleDrawer(false)"
    ></div>

    <div
      class="position-fixed top-0 end-0 bg-white h-100 p-4 shadow-lg d-flex flex-column transition"
      style="width: 410px; max-width: 92vw; z-index: 1055; transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);"
      :style="{ transform: cartStore.isDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }"
    >
      <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <h2 class="h6 fw-bold mb-0 text-dark font-serif" style="letter-spacing: 0.05em;">
          SHOPPING BAG ({{ cartStore.totalCount }})
        </h2>
        <button type="button" class="btn-close" @click="cartStore.toggleDrawer(false)" aria-label="關閉購物車"></button>
      </div>

      <!-- 免運進度條 -->
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
              backgroundColor: 'var(--md-primary)'
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
          :class="isErrorItem(item.skuId) ? 'border-danger bg-danger-subtle bg-opacity-10' : 'bg-white'"
        >
          <div v-if="isErrorItem(item.skuId)" class="badge bg-danger text-white mb-2 py-1 px-2 font-monospace" style="font-size: 10px;">
            ⚠ 此規格庫存不足，請調整購買數量
          </div>

          <div class="d-flex gap-3">
            <img :src="item.image" class="rounded object-fit-cover flex-shrink-0" style="width: 58px; height: 76px;" />
            <div class="flex-grow-1 small min-w-0">
              <div class="fw-semibold text-truncate mb-1 text-dark">{{ item.name }}</div>
              <div class="text-muted" style="font-size: 11px;">規格：{{ item.skuName }}</div>
              <div class="fw-bold font-monospace mt-1" style="color: var(--md-primary);">
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

      <!-- 優惠券折抵 -->
      <div class="border-top pt-3 pb-2 small">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="fw-bold text-dark" style="font-size: 11px;">優惠折扣券</span>
          <button
            type="button"
            class="btn btn-link btn-sm p-0 text-primary text-decoration-none"
            style="font-size: 11px;"
            @click="showCouponDrawer = !showCouponDrawer"
          >
            {{ showCouponDrawer ? '收合優惠券' : '查看可用券' }}
          </button>
        </div>

        <div v-if="cartStore.appliedCoupon" class="alert alert-success d-flex justify-content-between align-items-center py-1.5 px-2.5 mb-2 rounded-3 small">
          <div>
            <span class="badge bg-success font-monospace me-1.5">{{ cartStore.appliedCoupon.code }}</span>
            <span class="text-dark">{{ cartStore.appliedCoupon.title }}</span>
          </div>
          <button type="button" class="btn btn-link btn-sm text-danger p-0 text-decoration-none fw-bold" @click="cartStore.removeCoupon">
            移除
          </button>
        </div>

        <div v-else class="input-group input-group-sm mb-2">
          <input
            v-model="inputCode"
            type="text"
            placeholder="輸入折扣代碼"
            class="form-control font-monospace text-uppercase"
            @keyup.enter="handleApplyInputCode"
          />
          <button type="button" class="btn btn-outline-secondary px-3" @click="handleApplyInputCode">
            套用
          </button>
        </div>

        <div v-if="showCouponDrawer" class="border rounded-3 p-2 bg-light mb-2 no-scrollbar" style="max-height: 140px; overflow-y: auto;">
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
                {{ cartStore.appliedCoupon?.code === coupon.code ? '已套用' : '套用' }}
              </button>
            </div>
            <div class="text-muted" style="font-size: 10px;">{{ coupon.description }}</div>
          </div>
        </div>
      </div>

      <!-- 總額結算 -->
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
          <span>優惠券折抵</span>
          <span class="font-monospace fw-bold">- NT$ {{ cartStore.discountAmount.toLocaleString() }}</span>
        </div>
        <div class="d-flex justify-content-between fw-bold fs-6 mb-3 text-dark border-top pt-2 mt-2">
          <span>實付總額</span>
          <span class="font-monospace" style="color: var(--md-primary);">NT$ {{ cartStore.total.toLocaleString() }}</span>
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
    alert('購物車中部分商品庫存不足，請先調整數量！')
    return
  }
  cartStore.toggleDrawer(false)
  router.push('/checkout')
}
</script>