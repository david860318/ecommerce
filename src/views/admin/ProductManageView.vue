<template>
  <div class="d-flex flex-column gap-3.5 gap-md-4 w-100" style="min-width: 0;">
    <!-- 頂部標題與新增按鈕 -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h1 class="h4 fw-bold text-dark font-serif mb-1">商品與即時庫存管理</h1>
        <p class="small text-muted mb-0">維護全館單品、多圖相簿上傳、首頁推薦標記（熱門排行/當季新品）、SKU 規格與庫存</p>
      </div>
      <button class="btn btn-primary btn-sm rounded-pill px-3.5 fw-bold shadow-2xs" @click="openCreateProductModal">
        + 上架新商品
      </button>
    </div>

    <!-- 商品管理資料表格 (RWD 滾動保護) -->
    <div class="card-korean bg-white shadow-xs p-3.5 p-md-4 border">
      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0 font-sans">
          <thead class="table-light">
            <tr class="text-secondary text-nowrap" style="font-size: 11px;">
              <th style="min-width: 70px;">商品縮圖</th>
              <th style="min-width: 170px;">商品名稱 / 分類</th>
              <th style="min-width: 100px;">基礎售價</th>
              <th style="min-width: 150px;">首頁輪播下方推薦展示</th>
              <th style="min-width: 150px;">規格與即時庫存 (SKUs)</th>
              <th style="min-width: 80px;">累計銷量</th>
              <th class="text-end text-nowrap" style="min-width: 130px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prod in productStore.products" :key="prod.id">
              <td>
                <div class="rounded-3 overflow-hidden border position-relative" style="width: 48px; height: 60px; background-color: #f5f2ed;">
                  <img :src="prod.image" class="w-100 h-100 object-fit-cover" />
                  <span v-if="(prod.images || []).length > 1" class="position-absolute bottom-0 end-0 badge bg-dark text-white font-monospace" style="font-size: 8px; padding: 2px 4px; border-radius: 3px 0 0 0;">
                    +{{ prod.images.length }}
                  </span>
                </div>
              </td>
              <td>
                <strong class="text-dark d-block text-truncate" style="max-width: 200px;">{{ prod.name }}</strong>
                <span class="badge bg-light text-muted border font-monospace" style="font-size: 9.5px;">{{ prod.category }}</span>
              </td>
              <td class="font-monospace fw-bold text-dark text-nowrap">
                NT$ {{ prod.basePrice.toLocaleString() }}
              </td>
              <!-- 首頁推播標籤快速開關 -->
              <td>
                <div class="d-flex flex-column gap-1">
                  <button
                    type="button"
                    class="btn btn-sm rounded-pill py-0.5 px-2 text-start font-monospace d-inline-flex align-items-center gap-1.5"
                    :class="prod.isHotRanking ? 'btn-danger-subtle text-danger border border-danger-subtle' : 'btn-light text-muted border'"
                    style="font-size: 10px; width: fit-content;"
                    @click="toggleFeatured(prod, 'isHotRanking')"
                    title="點擊切換是否放入首頁「熱門排行」"
                  >
                    <span>{{ prod.isHotRanking ? '★ 熱門排行: 開' : '☆ 熱門排行: 關' }}</span>
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm rounded-pill py-0.5 px-2 text-start font-monospace d-inline-flex align-items-center gap-1.5"
                    :class="prod.isSeasonalNew ? 'btn-success-subtle text-success border border-success-subtle' : 'btn-light text-muted border'"
                    style="font-size: 10px; width: fit-content;"
                    @click="toggleFeatured(prod, 'isSeasonalNew')"
                    title="點擊切換是否放入首頁「當季新品」"
                  >
                    <span>{{ prod.isSeasonalNew ? '● 當季新品: 開' : '○ 當季新品: 關' }}</span>
                  </button>
                </div>
              </td>
              <td>
                <div class="d-flex flex-wrap gap-1" style="max-width: 220px;">
                  <span
                    v-for="sku in prod.skus"
                    :key="sku.skuId"
                    class="badge rounded-pill font-monospace"
                    :class="sku.stock <= 5 ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-secondary-subtle text-secondary'"
                    style="font-size: 9px;"
                  >
                    {{ sku.color }}/{{ sku.size }}: {{ sku.stock }}件
                  </span>
                </div>
              </td>
              <td class="font-monospace text-muted text-nowrap">
                {{ prod.salesCount || 0 }} 件
              </td>
              <td class="text-end text-nowrap">
                <div class="d-flex justify-content-end gap-1.5">
                  <button class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="openEditProductModal(prod)">
                    編輯
                  </button>
                  <button class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="handleDeleteProduct(prod)">
                    下架
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 彈窗：新增/編輯商品 Modal (多圖上傳與設定) -->
    <Teleport to="body">
      <div v-if="showModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" style="max-width: 720px; margin: 0.75rem auto;">
          <div class="modal-content rounded-4 border-0 p-3.5 p-sm-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-5 fw-bold text-dark font-serif">
                {{ isEditing ? '編輯商品資料與首頁推薦' : '上架新商品' }}
              </h3>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>

            <div class="modal-body small px-1 py-3">
              <form @submit.prevent="saveProduct" class="d-flex flex-column gap-3.5">
                
                <!-- 1. 基本資訊 -->
                <div class="row g-2.5">
                  <div class="col-12 col-sm-8">
                    <label class="form-label text-secondary mb-1">商品名稱 *</label>
                    <input v-model="productForm.name" required type="text" class="form-control form-control-sm" placeholder="例如：法式優雅落肩針織衫" />
                  </div>
                  <div class="col-12 col-sm-4">
                    <label class="form-label text-secondary mb-1">品類分類 *</label>
                    <input v-model="productForm.category" required type="text" class="form-control form-control-sm" placeholder="如：Top 上衣" />
                  </div>
                </div>

                <div class="row g-2.5">
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">基礎售價 (NT$) *</label>
                    <input v-model.number="productForm.basePrice" required type="number" min="0" class="form-control form-control-sm font-monospace" />
                  </div>
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">劃線原價 (選填)</label>
                    <input v-model.number="productForm.originalPrice" type="number" min="0" class="form-control form-control-sm font-monospace" />
                  </div>
                </div>

                <!-- 2. 首頁輪播下方推薦專區設定 -->
                <div class="card-korean p-3 bg-light border">
                  <label class="form-label fw-bold text-dark mb-1.5">首頁輪播下方推薦專區設定</label>
                  <div class="row g-2 align-items-center">
                    <div class="col-12 col-sm-5">
                      <div class="form-check">
                        <input v-model="productForm.isHotRanking" class="form-check-input" type="checkbox" id="checkHot" />
                        <label class="form-check-label text-dark fw-medium" for="checkHot">
                          放入「熱門排行」推薦
                        </label>
                      </div>
                    </div>
                    <div class="col-12 col-sm-5">
                      <div class="form-check">
                        <input v-model="productForm.isSeasonalNew" class="form-check-input" type="checkbox" id="checkNew" />
                        <label class="form-check-label text-dark fw-medium" for="checkNew">
                          放入「當季新品」推薦
                        </label>
                      </div>
                    </div>
                    <div class="col-12 col-sm-2">
                      <input v-model.number="productForm.featuredOrder" type="number" min="1" class="form-control form-control-sm font-monospace" title="排序越小越前面" placeholder="順序" />
                    </div>
                  </div>
                </div>

                <!-- 3. ★ 多圖本機上傳與相簿管理專區 ★ -->
                <div class="border rounded-3 p-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                    <div>
                      <strong class="text-dark">商品多圖相簿（第一張自動作為主封面圖）*</strong>
                      <div class="text-muted font-monospace" style="font-size: 10.5px;">
                        支援由手機/電腦選取多張圖批次上傳，點擊「設為主圖」可隨時調整封面
                      </div>
                    </div>
                    <span class="badge rounded-pill bg-secondary font-monospace" style="font-size: 10px;">
                      已加入 {{ productForm.images.length }} 張圖片
                    </span>
                  </div>

                  <!-- 本機多圖選取按鈕與輸入框 -->
                  <div class="d-flex flex-column gap-2 mb-3 bg-white p-2.5 rounded-2 border">
                    <div>
                      <label class="form-label text-secondary mb-1 fw-semibold">從電腦/手機選取照片上傳（可複選多張）：</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        class="form-control form-control-sm"
                        @change="handleMultipleImageUpload"
                      />
                    </div>
                    
                    <div class="d-flex align-items-center gap-2 pt-1 border-top">
                      <input
                        v-model="customUrlInput"
                        type="url"
                        class="form-control form-control-sm font-monospace"
                        placeholder="或輸入外部圖片網址 (URL)..."
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary btn-sm text-nowrap rounded-pill px-3"
                        @click="addUrlToImages"
                      >
                        + 加入網址
                      </button>
                    </div>
                  </div>

                  <!-- 縮圖排列預覽網格 -->
                  <div v-if="productForm.images.length > 0" class="row g-2.5">
                    <div
                      v-for="(imgSrc, imgIdx) in productForm.images"
                      :key="imgIdx"
                      class="col-6 col-sm-4 col-md-3"
                    >
                      <div class="gallery-thumb-item rounded-3 overflow-hidden border bg-white p-1 position-relative shadow-2xs">
                        <div class="ratio ratio-1x1 rounded-2 overflow-hidden bg-light mb-1.5">
                          <img :src="imgSrc" class="object-fit-cover w-100 h-100" />
                        </div>
                        
                        <!-- 主圖（Cover）標章 -->
                        <span
                          v-if="imgIdx === 0"
                          class="position-absolute top-0 start-0 m-2 badge bg-primary text-white font-monospace"
                          style="font-size: 9px;"
                        >
                          ★ 主封面
                        </span>

                        <!-- 操作按鈕：設為主圖 / 刪除 -->
                        <div class="d-flex justify-content-between align-items-center gap-1">
                          <button
                            v-if="imgIdx !== 0"
                            type="button"
                            class="btn btn-light btn-sm p-0 px-1.5 text-secondary border rounded-pill"
                            style="font-size: 10px;"
                            @click="setAsMainImage(imgIdx)"
                            title="設定為列表主圖"
                          >
                            設為主圖
                          </button>
                          <span v-else class="text-success font-monospace" style="font-size: 10px; padding-left: 2px;">
                            ✓ 列表封面
                          </span>

                          <button
                            type="button"
                            class="btn btn-link btn-sm text-danger p-0 text-decoration-none ms-auto"
                            style="font-size: 11px;"
                            @click="removeImage(imgIdx)"
                            title="刪除這張圖片"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-3 text-danger small">
                    尚未上傳任何商品圖片，請至少選擇或輸入一張圖片！
                  </div>
                </div>

                <!-- 4. 商品簡介描述 -->
                <div>
                  <label class="form-label text-secondary mb-1">商品簡介描述</label>
                  <textarea v-model="productForm.description" rows="2" class="form-control form-control-sm" placeholder="請輸入商品材質、產地與穿搭版型描述"></textarea>
                </div>

                <!-- 5. 規格庫存表格 -->
                <div class="border rounded-3 p-2.5 p-sm-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong class="text-dark">SKU 規格與庫存矩陣</strong>
                    <button type="button" class="btn btn-outline-primary btn-sm rounded-pill py-0.5 px-2.5 font-monospace" style="font-size: 11px;" @click="addSkuRow">
                      + 增加規格
                    </button>
                  </div>

                  <div class="d-flex flex-column gap-2">
                    <div v-for="(sku, sIdx) in productForm.skus" :key="sIdx" class="d-flex align-items-center gap-2 flex-wrap bg-white p-2 rounded-2 border">
                      <div style="flex: 1; min-width: 80px;">
                        <input v-model="sku.color" required type="text" class="form-control form-control-sm" placeholder="顏色 (如: 杏色)" />
                      </div>
                      <div style="flex: 1; min-width: 60px;">
                        <input v-model="sku.size" required type="text" class="form-control form-control-sm" placeholder="尺寸 (如: F)" />
                      </div>
                      <div style="flex: 1; min-width: 80px;">
                        <input v-model.number="sku.stock" required type="number" min="0" class="form-control form-control-sm font-monospace" placeholder="庫存件數" />
                      </div>
                      <button type="button" class="btn btn-link btn-sm text-danger p-0" @click="productForm.skus.splice(sIdx, 1)">×</button>
                    </div>
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold">
                    {{ isEditing ? '儲存商品與推薦設定' : '確認上架商品' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useProductStore } from '../../stores/productStore'
import { useAdminStore } from '../../stores/adminStore'

const productStore = useProductStore()
const adminStore = useAdminStore()

const showModal = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)
const customUrlInput = ref('')

