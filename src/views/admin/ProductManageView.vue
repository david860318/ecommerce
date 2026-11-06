<template>
  <div class="d-flex flex-column gap-4">
    <!-- 頂部標題與主功能操作列 -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h1 class="h4 fw-bold text-dark font-serif mb-1">AD-02 商品與規格管理 (PIM & WMS)</h1>
        <p class="small text-muted mb-0">多維度 SKU 矩陣生成、富文本圖文編輯、WebP 圖片壓縮與批次維護工具</p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-2xs fw-bold" @click="openCreateModal">
          + 新增商品 (SPU/SKU)
        </button>
      </div>
    </div>

    <!-- 批次操作工具列 (當有選取商品時展開) -->
    <div class="card-korean p-3 bg-white shadow-xs border-primary border-opacity-25 d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div class="d-flex align-items-center gap-2 small">
        <input
          type="checkbox"
          class="form-check-input mt-0"
          :checked="isAllSelected"
          @change="toggleSelectAll"
        />
        <span class="text-secondary">已選取 <strong>{{ selectedIds.length }}</strong> 件商品</span>
      </div>

      <div class="d-flex align-items-center gap-2 flex-wrap">
        <!-- 批次上下架 -->
        <div class="btn-group btn-group-sm">
          <button
            class="btn btn-outline-success"
            :disabled="selectedIds.length === 0"
            @click="handleBatchStatus('ACTIVE')"
          >
            一鍵批次上架
          </button>
          <button
            class="btn btn-outline-secondary"
            :disabled="selectedIds.length === 0"
            @click="handleBatchStatus('INACTIVE')"
          >
            一鍵批次下架
          </button>
        </div>

        <!-- 批次調價 -->
        <button
          class="btn btn-outline-dark btn-sm rounded-pill px-3"
          :disabled="selectedIds.length === 0"
          @click="openBatchPriceModal"
        >
          批次調整價格
        </button>

        <!-- 批次調庫存 -->
        <button
          class="btn btn-outline-dark btn-sm rounded-pill px-3"
          :disabled="selectedIds.length === 0"
          @click="openBatchStockModal"
        >
          批次調整庫存
        </button>
      </div>
    </div>

    <!-- 商品資料表格 -->
    <div class="card-korean bg-white shadow-xs overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0 font-sans">
          <thead class="table-light">
            <tr class="text-secondary text-nowrap" style="font-size: 11px;">
              <th style="width: 40px;"></th>
              <th style="min-width: 240px;">商品名稱 / ID</th>
              <th style="min-width: 100px;">分類</th>
              <th style="min-width: 110px;">售價 / 原價</th>
              <th style="min-width: 240px;">SKU 規格矩陣與各規格庫存</th>
              <th style="min-width: 110px;">上架狀態</th>
              <th class="text-end text-nowrap" style="min-width: 160px;">管理動作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in productStore.products" :key="product.id">
              <td>
                <input
                  type="checkbox"
                  class="form-check-input mt-0"
                  :checked="selectedIds.includes(product.id)"
                  @change="toggleSelectOne(product.id)"
                />
              </td>
              <td>
                <div class="d-flex align-items-center gap-2.5">
                  <img :src="product.image" class="rounded object-fit-cover flex-shrink-0" style="width: 44px; height: 58px;" />
                  <div class="min-w-0">
                    <strong class="text-dark d-block text-truncate" style="max-width: 200px;">{{ product.name }}</strong>
                    <span class="text-muted font-monospace" style="font-size: 10px;">ID: #{{ product.id }}</span>
                  </div>
                </div>
              </td>
              <td><span class="badge bg-light text-dark border">{{ product.category }}</span></td>
              <td>
                <span class="fw-bold font-monospace text-dark">NT$ {{ product.basePrice }}</span>
                <span v-if="product.originalPrice" class="text-muted text-decoration-line-through font-monospace ms-1" style="font-size: 10px;">
                  {{ product.originalPrice }}
                </span>
              </td>
              <!-- SKU 矩陣清單 -->
              <td>
                <div class="d-flex flex-wrap gap-1">
                  <span
                    v-for="sku in product.skus"
                    :key="sku.skuId"
                    class="badge font-monospace py-1 px-2 border"
                    :class="sku.stock <= 5 ? 'bg-danger-subtle text-danger border-danger-subtle' : 'bg-light text-dark'"
                    style="font-size: 10.5px;"
                  >
                    {{ sku.color }}/{{ sku.size }}: {{ sku.stock }}件 (NT${{ sku.price }})
                  </span>
                </div>
              </td>
              <td>
                <span class="badge rounded-pill" :class="product.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                  {{ product.status === 'ACTIVE' ? '● 上架中' : '○ 已下架' }}
                </span>
              </td>
              <td class="text-end text-nowrap">
                <div class="d-flex justify-content-end gap-1.5">
                  <button class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="openEditModal(product)">
                    編輯商品
                  </button>
                  <button class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="handleDeleteProduct(product)">
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== 1. 商品新增 / 編輯彈窗 Modal (含富文本、WebP壓縮、笛卡兒積生成) ==================== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable" style="max-width: 900px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-5 fw-bold text-dark font-serif">
                {{ isEditing ? '編輯商品與規格 (SPU/SKU)' : '新增韓系商品與自動規格矩陣' }}
              </h3>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>

            <div class="modal-body small">
              <form @submit.prevent="saveProduct" class="d-flex flex-column gap-3.5">
                <!-- 基本設定 -->
                <div class="row g-2">
                  <div class="col-8">
                    <label class="form-label text-secondary mb-1">商品名稱 *</label>
                    <input v-model="form.name" required type="text" class="form-control form-control-sm rounded-3" placeholder="例如：法式極簡微抓皺雪紡襯衫" />
                  </div>
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">商品分類 *</label>
                    <select v-model="form.category" class="form-select form-select-sm rounded-3">
                      <option value="Top 上衣">Top 上衣</option>
                      <option value="Outer 外套">Outer 外套</option>
                      <option value="Bottom 下身">Bottom 下身</option>
                      <option value="Dress 裙裝">Dress 裙裝</option>
                    </select>
                  </div>
                </div>

                <div class="row g-2">
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">基礎售價 (NT$) *</label>
                    <input v-model.number="form.basePrice" required type="number" min="1" class="form-control form-control-sm font-monospace rounded-3" />
                  </div>
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">原價 (NT$)</label>
                    <input v-model.number="form.originalPrice" type="number" min="1" class="form-control form-control-sm font-monospace rounded-3" />
                  </div>
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">初始上架狀態</label>
                    <select v-model="form.status" class="form-select form-select-sm rounded-3 font-monospace">
                      <option value="ACTIVE">立即上架 (ACTIVE)</option>
                      <option value="INACTIVE">暫存下架 (INACTIVE)</option>
                    </select>
                  </div>
                </div>

                <!-- 圖片上傳與自動 WebP 壓縮轉換 (AD-02 AC2) -->
                <div>
                  <label class="form-label text-secondary mb-1">
                    商品圖片（支援自動壓縮轉換 WebP）*
                  </label>
                  <div class="d-flex gap-3 align-items-center">
                    <div class="border rounded-3 overflow-hidden bg-light flex-shrink-0" style="width: 80px; height: 106px;">
                      <img v-if="form.image" :src="form.image" class="w-100 h-100 object-fit-cover" />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted" style="font-size: 10px;">無圖</div>
                    </div>
                    <div class="flex-grow-1">
                      <input
                        type="file"
                        accept="image/*"
                        class="form-control form-control-sm mb-1 rounded-3"
                        @change="handleImageCompressAndConvert"
                      />
                      <div class="text-muted" style="font-size: 10.5px;">
                        選擇任何 JPG/PNG 照片，瀏覽器將<strong>即時壓縮並轉為輕量 WebP 格式</strong>輸出。亦可手動輸入外部圖片網址：
                      </div>
                      <input v-model="form.image" type="url" class="form-control form-control-sm font-monospace mt-1 rounded-3" placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <!-- 富文本編輯器 (AD-02 AC2) -->
                <div>
                  <label class="form-label text-secondary mb-1">富文本圖文商品描述 (HTML)</label>
                  <!-- 編輯工具列 -->
                  <div class="btn-toolbar p-1 bg-light border border-bottom-0 rounded-top gap-1" role="toolbar">
                    <button type="button" class="btn btn-sm btn-white border px-2 py-0 fw-bold" @click="formatHtml('<b>', '</b>')">B 粗體</button>
                    <button type="button" class="btn btn-sm btn-white border px-2 py-0 fst-italic" @click="formatHtml('<i>', '</i>')">I 斜體</button>
                    <button type="button" class="btn btn-sm btn-white border px-2 py-0" @click="formatHtml('<h3>', '</h3>')">標題</button>
                    <button type="button" class="btn btn-sm btn-white border px-2 py-0" @click="formatHtml('<ul><li>', '</li></ul>')">列表</button>
                    <button type="button" class="btn btn-sm btn-white border px-2 py-0" @click="insertDivider">分隔線</button>
                    <button type="button" class="btn btn-sm btn-white border px-2 py-0 text-muted ms-auto" @click="form.descriptionHtml = ''">清空</button>
                  </div>
                  <textarea
                    id="htmlEditor"
                    v-model="form.descriptionHtml"
                    rows="4"
                    class="form-control form-control-sm font-monospace rounded-0 rounded-bottom"
                    placeholder="<p>請輸入商品詳細圖文 HTML 碼或使用上方工具快捷鍵...</p>"
                  ></textarea>

                  <!-- 視覺化即時預覽 -->
                  <div class="mt-2 p-2 border rounded-3 bg-light bg-opacity-50">
                    <span class="text-muted font-monospace d-block mb-1" style="font-size: 10px;">WYSIWYG 預覽效果：</span>
                    <div class="p-2 bg-white rounded border small" v-html="form.descriptionHtml"></div>
                  </div>
                </div>

                <!-- 規格選項設定與笛卡兒積生成 SKU 列表 (AD-02 AC1) -->
                <div class="border rounded-3 p-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong class="text-dark">多規格笛卡兒積生成 SKU 矩陣</strong>
                    <button type="button" class="btn btn-primary btn-sm rounded-pill py-0.5 px-3 font-monospace" style="font-size: 11px;" @click="generateCartesianSkus">
                      ⚡ 依據規格自動生成 SKU 列表
                    </button>
                  </div>

                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <label class="form-label text-muted mb-0" style="font-size: 10.5px;">顏色規格選項（以逗號或空格隔開）：</label>
                      <input v-model="specInput.colors" type="text" class="form-control form-control-sm" placeholder="奶油杏, 淺燕麥, 霧白" />
                    </div>
                    <div class="col-6">
                      <label class="form-label text-muted mb-0" style="font-size: 10.5px;">尺寸規格選項（以逗號或空格隔開）：</label>
                      <input v-model="specInput.sizes" type="text" class="form-control form-control-sm" placeholder="S, M, FREE" />
                    </div>
                  </div>

                  <!-- 批量填寫 SKU 價格/庫存工具 -->
                  <div class="d-flex align-items-center gap-2 mb-2 p-2 bg-white rounded border">
                    <span class="text-muted" style="font-size: 11px;">批次套用至全規格：</span>
                    <input v-model.number="bulkFill.price" type="number" class="form-control form-control-sm font-monospace" style="width: 100px;" placeholder="售價" />
                    <input v-model.number="bulkFill.stock" type="number" class="form-control form-control-sm font-monospace" style="width: 100px;" placeholder="庫存" />
                    <button type="button" class="btn btn-outline-secondary btn-sm py-0 px-2" style="font-size: 11px;" @click="applyBulkSkuValues">
                      套用全部
                    </button>
                  </div>

                  <!-- SKU 列表明細表單 -->
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered bg-white align-middle mb-0 font-monospace" style="font-size: 11.5px;">
                      <thead class="table-light">
                        <tr>
                          <th>SKU 代碼</th>
                          <th>顏色</th>
                          <th>尺寸</th>
                          <th style="width: 120px;">規格售價 (NT$)</th>
                          <th style="width: 110px;">庫存件數</th>
                          <th style="width: 50px;">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(sku, sIdx) in form.skus" :key="sIdx">
                          <td><input v-model="sku.skuId" class="form-control form-control-sm p-1 font-monospace" /></td>
                          <td><input v-model="sku.color" class="form-control form-control-sm p-1" /></td>
                          <td><input v-model="sku.size" class="form-control form-control-sm p-1" /></td>
                          <td><input v-model.number="sku.price" type="number" class="form-control form-control-sm p-1 font-monospace" /></td>
                          <td><input v-model.number="sku.stock" type="number" min="0" class="form-control form-control-sm p-1 font-monospace" /></td>
                          <td class="text-center">
                            <button type="button" class="btn btn-link btn-sm text-danger p-0" @click="form.skus.splice(sIdx, 1)">×</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold">
                    {{ isEditing ? '儲存商品修改並同步前台' : '確認建立商品並上架' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== 2. 批次調價 Modal ==================== -->
    <Teleport to="body">
      <div v-if="showBatchPriceModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1075;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 380px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <h3 class="fs-6 fw-bold mb-3">批次調整商品售價 (已選 {{ selectedIds.length }} 件)</h3>
            <div class="mb-3">
              <label class="form-label small text-secondary">調價方式：</label>
              <select v-model="batchPriceForm.mode" class="form-select form-select-sm mb-2">
                <option value="PERCENT">按折數調整（例如：90 代表 9 折）</option>
                <option value="FIXED">固定增減金額（例如：-100 代表現降 100）</option>
              </select>
              <input v-model.number="batchPriceForm.value" type="number" class="form-control form-control-sm font-monospace" placeholder="輸入數值" />
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-light btn-sm w-50 rounded-pill border" @click="showBatchPriceModal = false">取消</button>
              <button class="btn btn-primary btn-sm w-50 rounded-pill fw-bold" @click="executeBatchPrice">確認調價</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== 3. 批次調庫存 Modal ==================== -->
    <Teleport to="body">
      <div v-if="showBatchStockModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5); z-index: 1075;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 380px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <h3 class="fs-6 fw-bold mb-3">批次調整規格庫存 (已選 {{ selectedIds.length }} 件)</h3>
            <div class="mb-3">
              <label class="form-label small text-secondary">庫存異動模式：</label>
              <select v-model="batchStockForm.mode" class="form-select form-select-sm mb-2">
                <option value="ADD">在現有基礎上增減（如: +10 或 -5）</option>
                <option value="SET">統一設定為固定值（如: 全部重設為 20）</option>
              </select>
              <input v-model.number="batchStockForm.value" type="number" class="form-control form-control-sm font-monospace" placeholder="輸入庫存數量" />
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-light btn-sm w-50 rounded-pill border" @click="showBatchStockModal = false">取消</button>
              <button class="btn btn-primary btn-sm w-50 rounded-pill fw-bold" @click="executeBatchStock">確認調整</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useProductStore } from '../../stores/productStore'
import { useAdminStore } from '../../stores/adminStore'

const productStore = useProductStore()
const adminStore = useAdminStore()

// 選取勾選狀態
const selectedIds = ref([])
const isAllSelected = computed(() => {
  return productStore.products.length > 0 && selectedIds.value.length === productStore.products.length
})

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedIds.value = productStore.products.map((p) => p.id)
  } else {
    selectedIds.value = []
  }
}

