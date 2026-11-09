<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal fade show d-block modal-backdrop-custom"
      tabindex="-1"
      style="z-index: 1070;"
    >
      <div class="modal-dialog modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
          <div class="modal-header border-0 pb-0">
            <div>
              <span class="badge bg-primary-subtle text-primary font-monospace mb-1" style="font-size: 10px;">
                VERIFIED PURCHASE REVIEW
              </span>
              <h3 class="modal-title fs-6 fw-bold text-dark">商品評價與穿搭曬圖</h3>
            </div>
            <button type="button" class="btn-close" @click="closeModal" aria-label="關閉"></button>
          </div>

          <div class="modal-body small">
            <div class="d-flex align-items-center gap-3 bg-light p-2.5 rounded-3 mb-3">
              <img :src="item?.image || product?.image" class="rounded object-fit-cover" style="width: 48px; height: 64px;" />
              <div class="min-w-0">
                <div class="fw-bold text-dark text-truncate">{{ product?.name || item?.name }}</div>
                <div class="text-muted font-monospace" style="font-size: 11px;">訂單編號：{{ orderId }}</div>
              </div>
            </div>

            <form @submit.prevent="submitReview" class="d-flex flex-column gap-3">
              <div>
                <label class="form-label text-dark fw-semibold mb-1">
                  總體評分 *：<span class="text-primary fw-bold">{{ ratingTexts[hoverRating || currentRating] }}</span>
                </label>
                <div class="d-flex align-items-center gap-1.5 py-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="btn btn-link p-0 text-decoration-none border-0"
                    @mouseenter="hoverRating = star"
                    @mouseleave="hoverRating = 0"
                    @click="currentRating = star"
                  >
                    <Star
                      style="width: 26px; height: 26px; cursor: pointer; transition: transform 0.15s ease;"
                      :class="(hoverRating || currentRating) >= star ? 'text-warning fill-warning' : 'text-secondary opacity-25'"
                      :fill="(hoverRating || currentRating) >= star ? '#ffc107' : 'none'"
                    />
                  </button>
                  <span class="ms-2 font-monospace fw-bold fs-6 text-dark">{{ hoverRating || currentRating }}.0</span>
                </div>
              </div>

              <div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label class="form-label text-dark fw-semibold mb-0">心得描述 *</label>
                  <span class="text-muted font-monospace" style="font-size: 11px;">{{ content.length }}/300 字</span>
                </div>
                <textarea
                  v-model="content"
                  required
                  rows="3"
                  maxlength="300"
                  class="form-control form-control-sm rounded-3"
                  placeholder="穿起來的版型、材質觸感如何？分享給其他喜愛韓系穿搭的朋友吧！"
                ></textarea>
              </div>

              <div>
                <div class="d-flex justify-content-between align-items-center mb-1.5">
                  <label class="form-label text-dark fw-semibold mb-0">實穿曬圖（最多 5 張）</label>
                  <span class="text-muted font-monospace" style="font-size: 11px;">{{ uploadedImages.length }}/5</span>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <div
                    v-for="(img, idx) in uploadedImages"
                    :key="idx"
                    class="position-relative rounded-3 overflow-hidden border"
                    style="width: 68px; height: 68px;"
                  >
                    <img :src="img" class="w-100 h-100 object-fit-cover" />
                    <button
                      type="button"
                      class="position-absolute top-0 end-0 btn btn-dark p-0 rounded-circle d-flex align-items-center justify-content-center m-1"
                      style="width: 18px; height: 18px; opacity: 0.8;"
                      @click="removeImage(idx)"
                    >
                      <X style="width: 12px; height: 12px;" />
                    </button>
                  </div>

                  <label
                    v-if="uploadedImages.length < 5"
                    class="d-flex flex-column align-items-center justify-content-center border border-dashed rounded-3 bg-light text-muted cursor-pointer hover-bg"
                    style="width: 68px; height: 68px;"
                  >
                    <Camera style="width: 20px; height: 20px;" class="mb-1 text-secondary" />
                    <span style="font-size: 9.5px;">+上傳</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      class="d-none"
                      @change="handleFileUpload"
                    />
                  </label>
                </div>
              </div>

              <div class="pt-2">
                <button
                  type="submit"
                  class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold"
                  :disabled="!content.trim() || isSubmitting"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                  送出真實商品評價
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { Star, Camera, X } from 'lucide-vue-next'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'

const props = defineProps({
  isOpen: Boolean,
  orderId: String,
  productId: Number,
  product: Object,
  item: Object
})

const emit = defineEmits(['close', 'submitted'])

const productStore = useProductStore()
const authStore = useAuthStore()

const currentRating = ref(5)
const hoverRating = ref(0)
const content = ref('')
const uploadedImages = ref([])
const isSubmitting = ref(false)

const ratingTexts = {
  1: '非常不滿意',
  2: '不太理想',
  3: '符合預期',
  4: '滿意推薦',
  5: '非常完美！值得回購'
}

const handleFileUpload = (e) => {
  const files = Array.from(e.target.files)
  if (!files.length) return
  const remainingSlots = 5 - uploadedImages.value.length
  const selectedFiles = files.slice(0, remainingSlots)

  selectedFiles.forEach((file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`檔案「${file.name}」超過 5MB 上限！`)
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (uploadedImages.value.length < 5) {
        uploadedImages.value.push(event.target.result)
      }
    }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

const removeImage = (idx) => {
  uploadedImages.value.splice(idx, 1)
}

const closeModal = () => {
  content.value = ''
  uploadedImages.value = []
  currentRating.value = 5
  emit('close')
}

const submitReview = () => {
  if (!content.value.trim()) return
  isSubmitting.value = true
  const res = productStore.addReview({
    productId: props.productId || props.product?.id,
    orderId: props.orderId,
    userName: authStore.user?.name || '會員',
    userPhone: authStore.user?.phone || '',
    rating: currentRating.value,
    content: content.value,
    images: uploadedImages.value
  })
  isSubmitting.value = false
  alert(res.message)
  emit('submitted')
  closeModal()
}
</script>

<style scoped>
.hover-bg:hover {
  background-color: #ede8e1 !important;
}
.cursor-pointer {
  cursor: pointer;
}
</style>