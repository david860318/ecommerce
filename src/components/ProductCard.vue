<template>
  <div class="product-item-wrap h-100">
    <div
      class="product-item h-100 cursor-pointer"
      @click="goToDetail"
    >
      <!-- 1. 圖片容器 (1:1 比例壓縮高度，細邊框，角標與愛心內縮 14px) -->
      <div
        class="img-box position-relative overflow-hidden"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <!-- 主圖 -->
        <img
          :src="product.image"
          :alt="product.name"
          class="main-img w-100 h-100 object-fit-cover transition"
          :class="{ 'opacity-0': isHovered && hasSecondImage }"
          loading="lazy"
        />

        <!-- 次圖 (Hover 平滑切換) -->
        <img
          v-if="hasSecondImage"
          :src="secondImage"
          :alt="product.name"
          class="sub-img position-absolute top-0 start-0 w-100 h-100 object-fit-cover transition"
          :class="{ 'opacity-100': isHovered, 'opacity-0': !isHovered }"
          loading="lazy"
        />

        <!-- 商品角標 (內縮 14px，不貼齊邊框) -->
        <div v-if="product.tag" class="tag-badge-wrap position-absolute">
          <span class="product-badge font-monospace">
            {{ product.tag }}
          </span>
        </div>

        <!-- 浮動愛心按鈕 (內縮 14px，不貼齊邊框) -->
        <button
          @click.stop="handleWishlistToggle"
          type="button"
          class="heart-btn position-absolute"
          :class="{ 'is-active': authStore.isInWishlist(product.id) }"
          :aria-label="authStore.isInWishlist(product.id) ? '從願望清單移除' : '加入願望清單'"
        >
          <Heart
            class="heart-icon"
            :class="{ 'text-danger': authStore.isInWishlist(product.id) }"
            :fill="authStore.isInWishlist(product.id) ? '#a85858' : 'none'"
          />
        </button>

        <!-- 庫存少於 5 件預警 -->
        <div
          v-if="isLowStock"
          class="stock-warning-badge position-absolute bottom-0 start-0 w-100 text-center py-1 font-monospace"
        >
          即將售罄 · 庫存少於 5 件
        </div>
      </div>

      <!-- 2. 資訊區域 (緊湊內距，消除過度留白) -->
      <div class="info-box d-flex flex-column justify-content-between flex-grow-1">
        <div>
          <!-- 分類名稱 -->
          <div class="category-name text-uppercase font-monospace mb-1">
            {{ product.category }}
          </div>

          <!-- 商品名稱 (單行截斷) -->
          <h3 class="product-name mb-1.5" :title="product.name">
            {{ product.name }}
          </h3>
        </div>

        <!-- 價格區塊 (折數 % + 實付價 + 原價) -->
        <div class="price-row d-flex align-items-baseline gap-2 pt-0.5">
          <span v-if="discountPercent > 0" class="discount-rate font-monospace fw-bold">
            {{ discountPercent }}%
          </span>

          <span class="sale-price font-monospace">
            NT$ {{ product.basePrice.toLocaleString() }}
          </span>

          <span
            v-if="product.originalPrice && product.originalPrice > product.basePrice"
            class="origin-price font-monospace text-muted text-decoration-line-through"
          >
            NT$ {{ product.originalPrice.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Heart } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const authStore = useAuthStore()

const isHovered = ref(false)

const hasSecondImage = computed(() => {
  return props.product.images && props.product.images.length > 1
})

const secondImage = computed(() => {
  return hasSecondImage.value ? props.product.images[1] : props.product.image
})

const discountPercent = computed(() => {
  if (!props.product.originalPrice || props.product.originalPrice <= props.product.basePrice) {
    return 0
  }
  return Math.round(((props.product.originalPrice - props.product.basePrice) / props.product.originalPrice) * 100)
})

const isLowStock = computed(() => {
  if (!props.product.skus) return false
  return props.product.skus.some((s) => s.stock > 0 && s.stock <= 5)
})

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const handleWishlistToggle = () => {
  const res = authStore.toggleWishlist(props.product.id)
  alert(res.message)
}
</script>

<style scoped>
.product-item-wrap {
  width: 100%;
}

.product-item {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid var(--md-border, #ede8e1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(45, 38, 33, 0.04);
  transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.25s ease, border-color 0.25s ease;
}

.product-item:hover {
  transform: translateY(-3px);
  border-color: var(--md-border-dark, #ded6cb);
  box-shadow: 0 6px 18px rgba(45, 38, 33, 0.08);
}

/* 1:1 正方比例圖片容器 */
.img-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  background-color: var(--md-surface-subtle, #f5f2ed);
  border-bottom: 1px solid var(--md-border-light, #f3efe9);
}

.main-img, .sub-img {
  transition: transform 0.5s cubic-bezier(0.2, 0, 0, 1), opacity 0.35s ease;
}

.product-item:hover .main-img,
.product-item:hover .sub-img {
  transform: scale(1.04);
}

/* 角標：內縮 14px 不貼邊 */
.tag-badge-wrap {
  top: 14px;
  left: 14px;
  z-index: 2;
}

.product-badge {
  background-color: rgba(30, 25, 22, 0.85);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 8.5px;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* 浮動愛心：內縮 14px 不貼邊 */
.heart-btn {
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.04);
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  padding: 0;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.heart-btn:hover {
  background-color: #ffffff;
  transform: scale(1.08);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.heart-icon {
  width: 15px;
  height: 15px;
  color: #9c9289;
  transition: color 0.2s ease;
}

.heart-btn.is-active .heart-icon {
  color: #a85858;
}

.stock-warning-badge {
  background: rgba(168, 88, 88, 0.88);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 9.5px;
  letter-spacing: 0.04em;
  z-index: 2;
}

.info-box {
  padding: 0.75rem 0.9rem 0.85rem;
}

.category-name {
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--md-primary, #9b7e68);
  font-weight: 600;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--md-text-primary, #2d2621);
  line-height: 1.35;
  letter-spacing: 0.015em;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
}

.product-item:hover .product-name {
  color: var(--md-primary, #9b7e68);
}

.price-row {
  line-height: 1;
}

.discount-rate {
  font-size: 0.9rem;
  color: #b54949;
}

.sale-price {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--md-text-primary, #2d2621);
}

.origin-price {
  font-size: 0.725rem;
}

.cursor-pointer {
  cursor: pointer;
}
</style>