const toggleSelectOne = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

// 彈窗狀態與表單
const showModal = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)

const form = reactive({
  name: '',
  category: 'Top 上衣',
  basePrice: 1280,
  originalPrice: 1580,
  status: 'ACTIVE',
  image: '',
  descriptionHtml: '',
  description: '',
  skus: []
})

const specInput = reactive({
  colors: '奶油杏, 淺燕麥',
  sizes: 'S, M, FREE'
})

const bulkFill = reactive({
  price: 1280,
  stock: 20
})

// 笛卡兒積生成 SKU (AD-02 AC1)
const generateCartesianSkus = () => {
  const colors = specInput.colors.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean)
  const sizes = specInput.sizes.split(/[,，\s]+/).map((s) => s.trim()).filter(Boolean)

  if (colors.length === 0 || sizes.length === 0) {
    alert('請至少填寫一個顏色與一個尺寸！')
    return
  }

  const generated = []
  colors.forEach((c) => {
    sizes.forEach((s) => {
      generated.push({
        skuId: `SKU-${Date.now().toString().slice(-4)}-${c}-${s}`,
        color: c,
        size: s,
        price: form.basePrice,
        stock: 15
      })
    })
  })
  form.skus = generated
}

const applyBulkSkuValues = () => {
  form.skus.forEach((s) => {
    if (bulkFill.price) s.price = bulkFill.price
    if (bulkFill.stock !== undefined) s.stock = bulkFill.stock
  })
}

