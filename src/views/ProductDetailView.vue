<template>
  <div v-if="product" class="container py-4 py-md-5" style="max-width: 1140px;">
    <!-- 麵包屑導航 -->
    <nav class="small text-muted mb-4" aria-label="breadcrumb">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item"><router-link to="/" class="text-decoration-none text-muted">首頁</router-link></li>
        <li class="breadcrumb-item"><span class="text-muted">{{ product.category }}</span></li>
        <li class="breadcrumb-item active text-dark fw-semibold" aria-current="page">{{ product.name }}</li>
      </ol>
    </nav>

    <div class="row g-4 g-lg-5 mb-5">
      <!-- 左側多圖輪播 -->
      <div class="col-12 col-md-6">
        <div class="d-flex flex-column gap-3">
          <div
            class="position-relative overflow-hidden rounded-4 bg-light cursor-zoom-in shadow-xs"
            style="aspect-ratio: 3/4;"
            @click="openLightbox"
          >
            <img :src="currentImage" :alt="product.name" class="w-100 h-100 object-fit-cover transition" />
            <div
              class="position-absolute bottom-0 end-0 m-3 p-2 bg-dark text-white rounded-circle opacity-75 d-flex align-items-center justify-content-center"
              style="width: 36px; height: 36px;"
              title="點擊放大檢視"
            >
              <Maximize2 style="width: 16px; height: 16px;" />
            </div>
            <span v-if="product.tag" class="position-absolute top-0 start-0 m-3 badge bg-dark opacity-75 font-monospace text-uppercase" style="font-size: 10px;">
              {{ product.tag }}
            </span>
          </div>

          <div class="d-flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              v-for="(img, idx) in allImages"
              :key="idx"
              type="button"
              class="p-0 border rounded-3 overflow-hidden bg-light flex-shrink-0 transition"
              :class="{ 'border-primary ring-2': currentImage === img }"
              style="width: 72px; aspect-ratio: 3/4; cursor: pointer;"
              @click="currentImage = img"
            >
              <img :src="img" class="w-100 h-100 object-fit-cover" />
            </button>
          </div>
        </div>
      </div>

      <!-- 右側規格選擇與購買操作 -->
      <div class="col-12 col-md-6 d-flex flex-column">
        <div class="d-flex justify-content-between align-items-center mb-1">
          <span class="text-uppercase small fw-bold" style="color: var(--md-primary); font-size: 11px; letter-spacing: 0.1em;">
            {{ product.category }}
          </span>
          <span class="small text-muted font-monospace">已售出 {{ product.salesCount }} 件</span>
        </div>

        <h1 class="h4 fw-bold text-dark mb-2" style="font-family: serif; letter-spacing: 0.03em;">
          {{ product.name }}
        </h1>

        <div class="d-flex align-items-baseline gap-2 mb-4">
          <span class="fs-4 fw-bold font-monospace" style="color: var(--md-primary);">
            NT$ {{ activePrice.toLocaleString() }}
          </span>
          <span v-if="activeOriginalPrice" class="small text-muted text-decoration-line-through font-monospace">
            NT$ {{ activeOriginalPrice.toLocaleString() }}
          </span>
        </div>

        <!-- 富文本與簡述 -->
        <div v-if="product.descriptionHtml" class="small text-secondary mb-3" v-html="product.descriptionHtml"></div>
        <p v-else class="text-secondary small leading-relaxed mb-4">{{ product.description }}</p>
        <hr class="border-stone-200 my-2" />

        <!-- 顏色規格 -->
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small fw-semibold text-dark">選擇顏色：<strong class="text-primary">{{ selectedColor }}</strong></span>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button
              v-for="color in availableColors"
              :key="color"
              type="button"
              class="btn btn-sm rounded-pill px-3 py-1.5 small text-nowrap"
              :class="selectedColor === color ? 'btn-primary shadow-xs' : 'btn-outline-secondary'"
              @click="selectedColor = color"
            >
              {{ color }}
            </button>
          </div>
        </div>

        <!-- 尺寸規格與庫存連動 -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small fw-semibold text-dark">選擇尺寸：<strong class="text-primary">{{ selectedSize }}</strong></span>
            <span class="small font-monospace" :class="isOutOfStock ? 'text-danger fw-bold' : 'text-muted'">
              {{ isOutOfStock ? '● 該規格已斷貨售完' : `剩餘庫存：${currentSku?.stock || 0} 件` }}
            </span>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button
              v-for="size in availableSizes"
              :key="size"
              type="button"
              class="btn btn-sm rounded-3 px-3 py-1.5 small"
              :class="selectedSize === size ? 'btn-primary' : 'btn-outline-secondary'"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <!-- 選購數量 -->
        <div class="mb-4" v-if="!isOutOfStock">
          <label class="small fw-semibold text-dark mb-2 d-block">選購數量：</label>
          <div class="d-flex align-items-center gap-2" style="width: 140px;">
            <button class="btn btn-light border btn-sm py-1 px-3 rounded-start" :disabled="quantity <= 1" @click="quantity--">-</button>
            <input v-model.number="quantity" type="number" readonly class="form-control form-control-sm text-center font-monospace rounded-0 bg-white" />
            <button class="btn btn-light border btn-sm py-1 px-3 rounded-end" :disabled="currentSku && quantity >= currentSku.stock" @click="quantity++">+</button>
          </div>
        </div>

        <!-- 加入購物車或補貨提醒 -->
        <div class="d-flex gap-3 mb-4">
          <button
            v-if="!isOutOfStock"
            type="button"
            class="btn btn-primary flex-grow-1 rounded-pill py-3 fw-bold tracking-wider text-uppercase d-flex align-items-center justify-content-center gap-2 shadow-sm"
            @click="handleAddToCart"
          >
            <ShoppingBag style="width: 18px; height: 18px;" />
            <span>加入購物袋</span>
          </button>

          <button
            v-else
            type="button"
            class="btn btn-outline-danger flex-grow-1 rounded-pill py-3 fw-bold tracking-wider d-flex align-items-center justify-content-center gap-2 shadow-sm"
            @click="openRestockModal"
          >
            <Bell style="width: 18px; height: 18px;" />
            <span>缺貨中 · 貨到通知我</span>
          </button>

          <button
            @click="handleWishlistToggle"
            class="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0"
            style="width: 50px; height: 50px;"
            :title="authStore.isInWishlist(product.id) ? '從願望清單移除' : '加入願望清單'"
          >
            <Heart
              style="width: 20px; height: 20px;"
              :class="{ 'text-danger': authStore.isInWishlist(product.id) }"
              :fill="authStore.isInWishlist(product.id) ? 'currentColor' : 'none'"
            />
          </button>
        </div>

        <div class="card-korean p-3 small text-muted mb-4 bg-light">
          <div class="d-flex align-items-center gap-2 mb-1">
            <Truck style="width: 16px; height: 16px; color: var(--md-primary);" />
            <span>全館滿 <strong>NT$ 1,500</strong> 享免運</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <CheckCircle2 style="width: 16px; height: 16px;" class="text-success" />
            <span>首爾正韓原裝直送 · 7 天安心鑑賞期</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 顧客真實評價專區 (UGC) -->
    <section class="mt-5 pt-4 border-top">
      <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 class="h5 fw-bold text-dark font-serif mb-1">CUSTOMER REVIEWS</h2>
          <p class="small text-muted mb-0">來自已購買顧客的真實評價與實穿實拍</p>
        </div>

        <div>
          <button
            v-if="canReviewCurrentProduct"
            type="button"
            class="btn btn-primary btn-sm rounded-pill px-3 py-1.5 fw-bold font-monospace"
            @click="showReviewModal = true"
          >
            ★ 撰寫我的評價與曬圖
          </button>
          <span v-else class="text-muted small" style="font-size: 11px;">
            ※ 僅限完成訂單送達之顧客留評
          </span>
        </div>
      </div>

      <!-- 評分總覽 -->
      <div class="card-korean p-4 bg-white shadow-xs mb-4">
        <div class="row g-4 align-items-center">
          <div class="col-12 col-md-4 text-center border-end-md">
            <div class="display-5 fw-bold font-monospace text-dark">{{ ratingSummary.average }}</div>
            <div class="d-flex justify-content-center text-warning mb-1">
              <Star
                v-for="s in 5"
                :key="s"
                style="width: 18px; height: 18px;"
                :fill="ratingSummary.average >= s ? '#ffc107' : 'none'"
              />
            </div>
            <div class="small text-muted font-monospace">共 {{ ratingSummary.count }} 則評價</div>
          </div>

          <div class="col-12 col-md-8">
            <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="d-flex align-items-center gap-2 mb-1 small">
              <span class="text-muted font-monospace" style="width: 32px;">{{ star }} 星</span>
              <div class="progress flex-grow-1" style="height: 6px;">
                <div
                  class="progress-bar bg-warning"
                  role="progressbar"
                  :style="{ width: `${ratingSummary.count > 0 ? (ratingSummary.breakdown[star] / ratingSummary.count) * 100 : 0}%` }"
                ></div>
              </div>
              <span class="text-muted font-monospace" style="width: 25px; font-size: 11px;">
                {{ ratingSummary.breakdown[star] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 評價清單 -->
      <div v-if="productReviews.length === 0" class="card-korean text-center py-5 text-muted bg-white">
        <MessageSquare style="width: 38px; height: 38px;" class="mb-2 opacity-30" />
        <div class="small">此商品目前尚無評價，歡迎完成購買之會員留下第一則心得！</div>
      </div>

      <div v-else class="d-flex flex-column gap-3">
        <div
          v-for="rev in productReviews"
          :key="rev.id"
          class="card-korean p-4 bg-white shadow-xs"
        >
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="fw-bold text-dark">{{ rev.userName }}</span>
                <span class="badge rounded-pill bg-success-subtle text-success font-monospace" style="font-size: 10px;">
                  ✓ 已認證購買者
                </span>
              </div>
              <div class="d-flex text-warning">
                <Star
                  v-for="s in 5"
                  :key="s"
                  style="width: 14px; height: 14px;"
                  :fill="rev.rating >= s ? '#ffc107' : 'none'"
                />
              </div>
            </div>
            <span class="text-muted font-monospace small" style="font-size: 11px;">{{ rev.createdAt }}</span>
          </div>

          <p class="text-secondary small mb-3 leading-relaxed">{{ rev.content }}</p>

          <div v-if="rev.images && rev.images.length > 0" class="d-flex gap-2 flex-wrap">
            <img
              v-for="(img, iIdx) in rev.images"
              :key="iIdx"
              :src="img"
              class="rounded-3 object-fit-cover border cursor-pointer hover-zoom"
              style="width: 76px; height: 76px;"
              @click="previewImage(img)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 評價彈窗 -->
    <ReviewModal
      :is-open="showReviewModal"
      :product-id="product.id"
      :product="product"
      :order-id="eligibleOrderId"
      @close="showReviewModal = false"
      @submitted="onReviewSubmitted"
    />

    <!-- 補貨登記彈窗 -->
    <Teleport to="body">
      <div
        v-if="showRestockModal"
        class="modal fade show d-block modal-backdrop-custom"
        tabindex="-1"
        style="z-index: 1065;"
      >
        <div class="modal-dialog modal-dialog-centered" style="max-width: 440px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-6 fw-bold text-dark d-flex align-items-center gap-2">
                <Bell style="width: 18px; height: 18px; color: var(--md-primary);" />
                <span>登記補貨提醒通知</span>
              </h3>
              <button type="button" class="btn-close" @click="showRestockModal = false"></button>
            </div>
            <div class="modal-body small">
              <div class="bg-light p-3 rounded-3 mb-3 font-monospace">
                <div class="fw-bold text-dark mb-1">{{ product.name }}</div>
                <div class="text-muted" style="font-size: 11px;">預約規格：<span class="text-primary fw-bold">{{ currentSku?.color }} / {{ currentSku?.size }}</span></div>
              </div>

              <form @submit.prevent="submitRestockAlert" class="d-flex flex-column gap-3">
                <div>
                  <label class="form-label mb-1">通知信箱 Email *</label>
                  <input v-model="restockForm.email" required type="email" class="form-control form-control-sm font-monospace" placeholder="your@email.com" />
                </div>
                <div>
                  <label class="form-label mb-1">通知手機 SMS (選填)</label>
                  <input v-model="restockForm.phone" type="tel" pattern="^09\d{8}$" class="form-control form-control-sm font-monospace" placeholder="0912345678" />
                </div>
                <button type="submit" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold mt-2">
                  確認登記補貨提醒
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- 燈箱預覽 -->
      <div
        v-if="lightboxImg || showLightbox"
        class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-90 d-flex align-items-center justify-content-center p-3"
        style="z-index: 1080;"
        @click="lightboxImg = null; showLightbox = false;"
      >
        <img :src="lightboxImg || currentImage" class="rounded-3 shadow-lg object-fit-contain" style="max-width: 90vw; max-height: 85vh;" />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ShoppingBag, Heart, Maximize2, Truck, CheckCircle2, Bell, Star, MessageSquare } from 'lucide-vue-next'
import ReviewModal from '../components/ReviewModal.vue'
import { useProductStore } from '../stores/productStore'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { useAdminStore } from '../stores/adminStore'

const route = useRoute()
const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const adminStore = useAdminStore()

const product = computed(() => productStore.getProductById(route.params.id))
const productReviews = computed(() => productStore.getProductReviews(route.params.id))
const ratingSummary = computed(() => productStore.getProductRatingSummary(route.params.id))

const allImages = computed(() => {
  if (!product.value) return []
  return product.value.images && product.value.images.length > 0 ? product.value.images : [product.value.image]
})

const currentImage = ref('')
const showLightbox = ref(false)
const showReviewModal = ref(false)
const showRestockModal = ref(false)
const lightboxImg = ref(null)

const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)