const productForm = reactive({
  name: '',
  category: 'Top 上衣',
  basePrice: 1000,
  originalPrice: 1200,
  image: '',
  images: [],
  description: '',
  isHotRanking: true,
  isSeasonalNew: false,
  featuredOrder: 1,
  skus: []
})

// 多圖本機檔案批次上傳處理
const handleMultipleImageUpload = (e) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  files.forEach((file) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Url = event.target.result
      productForm.images.push(base64Url)
      // 若尚未有主圖，自動將第一張設為主圖
      if (!productForm.image) {
        productForm.image = base64Url
      }
    }
    reader.readAsDataURL(file)
  })

  // 重置 input 以便重複選擇同檔名檔案
  e.target.value = ''
}

// 支援加入網址圖片
const addUrlToImages = () => {
  if (!customUrlInput.value.trim()) return
  productForm.images.push(customUrlInput.value.trim())
  if (!productForm.image) {
    productForm.image = customUrlInput.value.trim()
  }
  customUrlInput.value = ''
}

// 將指定索引設為主圖（移到最前）
const setAsMainImage = (index) => {
  const selected = productForm.images.splice(index, 1)[0]
  productForm.images.unshift(selected)
  productForm.image = selected
}

// 移除單張圖片
const removeImage = (index) => {
  productForm.images.splice(index, 1)
  productForm.image = productForm.images[0] || ''
}