// HTML 富文本輔助
const formatHtml = (startTag, endTag) => {
  form.descriptionHtml += `${startTag}請輸入內容${endTag}`
}
const insertDivider = () => {
  form.descriptionHtml += '<hr/>'
}

// Canvas 本機 WebP 壓縮演算法 (AD-02 AC2)
const handleImageCompressAndConvert = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      // 最大寬度等比例縮放防爆
      const maxW = 1200
      let w = img.width
      let h = img.height
      if (w > maxW) {
        h = Math.round((h * maxW) / w)
        w = maxW
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)

      // 轉換成輕量 WebP 格式 (品質 82%)
      const webpBase64 = canvas.toDataURL('image/webp', 0.82)
      form.image = webpBase64
      alert('圖片已成功壓縮並轉換為 WebP 格式！')
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}

const openCreateModal = () => {
  isEditing.value = false
  currentEditId.value = null
  form.name = ''
  form.category = 'Top 上衣'
  form.basePrice = 1280
  form.originalPrice = 1580
  form.status = 'ACTIVE'
  form.image = 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80'
  form.descriptionHtml = '<p>正韓高質感設計單品，剪裁俐落垂墜。</p>'
  form.description = '正韓高質感設計單品，剪裁俐落垂墜。'
  form.skus = [
    { skuId: 'SKU-01', color: '奶油杏', size: 'FREE', price: 1280, stock: 20 },
    { skuId: 'SKU-02', color: '淺燕麥', size: 'FREE', price: 1280, stock: 15 }
  ]
  showModal.value = true
}