const restockForm = reactive({
  email: '',
  phone: ''
})

const availableColors = computed(() => [...new Set((product.value?.skus || []).map((s) => s.color))])
const availableSizes = computed(() => [...new Set((product.value?.skus || []).map((s) => s.size))])

const currentSku = computed(() => {
  return product.value?.skus.find((s) => s.color === selectedColor.value && s.size === selectedSize.value)
})

const activePrice = computed(() => currentSku.value?.price || product.value?.basePrice || 0)
const activeOriginalPrice = computed(() => currentSku.value?.originalPrice || product.value?.originalPrice || null)
const isOutOfStock = computed(() => !currentSku.value || currentSku.value.stock <= 0)

const eligibleOrder = computed(() => {
  if (!authStore.user?.isLoggedIn) return null
  return (adminStore.orders || []).find((o) => {
    const isCompleted = (o.shippingStatus || o.status) === 'DELIVERED'
    const containsProduct = o.items.some((item) => item.name.includes(product.value?.name))
    return isCompleted && containsProduct
  })
})

const canReviewCurrentProduct = computed(() => !!eligibleOrder.value)
const eligibleOrderId = computed(() => eligibleOrder.value?.id || 'ORD-VERIFIED')

const previewImage = (img) => { lightboxImg.value = img }
const openLightbox = () => { showLightbox.value = true }
const onReviewSubmitted = () => { showReviewModal.value = false }

