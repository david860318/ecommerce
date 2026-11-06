<template>
  <div class="card card-korean h-100 shadow-xs border-0 overflow-hidden position-relative">
    <!-- 愛心收藏按鈕 -->
    <button
      @click.stop="handleWishlistToggle"
      class="btn btn-light rounded-circle position-absolute top-0 end-0 m-2 p-2 shadow-xs d-flex align-items-center justify-content-center"
      style="z-index: 2; width: 32px; height: 32px;"
      aria-label="加入收藏"
    >
      <Heart
        style="width: 15px; height: 15px;"
        :class="{ 'text-danger': authStore.isInWishlist(product.id), 'text-muted': !authStore.isInWishlist(product.id) }"
        :fill="authStore.isInWishlist(product.id) ? 'currentColor' : 'none'"
      />
    </button>

    <!-- 點擊照片直接跳轉至 PDP 獨立分頁 -->
    <div
      class="position-relative overflow-hidden bg-light cursor-pointer"
      style="aspect-ratio: 3/4;"
      @click="goToDetail"
    >
      <img
        :src="product.image"
        :alt="product.name"
        class="w-100 h-100 object-fit-cover transition"
        style="transition: transform 0.5s ease;"
        loading="lazy"
      />
      <span
        v-if="product.tag"
        class="position-absolute top-0 start-0 m-2 badge bg-dark opacity-75 font-monospace text-uppercase"
        style="font-size: 9px; letter-spacing: 0.05em;"
      >
        {{ product.tag }}
      </span>
    </div>

    <!-- 商品資訊 -->
    <div class="card-body p-3 d-flex flex-column">
      <div class="text-uppercase text-muted mb-1" style="font-size: 10px; letter-spacing: 0.05em; color: #9b7e68 !important;">
        {{ product.category }}
      </div>
      <h3
        @click="goToDetail"
        class="card-title text-dark fs-6 fw-normal text-truncate mb-2 cursor-pointer"
      >
        {{ product.name }}
      </h3>

      <div class="mt-auto d-flex align-items-baseline gap-2 mb-3">
        <span class="fw-bold fs-6 font-monospace text-dark">NT$ {{ product.basePrice.toLocaleString() }}</span>
        <span v-if="product.originalPrice" class="small text-muted text-decoration-line-through font-monospace">
          NT$ {{ product.originalPrice.toLocaleString() }}
        </span>
      </div>

      <button
        @click="goToDetail"
        class="btn btn-light btn-sm rounded-pill text-secondary w-100 fw-medium"
      >
        查看商品詳情
      </button>
    </div>
  </div>
</template>

<script setup>
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

const goToDetail = () => {
  router.push(`/product/${props.product.id}`)
}

const handleWishlistToggle = () => {
  const res = authStore.toggleWishlist(props.product.id)
  alert(res.message)
}
</script>