const openCreateProductModal = () => {
  isEditing.value = false
  currentEditId.value = null
  customUrlInput.value = ''
  productForm.name = ''
  productForm.category = 'Top 上衣'
  productForm.basePrice = 1280
  productForm.originalPrice = 1580
  productForm.image = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
  productForm.images = [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80'
  ]
  productForm.description = '首爾東大門嚴選，親膚柔軟羊毛混紡，休閒與正式兼具。'
  productForm.isHotRanking = true
  productForm.isSeasonalNew = true
  productForm.featuredOrder = productStore.products.length + 1
  productForm.skus = [
    { skuId: 'SKU-' + Date.now(), color: '奶油杏', size: 'F', stock: 15, price: 1280 }
  ]
  showModal.value = true
}

const openEditProductModal = (prod) => {
  isEditing.value = true
  currentEditId.value = prod.id
  customUrlInput.value = ''
  productForm.name = prod.name
  productForm.category = prod.category
  productForm.basePrice = prod.basePrice
  productForm.originalPrice = prod.originalPrice || 0
  productForm.image = prod.image
  // 若原本只有單圖，包裝為陣列
  productForm.images = prod.images && prod.images.length > 0 ? [...prod.images] : (prod.image ? [prod.image] : [])
  productForm.description = prod.description || ''
  productForm.isHotRanking = Boolean(prod.isHotRanking)
  productForm.isSeasonalNew = Boolean(prod.isSeasonalNew)
  productForm.featuredOrder = prod.featuredOrder || 1
  productForm.skus = JSON.parse(JSON.stringify(prod.skus || []))
  showModal.value = true
}