const openEditModal = (p) => {
  isEditing.value = true
  currentEditId.value = p.id
  form.name = p.name
  form.category = p.category
  form.basePrice = p.basePrice
  form.originalPrice = p.originalPrice
  form.status = p.status
  form.image = p.image
  form.descriptionHtml = p.descriptionHtml || `<p>${p.description}</p>`
  form.description = p.description
  form.skus = JSON.parse(JSON.stringify(p.skus))
  showModal.value = true
}

const saveProduct = () => {
  if (form.skus.length === 0) {
    alert('請至少生成或保留一組規格 SKU！')
    return
  }

  if (isEditing.value && currentEditId.value) {
    productStore.updateProduct(currentEditId.value, form)
    adminStore.addAuditLog('修改商品圖文規格', `更新商品【${form.name}】(ID: #${currentEditId.value})`)
    alert('商品資料已成功儲存更新！')
  } else {
    productStore.addNewProduct(form)
    adminStore.addAuditLog('新增商品 SPU/SKU', `上架新商品【${form.name}】`)
    alert('商品已成功新增上架！')
  }
  showModal.value = false
}

const handleDeleteProduct = (p) => {
  if (confirm(`確定刪除商品【${p.name}】嗎？`)) {
    productStore.deleteProduct(p.id)
    adminStore.addAuditLog('刪除商品', `刪除商品【${p.name}】(ID: #${p.id})`)
  }
}