const initDefaults = () => {
  if (product.value) {
    currentImage.value = allImages.value[0] || product.value.image
    const defaultSku = product.value.skus.find((s) => s.stock > 0) || product.value.skus[0]
    if (defaultSku) {
      selectedColor.value = defaultSku.color
      selectedSize.value = defaultSku.size
    }
  }
}

watch(() => route.params.id, () => initDefaults())
onMounted(() => initDefaults())

const handleWishlistToggle = () => {
  if (product.value) {
    const res = authStore.toggleWishlist(product.value.id)
    alert(res.message)
  }
}

const openRestockModal = () => {
  if (!authStore.user?.isLoggedIn) {
    alert('請先登入會員以登記補貨提醒！')
    return
  }
  restockForm.email = authStore.user.email || ''
  restockForm.phone = authStore.user.phone || ''
  showRestockModal.value = true
}

const submitRestockAlert = () => {
  const res = authStore.registerRestockAlert(product.value, currentSku.value, restockForm)
  alert(res.message)
  if (res.success) showRestockModal.value = false
}

const handleAddToCart = () => {
  if (!currentSku.value || isOutOfStock.value) return
  const res = cartStore.addToCart(product.value, currentSku.value, quantity.value)
  if (!res.success) alert(res.message)
}
</script>

<style scoped>
.cursor-zoom-in { cursor: zoom-in; }
.ring-2 { outline: 2px solid var(--md-primary); }
.hover-zoom:hover { transform: scale(1.05); }
.cursor-pointer { cursor: pointer; }
</style>