const toggleFeatured = (prod, field) => {
  productStore.toggleProductFeatured(prod.id, field)
  const label = field === 'isHotRanking' ? '熱門排行' : '當季新品'
  adminStore.addAuditLog('切換首頁精選商品', `商品【${prod.name}】首頁【${label}】狀態已調整`)
}

const addSkuRow = () => {
  productForm.skus.push({
    skuId: 'SKU-' + Date.now() + Math.floor(Math.random() * 100),
    color: '曜石黑',
    size: 'F',
    stock: 10,
    price: productForm.basePrice
  })
}

const saveProduct = () => {
  if (productForm.images.length === 0) {
    alert('請至少上傳或新增一張商品圖片！')
    return
  }

  // 確保主圖等於第一張圖
  productForm.image = productForm.images[0]

  if (isEditing.value && currentEditId.value) {
    const idx = productStore.products.findIndex(p => p.id === currentEditId.value)
    if (idx !== -1) {
      productStore.products[idx] = {
        ...productStore.products[idx],
        ...productForm
      }
      adminStore.addAuditLog('修改商品資料', `更新商品 ID #${currentEditId.value}【${productForm.name}】，共 ${productForm.images.length} 張圖片`)
      alert('商品資料與圖片已儲存！')
    }
  } else {
    const nextId = Math.max(0, ...productStore.products.map(p => p.id)) + 1
    const newProduct = {
      id: nextId,
      ...productForm,
      salesCount: 0
    }
    productStore.products.unshift(newProduct)
    adminStore.addAuditLog('上架新商品', `成功上架【${newProduct.name}】，共 ${newProduct.images.length} 張圖片`)
    alert('新商品已成功發布上架！')
  }
  showModal.value = false
}

const handleDeleteProduct = (prod) => {
  if (confirm(`確定要下架商品【${prod.name}】嗎？`)) {
    const idx = productStore.products.findIndex(p => p.id === prod.id)
    if (idx !== -1) {
      productStore.products.splice(idx, 1)
      adminStore.addAuditLog('下架商品', `下架商品 ID #${prod.id}【${prod.name}】`)
      alert('商品已下架！')
    }
  }
}
</script>

<style scoped>
.gallery-thumb-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.gallery-thumb-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>