// 批次功能 (AD-02 AC3)
const handleBatchStatus = (targetStatus) => {
  const res = productStore.batchToggleStatus(selectedIds.value, targetStatus)
  adminStore.addAuditLog('批次上下架', `將 ${res.count} 件商品狀態切換為 ${targetStatus}`)
  alert(`已成功將 ${res.count} 件商品${targetStatus === 'ACTIVE' ? '上架' : '下架'}！`)
}

// 批次價格
const showBatchPriceModal = ref(false)
const batchPriceForm = reactive({ mode: 'PERCENT', value: 90 })

const openBatchPriceModal = () => {
  showBatchPriceModal.value = true
}
const executeBatchPrice = () => {
  const res = productStore.batchAdjustPrice(selectedIds.value, batchPriceForm.mode, batchPriceForm.value)
  adminStore.addAuditLog('批次調整售價', `針對 ${res.count} 件商品進行批次調價`)
  alert(`已完成 ${res.count} 件商品之批次售價調整！`)
  showBatchPriceModal.value = false
}

// 批次庫存
const showBatchStockModal = ref(false)
const batchStockForm = reactive({ mode: 'ADD', value: 10 })

const openBatchStockModal = () => {
  showBatchStockModal.value = true
}
const executeBatchStock = () => {
  const res = productStore.batchAdjustStock(selectedIds.value, batchStockForm.mode, batchStockForm.value)
  adminStore.addAuditLog('批次調整庫存', `針對 ${selectedIds.value.length} 件商品的 ${res.count} 組規格執行批次庫存異動`)
  alert(`已成功更新 ${res.count} 組 SKU 庫存！`)
  showBatchStockModal.value = false
}
</script>

<style scoped>
.font-sans {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>