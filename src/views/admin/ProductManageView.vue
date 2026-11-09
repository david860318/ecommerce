<template>
  <div class="d-flex flex-column gap-4 w-100" style="min-width: 0;">
    <!-- 頂部標題工具列 -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div>
        <h1 class="h4 fw-bold text-dark font-serif mb-1">商品與即時庫存控管 (PIM & WMS)</h1>
        <p class="small text-muted mb-0">支援多規格 SKU 生成、富文本圖文編輯、安全庫存預警與手動盤點</p>
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary btn-sm rounded-pill px-3.5 shadow-2xs fw-bold" @click="openCreateModal">
          + 新增商品 (SPU/SKU)
        </button>
      </div>
    </div>

    <!-- 批次操作工具列 (獨立卡片，內距充裕) -->
    <div class="card-korean p-3.5 bg-white shadow-xs d-flex justify-content-between align-items-center flex-wrap gap-3">
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

        <button
          class="btn btn-outline-dark btn-sm rounded-pill px-3"
          :disabled="selectedIds.length === 0"
          @click="openBatchPriceModal"
        >
          批次調整價格
        </button>

        <button
          class="btn btn-outline-dark btn-sm rounded-pill px-3"
          :disabled="selectedIds.length === 0"
          @click="openBatchStockModal"
        >
          批次調整庫存
        </button>
      </div>
    </div>

    <!-- 商品規格清單表格 (全寬圓角自帶邊距) -->
    <div class="card-korean bg-white shadow-xs p-0 overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0">
          <thead class="table-light">
            <tr class="text-secondary text-nowrap" style="font-size: 11px;">
              <th style="width: 44px; text-align: center;"></th>
              <th style="min-width: 250px;">商品名稱 / ID</th>
              <th style="min-width: 110px;">分類</th>
              <th style="min-width: 120px;">售價 / 原價</th>
              <th style="min-width: 260px;">SKU 規格矩陣與各規格庫存</th>
              <th style="min-width: 110px;">上架狀態</th>
              <th class="text-end text-nowrap" style="min-width: 170px;">管理動作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in productStore.products" :key="product.id">
              <td style="text-align: center;">
                <input
                  type="checkbox"
                  class="form-check-input mt-0"
                  :checked="selectedIds.includes(product.id)"
                  @change="toggleSelectOne(product.id)"
                />
              </td>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <img :src="product.image" class="rounded object-fit-cover flex-shrink-0" style="width: 44px; height: 58px;" />
                  <div class="min-w-0">
                    <strong class="text-dark d-block text-truncate" style="max-width: 220px;">{{ product.name }}</strong>
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
                    編輯
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

    <!-- 庫存異動流水 (同樣加上標準內距) -->
    <div class="card-korean p-4 bg-white shadow-xs">
      <h2 class="fs-6 fw-bold text-dark mb-3">庫存變動歷史流水紀錄 (WMS Logs)</h2>
      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0 font-monospace">
          <thead class="table-light">
            <tr class="text-nowrap" style="font-size: 11px;">
              <th>單號</th>
              <th>規格</th>
              <th>數量變動</th>
              <th>異動後結存</th>
              <th>異動原因</th>
              <th>操作者</th>
              <th>時間</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in adminStore.stockLogs" :key="log.id">
              <td class="text-muted">{{ log.id }}</td>
              <td class="text-truncate" style="max-width: 220px;">{{ log.productName }}</td>
              <td class="fw-bold" :class="log.changeQty > 0 ? 'text-success' : 'text-danger'">
                {{ log.changeQty > 0 ? `+${log.changeQty}` : log.changeQty }}
              </td>
              <td class="fw-bold">{{ log.afterStock }} 件</td>
              <td>{{ log.reason }}</td>
              <td>{{ log.operator }}</td>
              <td class="text-muted">{{ log.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 新增 / 編輯商品彈窗 -->
    <Teleport to="body">
      <div v-if="showModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable" style="max-width: 900px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-5 fw-bold text-dark font-serif">
                {{ isEditing ? '編輯商品與規格 (SPU/SKU)' : '新增韓系商品與自動規格矩陣' }}
              </h3>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>

            <div class="modal-body small px-3 py-4">
              <form @submit.prevent="saveProduct" class="d-flex flex-column gap-3.5">
                <div class="row g-2">
                  <div class="col-8">
                    <label class="form-label text-secondary mb-1">商品名稱 *</label>
                    <input v-model="form.name" required type="text" class="form-control" placeholder="例如：法式極簡微抓皺雪紡襯衫" />
                  </div>
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">商品分類 *</label>
                    <select v-model="form.category" class="form-select">
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
                    <input v-model.number="form.basePrice" required type="number" min="1" class="form-control font-monospace" />
                  </div>
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">原價 (NT$)</label>
                    <input v-model.number="form.originalPrice" type="number" min="1" class="form-control font-monospace" />
                  </div>
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">初始狀態</label>
                    <select v-model="form.status" class="form-select font-monospace">
                      <option value="ACTIVE">立即上架 (ACTIVE)</option>
                      <option value="INACTIVE">暫存下架 (INACTIVE)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="form-label text-secondary mb-1">商品主圖網址</label>
                  <input v-model="form.image" type="url" class="form-control font-monospace" placeholder="https://..." />
                </div>

                <div>
                  <label class="form-label text-secondary mb-1">商品圖文描述 (HTML)</label>
                  <textarea
                    v-model="form.descriptionHtml"
                    rows="3"
                    class="form-control font-monospace"
                    placeholder="<p>請輸入商品描述 HTML 碼...</p>"
                  ></textarea>
                </div>

                <!-- 規格笛卡兒積生成 -->
                <div class="border rounded-3 p-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong class="text-dark">多規格自動生成 SKU 矩陣</strong>
                    <button type="button" class="btn btn-primary btn-sm rounded-pill py-0.5 px-3 font-monospace" style="font-size: 11px;" @click="generateCartesianSkus">
                      ⚡ 自動展開 SKU
                    </button>
                  </div>

                  <div class="row g-2 mb-3">
                    <div class="col-6">
                      <label class="form-label text-muted mb-0" style="font-size: 11px;">顏色（逗號隔開）：</label>
                      <input v-model="specInput.colors" type="text" class="form-control form-control-sm" placeholder="奶油杏, 淺燕麥" />
                    </div>
                    <div class="col-6">
                      <label class="form-label text-muted mb-0" style="font-size: 11px;">尺寸（逗號隔開）：</label>
                      <input v-model="specInput.sizes" type="text" class="form-control form-control-sm" placeholder="S, M, FREE" />
                    </div>
                  </div>

                  <div class="table-responsive">
                    <table class="table table-sm table-bordered bg-white align-middle mb-0 font-monospace" style="font-size: 11.5px;">
                      <thead class="table-light">
                        <tr>
                          <th>SKU 代碼</th>
                          <th>顏色</th>
                          <th>尺寸</th>
                          <th>規格售價</th>
                          <th>庫存</th>
                          <th style="width: 44px; text-align: center;">操作</th>
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

                <div class="pt-3">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold">
                    {{ isEditing ? '儲存修改' : '確認建立商品' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 批次調價 Modal -->
    <Teleport to="body">
      <div v-if="showBatchPriceModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1075;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 380px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <h3 class="fs-6 fw-bold mb-3">批次調整商品售價 (已選 {{ selectedIds.length }} 件)</h3>
            <div class="mb-3">
              <select v-model="batchPriceForm.mode" class="form-select form-select-sm mb-2">
                <option value="PERCENT">按折數調整（例如：90 代表 9 折）</option>
                <option value="FIXED">固定增減金額（例如：-100 代表減 100）</option>
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

    <!-- 批次調庫存 Modal -->
    <Teleport to="body">
      <div v-if="showBatchStockModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1075;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 380px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <h3 class="fs-6 fw-bold mb-3">批次調整規格庫存 (已選 {{ selectedIds.length }} 件)</h3>
            <div class="mb-3">
              <select v-model="batchStockForm.mode" class="form-select form-select-sm mb-2">
                <option value="ADD">在現有基礎上增減（如: +10 或 -5）</option>
                <option value="SET">統一設定為固定值（如: 全部重設為 20）</option>
              </select>
              <input v-model.number="batchStockForm.value" type="number" class="form-control form-control-sm font-monospace" placeholder="輸入數量" />
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

const selectedIds = ref([])
const isAllSelected = computed(() => {
  return productStore.products.length > 0 && selectedIds.value.length === productStore.products.length
})

const toggleSelectAll = (e) => {
  if (e.target.checked) selectedIds.value = productStore.products.map(p => p.id)
  else selectedIds.value = []
}

const toggleSelectOne = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

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
  skus: []
})

const specInput = reactive({
  colors: '奶油杏, 淺燕麥',
  sizes: 'S, M, FREE'
})

const generateCartesianSkus = () => {
  const colors = specInput.colors.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean)
  const sizes = specInput.sizes.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean)
  if (colors.length === 0 || sizes.length === 0) {
    alert('請至少填寫一個顏色與一個尺寸！')
    return
  }
  const generated = []
  colors.forEach(c => {
    sizes.forEach(s => {
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
  form.skus = JSON.parse(JSON.stringify(p.skus))
  showModal.value = true
}

const saveProduct = () => {
  if (form.skus.length === 0) {
    alert('請至少生成一組規格！')
    return
  }
  if (isEditing.value && currentEditId.value) {
    productStore.updateProduct(currentEditId.value, form)
    alert('商品修改已儲存！')
  } else {
    productStore.addNewProduct(form)
    alert('商品已成功新增！')
  }
  showModal.value = false
}

const handleDeleteProduct = (p) => {
  if (confirm(`確定刪除商品【${p.name}】嗎？`)) {
    productStore.deleteProduct(p.id)
    alert('已成功刪除！')
  }
}

const handleBatchStatus = (targetStatus) => {
  const res = productStore.batchToggleStatus(selectedIds.value, targetStatus)
  alert(`已完成 ${res.count} 件商品上下架狀態更新！`)
}

const showBatchPriceModal = ref(false)
const batchPriceForm = reactive({ mode: 'PERCENT', value: 90 })
const openBatchPriceModal = () => { showBatchPriceModal.value = true }
const executeBatchPrice = () => {
  const res = productStore.batchAdjustPrice(selectedIds.value, batchPriceForm.mode, batchPriceForm.value)
  alert(`已調整 ${res.count} 件商品價格！`)
  showBatchPriceModal.value = false
}

const showBatchStockModal = ref(false)
const batchStockForm = reactive({ mode: 'ADD', value: 10 })
const openBatchStockModal = () => { showBatchStockModal.value = true }
const executeBatchStock = () => {
  const res = productStore.batchAdjustStock(selectedIds.value, batchStockForm.mode, batchStockForm.value)
  alert(`已完成 ${res.count} 組 SKU 庫存調整！`)
  showBatchStockModal.value = false
}
</script>