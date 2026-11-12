<template>
  <div class="d-flex flex-column gap-4 w-100" style="min-width: 0;">
    <!-- 頂部標題說明列 -->
    <div>
      <h1 class="h4 fw-bold text-dark font-serif mb-1">首頁排版與導覽選單 CMS</h1>
      <p class="small text-muted mb-0">即時維護前台 Navbar 主選單樹狀分類、頂部主輪播圖文與區塊可見度</p>
    </div>

    <!-- ==================== 1. 主分類導覽選單管理 ==================== -->
    <div class="card-korean bg-white shadow-xs p-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 class="fs-6 fw-bold text-dark mb-0">前台導覽列主分類選單 (Navbar Mega Menu)</h2>
          <span class="small text-muted font-monospace" style="font-size: 11px;">控制前台導覽列中間顯示的主選單及其下拉面板分類項目</span>
        </div>
        <button class="btn btn-outline-dark btn-sm rounded-pill px-3 shadow-2xs fw-bold" @click="openCreateCatModal">
          + 新增導覽主分類
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0 font-sans">
          <thead class="table-light">
            <tr class="text-secondary text-nowrap" style="font-size: 11px;">
              <th style="width: 70px;">順序</th>
              <th style="min-width: 140px;">一級分類名稱</th>
              <th style="min-width: 320px;">二級子類別與三級單品標籤 (Subcategories & Items)</th>
              <th class="text-end text-nowrap" style="min-width: 160px;">動作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cat, idx) in marketingStore.categoryTree" :key="idx">
              <td>
                <div class="d-flex align-items-center gap-1 font-monospace">
                  <button
                    type="button"
                    class="btn btn-light btn-sm p-0 border rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 22px; height: 22px;"
                    :disabled="idx === 0"
                    @click="marketingStore.movePrimaryCategory(idx, -1)"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    class="btn btn-light btn-sm p-0 border rounded-circle d-flex align-items-center justify-content-center"
                    style="width: 22px; height: 22px;"
                    :disabled="idx === marketingStore.categoryTree.length - 1"
                    @click="marketingStore.movePrimaryCategory(idx, 1)"
                  >
                    ▼
                  </button>
                </div>
              </td>
              <td>
                <strong class="text-dark fs-6">{{ cat.name }}</strong>
                <span class="text-muted font-monospace d-block" style="font-size: 10px;">{{ cat.subcategories.length }} 個子分類群組</span>
              </td>
              <td>
                <div class="d-flex flex-column gap-1.5">
                  <div
                    v-for="(sub, sIdx) in cat.subcategories"
                    :key="sIdx"
                    class="d-flex align-items-center gap-2 flex-wrap"
                  >
                    <span class="badge bg-light text-dark border font-monospace" style="font-size: 10.5px;">{{ sub.name }}</span>
                    <div class="d-flex gap-1 flex-wrap">
                      <span
                        v-for="(item, iIdx) in sub.items"
                        :key="iIdx"
                        class="badge rounded-pill bg-secondary-subtle text-secondary"
                        style="font-size: 9.5px;"
                      >
                        {{ item }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="text-end text-nowrap">
                <div class="d-flex justify-content-end gap-1.5">
                  <button class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="openEditCatModal(idx, cat)">
                    編輯
                  </button>
                  <button class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="handleDeleteCat(idx, cat)">
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== 2. 主輪播 Banner 視覺管理表格 ==================== -->
    <div class="card-korean bg-white shadow-xs p-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 class="fs-6 fw-bold text-dark mb-0">首頁主輪播清單 (共 {{ marketingStore.banners.length }} 組)</h2>
          <span class="small text-muted font-monospace" style="font-size: 11px;">支援即時開關、本機圖檔上傳與精準連結跳轉</span>
        </div>
        <button class="btn btn-primary btn-sm rounded-pill px-3.5 shadow-2xs fw-bold" @click="openCreateBannerModal">
          + 新增輪播 Banner
        </button>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0 font-sans">
          <thead class="table-light">
            <tr class="text-secondary text-nowrap" style="font-size: 11px;">
              <th style="width: 70px;">排序</th>
              <th style="min-width: 140px;">預覽圖</th>
              <th style="min-width: 240px;">標題與標籤文案</th>
              <th style="min-width: 160px;">按鈕與跳轉目的地</th>
              <th style="min-width: 100px;">狀態</th>
              <th class="text-end text-nowrap" style="min-width: 140px;">動作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="banner in sortedBanners" :key="banner.id">
              <td class="font-monospace fw-bold text-muted">#{{ banner.sortOrder }}</td>
              <td>
                <div class="rounded-3 overflow-hidden border shadow-2xs" style="width: 120px; aspect-ratio: 16/9; background-color: #f5f2ed;">
                  <img :src="banner.image" class="w-100 h-100 object-fit-cover" />
                </div>
              </td>
              <td>
                <span class="badge bg-light text-dark border font-monospace mb-1" style="font-size: 9.5px;">{{ banner.tag }}</span>
                <strong class="d-block text-dark text-truncate" style="max-width: 260px;">{{ banner.title }}</strong>
                <span class="text-muted small text-truncate d-block" style="max-width: 260px; font-size: 11px;">{{ banner.subtitle }}</span>
              </td>
              <td>
                <div class="fw-semibold text-dark">{{ banner.buttonText }}</div>
                <div class="mt-0.5">
                  <span
                    class="badge rounded-pill font-monospace"
                    :class="{
                      'bg-primary-subtle text-primary': banner.linkType === 'category',
                      'bg-secondary-subtle text-secondary': banner.linkType === 'path',
                      'bg-info-subtle text-info': banner.linkType === 'external'
                    }"
                    style="font-size: 9.5px;"
                  >
                    {{ banner.linkType === 'category' ? '切換分類' : banner.linkType === 'external' ? '外部分頁' : '內部頁面' }}
                  </span>
                  <span class="text-muted font-monospace ms-1 small" style="font-size: 11px;">
                    {{ banner.linkUrl }}
                  </span>
                </div>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-sm rounded-pill py-0.5 px-2.5 font-monospace"
                  :class="banner.isActive !== false ? 'btn-success-subtle text-success border border-success-subtle' : 'btn-secondary-subtle text-secondary border border-secondary-subtle'"
                  style="font-size: 10.5px;"
                  @click="marketingStore.toggleBannerStatus(banner.id)"
                >
                  {{ banner.isActive !== false ? '● 顯示中' : '○ 已隱藏' }}
                </button>
              </td>
              <td class="text-end text-nowrap">
                <div class="d-flex justify-content-end gap-1.5">
                  <button class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="openEditBannerModal(banner)">
                    編輯
                  </button>
                  <button class="btn btn-outline-danger btn-sm rounded-pill px-2.5 py-1" style="font-size: 11px;" @click="handleDeleteBanner(banner)">
                    刪除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== 3. 首頁版面區塊開關 ==================== -->
    <div class="card-korean bg-white shadow-xs p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fs-6 fw-bold text-dark mb-0">首頁版面區塊開關 (Layout Sections)</h2>
        <span class="small text-muted font-monospace" style="font-size: 11px;">即時控制首頁各模組是否渲染</span>
      </div>

      <div class="d-flex flex-column gap-2.5">
        <div
          v-for="sec in adminStore.homeSections"
          :key="sec.id"
          class="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-light"
        >
          <div>
            <strong class="text-dark d-block">{{ sec.name }}</strong>
            <span class="font-monospace text-muted small" style="font-size: 11px;">ID: {{ sec.id }}</span>
          </div>

          <div class="form-check form-switch m-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :id="'switch-' + sec.id"
              v-model="sec.visible"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 彈窗 1：主分類選單新增 / 編輯 Modal ==================== -->
    <Teleport to="body">
      <div v-if="showCatModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" style="max-width: 680px; margin: 0.75rem auto;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-5 fw-bold text-dark font-serif">
                {{ isEditingCat ? '編輯導覽主分類與子分類' : '新增導覽列主分類' }}
              </h3>
              <button type="button" class="btn-close" @click="showCatModal = false"></button>
            </div>

            <div class="modal-body small px-1 py-3">
              <form @submit.prevent="saveCategory" class="d-flex flex-column gap-3.5">
                <div>
                  <label class="form-label text-secondary mb-1">主分類名稱 (Navbar 顯示名稱) *</label>
                  <input
                    v-model="catForm.name"
                    required
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="例如：Top 上衣、Outer 外套、Bottom 下身"
                  />
                </div>

                <div class="border rounded-3 p-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-2.5">
                    <strong class="text-dark">下拉子分類群組 (Subcategories)</strong>
                    <button
                      type="button"
                      class="btn btn-outline-primary btn-sm rounded-pill py-0.5 px-3 font-monospace"
                      style="font-size: 11px;"
                      @click="addSubcategoryRow"
                    >
                      + 新增子分類群組
                    </button>
                  </div>

                  <div v-if="catForm.subcategories.length === 0" class="text-muted text-center py-3" style="font-size: 11px;">
                    尚無子分類，可點擊上方按鈕新增
                  </div>

                  <div class="d-flex flex-column gap-2.5">
                    <div
                      v-for="(sub, sIdx) in catForm.subcategories"
                      :key="sIdx"
                      class="card-korean p-3 bg-white border"
                    >
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold small text-primary">子分類 #{{ sIdx + 1 }}</span>
                        <button
                          type="button"
                          class="btn btn-link btn-sm text-danger p-0 text-decoration-none"
                          style="font-size: 11px;"
                          @click="catForm.subcategories.splice(sIdx, 1)"
                        >
                          刪除此組
                        </button>
                      </div>

                      <div class="row g-2">
                        <div class="col-12 col-sm-4">
                          <label class="form-label text-muted mb-0" style="font-size: 10.5px;">群組名稱 *</label>
                          <input v-model="sub.name" required type="text" class="form-control form-control-sm" placeholder="如：質感襯衫" />
                        </div>
                        <div class="col-12 col-sm-8">
                          <label class="form-label text-muted mb-0" style="font-size: 10.5px;">單品關鍵字 (逗號隔開) *</label>
                          <input
                            :value="sub.itemsString"
                            @input="sub.itemsString = $event.target.value"
                            required
                            type="text"
                            class="form-control form-control-sm font-monospace"
                            placeholder="如：雪紡襯衫, 長袖純棉襯衫, 立領法式襯衫"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold">
                    {{ isEditingCat ? '儲存主分類設定並同步前台' : '建立分類並加入導覽列' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== 彈窗 2：主輪播 Banner 編輯 / 新增 Modal (支援本機上傳與動態連結) ==================== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" style="max-width: 680px; margin: 0.75rem auto;">
          <div class="modal-content rounded-4 border-0 p-3.5 p-sm-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-5 fw-bold text-dark font-serif">
                {{ isEditing ? '編輯主輪播圖文 (Banner)' : '新增首頁主輪播圖文' }}
              </h3>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>

            <div class="modal-body small px-1 py-3">
              <form @submit.prevent="saveBanner" class="d-flex flex-column gap-3.5">
                
                <!-- 1. 背景圖設定 (支援本機檔案上傳 + 外連網址切換) -->
                <div class="border rounded-3 p-3 bg-light">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label fw-bold text-dark mb-0">輪播背景圖 *</label>
                    <!-- 上傳模式切換按鈕 -->
                    <div class="btn-group btn-group-sm">
                      <button
                        type="button"
                        class="btn"
                        :class="imageSourceMode === 'upload' ? 'btn-primary' : 'btn-outline-secondary'"
                        @click="imageSourceMode = 'upload'"
                      >
                        本機檔案上傳
                      </button>
                      <button
                        type="button"
                        class="btn"
                        :class="imageSourceMode === 'url' ? 'btn-primary' : 'btn-outline-secondary'"
                        @click="imageSourceMode = 'url'"
                      >
                        輸入圖片網址
                      </button>
                    </div>
                  </div>

                  <div class="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                    <!-- 即時縮圖預覽 -->
                    <div class="rounded-3 border overflow-hidden bg-white flex-shrink-0 shadow-2xs position-relative" style="width: 150px; aspect-ratio: 16/9;">
                      <img v-if="bannerForm.image" :src="bannerForm.image" class="w-100 h-100 object-fit-cover" alt="Banner 預覽" />
                      <div v-else class="w-100 h-100 d-flex align-items-center justify-content-center text-muted" style="font-size: 11px;">
                        尚未選擇圖片
                      </div>
                    </div>

                    <!-- 操作輸入區域 -->
                    <div class="flex-grow-1">
                      <!-- 模式 A：本機檔案上傳 -->
                      <div v-if="imageSourceMode === 'upload'">
                        <input
                          type="file"
                          accept="image/*"
                          class="form-control form-control-sm mb-1.5"
                          @change="handleImageFileUpload"
                        />
                        <div class="text-muted font-monospace" style="font-size: 10.5px;">
                          點擊按鈕直接從電腦或手機相簿挑選相片（支援 JPG, PNG, WebP）
                        </div>
                      </div>

                      <!-- 模式 B：網路 URL 輸入 -->
                      <div v-else>
                        <input
                          v-model="bannerForm.image"
                          type="url"
                          class="form-control form-control-sm font-monospace mb-1.5"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                        <div class="text-muted font-monospace" style="font-size: 10.5px;">
                          建議使用 16:9 橫向高清照片（寬度 1600px 以上佳）
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 2. 膠囊標籤與播放順序 -->
                <div class="row g-2.5">
                  <div class="col-8">
                    <label class="form-label text-secondary mb-1">膠囊標籤 (Badge Tag) *</label>
                    <input v-model="bannerForm.tag" required type="text" class="form-control form-control-sm font-monospace" placeholder="例如：SEASON OFF · 2026 WINTER" />
                  </div>
                  <div class="col-4">
                    <label class="form-label text-secondary mb-1">播放順序 (Sort)</label>
                    <input v-model.number="bannerForm.sortOrder" type="number" min="1" class="form-control form-control-sm font-monospace" />
                  </div>
                </div>

                <!-- 3. 主標題 (支援換行排版) -->
                <div>
                  <label class="form-label text-secondary mb-1">主標題 (支援換行排版) *</label>
                  <textarea
                    v-model="bannerForm.title"
                    required
                    rows="2"
                    class="form-control form-control-sm font-serif"
                    placeholder="例如：首爾冬季極簡特輯，&#10;探索晨霧微光中的鬆弛線條。"
                  ></textarea>
                </div>

                <!-- 4. 副標題描述文案 -->
                <div>
                  <label class="form-label text-secondary mb-1">副標題描述文案</label>
                  <input v-model="bannerForm.subtitle" type="text" class="form-control form-control-sm" placeholder="例如：全館冬季新品結帳享免運，滿額 NT$ 2,500 再贈精緻羊毛圍巾。" />
                </div>

                <!-- 5. 按鈕、連結類型與目標值 (附動態選項與清晰指引) -->
                <div class="border rounded-3 p-3 bg-white">
                  <label class="form-label fw-bold text-dark mb-2">按鈕點擊跳轉行為設定</label>
                  
                  <div class="row g-2.5">
                    <!-- 按鈕文字 -->
                    <div class="col-12 col-sm-4">
                      <label class="form-label text-muted mb-1" style="font-size: 11px;">按鈕文字 *</label>
                      <input v-model="bannerForm.buttonText" required type="text" class="form-control form-control-sm" placeholder="例如：探索全系列" />
                    </div>

                    <!-- 連結類型選擇 -->
                    <div class="col-12 col-sm-4">
                      <label class="form-label text-muted mb-1" style="font-size: 11px;">連結類型 *</label>
                      <select v-model="bannerForm.linkType" class="form-select form-select-sm font-monospace" @change="onLinkTypeChange">
                        <option value="category">切換商品分類 (推薦)</option>
                        <option value="path">內部頁面路徑</option>
                        <option value="external">外部新分頁連結</option>
                      </select>
                    </div>

                    <!-- 連結目標值：根據類型自動切換輸入模式 -->
                    <div class="col-12 col-sm-4">
                      <label class="form-label text-muted mb-1" style="font-size: 11px;">
                        {{ bannerForm.linkType === 'category' ? '選擇對應品類 *' : bannerForm.linkType === 'external' ? '外部完整網址 *' : '站內路由路徑 *' }}
                      </label>

                      <!-- 情境 1：若是切換分類，直接提供下拉選單防呆 -->
                      <select
                        v-if="bannerForm.linkType === 'category'"
                        v-model="bannerForm.linkUrl"
                        class="form-select form-select-sm font-monospace"
                        required
                      >
                        <option v-for="c in productStore.categories" :key="c" :value="c">
                          {{ c }}
                        </option>
                      </select>

                      <!-- 情境 2：內部路由 -->
                      <input
                        v-else-if="bannerForm.linkType === 'path'"
                        v-model="bannerForm.linkUrl"
                        required
                        type="text"
                        class="form-control form-control-sm font-monospace"
                        placeholder="例如：/profile 或 /product/1"
                      />

                      <!-- 情境 3：外部網址 -->
                      <input
                        v-else
                        v-model="bannerForm.linkUrl"
                        required
                        type="url"
                        class="form-control form-control-sm font-monospace"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <!-- 貼心動態提示說明 -->
                  <div class="mt-2 text-muted" style="font-size: 11px;">
                    <span v-if="bannerForm.linkType === 'category'">
                      💡 顧客點擊按鈕後，首頁將自動篩選【<strong>{{ bannerForm.linkUrl }}</strong>】品類並平滑滾動至商品清單。
                    </span>
                    <span v-else-if="bannerForm.linkType === 'path'">
                      💡 顧客點擊按鈕後，將在站內無縫切換到路徑【<strong>{{ bannerForm.linkUrl }}</strong>】。
                    </span>
                    <span v-else>
                      💡 顧客點擊按鈕後，將在瀏覽器以新分頁開啟外部網址【<strong>{{ bannerForm.linkUrl }}</strong>】。
                    </span>
                  </div>
                </div>

                <!-- 上架開關 -->
                <div class="form-check mt-1">
                  <input v-model="bannerForm.isActive" class="form-check-input" type="checkbox" id="bannerActiveCheck" />
                  <label class="form-check-label text-secondary" for="bannerActiveCheck">
                    立即啟用並在首頁輪播中播放此項目
                  </label>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold shadow-xs">
                    {{ isEditing ? '儲存修改並同步前台' : '確認建立輪播並上線' }}
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
import { ref, reactive, computed } from 'vue'
import { useMarketingStore } from '../../stores/marketingStore'
import { useProductStore } from '../../stores/productStore'
import { useAdminStore } from '../../stores/adminStore'

const marketingStore = useMarketingStore()
const productStore = useProductStore()
const adminStore = useAdminStore()

// ==================== 1. 主分類選單 CMS 狀態 ====================
const showCatModal = ref(false)
const isEditingCat = ref(false)
const currentEditCatIndex = ref(null)

const catForm = reactive({
  name: '',
  subcategories: []
})

const openCreateCatModal = () => {
  isEditingCat.value = false
  currentEditCatIndex.value = null
  catForm.name = ''
  catForm.subcategories = [
    { name: '熱門精選', itemsString: '新品推薦, 經典單品' }
  ]
  showCatModal.value = true
}

const openEditCatModal = (idx, cat) => {
  isEditingCat.value = true
  currentEditCatIndex.value = idx
  catForm.name = cat.name
  catForm.subcategories = (cat.subcategories || []).map(s => ({
    name: s.name,
    itemsString: (s.items || []).join(', ')
  }))
  showCatModal.value = true
}

const addSubcategoryRow = () => {
  catForm.subcategories.push({
    name: '',
    itemsString: ''
  })
}

const saveCategory = () => {
  const formattedSubcategories = catForm.subcategories.map(sub => ({
    name: sub.name.trim(),
    items: sub.itemsString.split(/[,，\s]+/).map(i => i.trim()).filter(Boolean)
  }))

  const payload = {
    name: catForm.name.trim(),
    subcategories: formattedSubcategories
  }

  if (isEditingCat.value && currentEditCatIndex.value !== null) {
    marketingStore.updatePrimaryCategory(currentEditCatIndex.value, payload)
    adminStore.addAuditLog('修改導覽主分類', `更新分類【${payload.name}】及其下拉子品類`)
    alert(`分類【${payload.name}】已成功更新並同步前台！`)
  } else {
    marketingStore.addPrimaryCategory(payload)
    adminStore.addAuditLog('新增導覽主分類', `建立新導覽分類【${payload.name}】`)
    alert(`分類【${payload.name}】已建立！`)
  }
  showCatModal.value = false
}

const handleDeleteCat = (idx, cat) => {
  if (confirm(`確定要刪除導覽主分類【${cat.name}】嗎？`)) {
    marketingStore.deletePrimaryCategory(idx)
    adminStore.addAuditLog('刪除導覽主分類', `刪除分類【${cat.name}】`)
  }
}

// ==================== 2. Banner CMS 狀態 ====================
const showModal = ref(false)
const isEditing = ref(false)
const currentEditId = ref(null)
const imageSourceMode = ref('upload') // 'upload' | 'url'

const bannerForm = reactive({
  tag: '',
  title: '',
  subtitle: '',
  buttonText: '立即選購',
  linkType: 'category',
  linkUrl: 'Top 上衣',
  image: '',
  sortOrder: 1,
  isActive: true,
  isExternal: false
})

const sortedBanners = computed(() => {
  return [...marketingStore.banners].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
})

// 本機檔案選取並讀取為 Base64
const handleImageFileUpload = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('請上傳有效的圖片格式檔案（JPG、PNG、WebP）！')
    return
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    bannerForm.image = event.target.result
  }
  reader.readAsDataURL(file)
}

// 切換連結類型時賦予友善預設值
const onLinkTypeChange = () => {
  if (bannerForm.linkType === 'category') {
    bannerForm.linkUrl = productStore.categories[0] || 'Top 上衣'
  } else if (bannerForm.linkType === 'path') {
    bannerForm.linkUrl = '/profile'
  } else if (bannerForm.linkType === 'external') {
    bannerForm.linkUrl = 'https://www.instagram.com/'
  }
}

const openCreateBannerModal = () => {
  isEditing.value = false
  currentEditId.value = null
  imageSourceMode.value = 'upload'
  bannerForm.tag = 'NEW ARRIVAL'
  bannerForm.title = '正韓極簡風格穿搭特輯'
  bannerForm.subtitle = '全館免運門檻 NT$ 1,500，立即挑選你的質感日常。'
  bannerForm.buttonText = '探索新品'
  bannerForm.linkType = 'category'
  bannerForm.linkUrl = productStore.categories[0] || 'Top 上衣'
  bannerForm.image = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80'
  bannerForm.sortOrder = marketingStore.banners.length + 1
  bannerForm.isActive = true
  bannerForm.isExternal = false
  showModal.value = true
}

const openEditBannerModal = (banner) => {
  isEditing.value = true
  currentEditId.value = banner.id
  // 若原本是 Base64 則預設為上傳模式，否則為網址模式
  imageSourceMode.value = banner.image?.startsWith('data:image') ? 'upload' : 'url'
  bannerForm.tag = banner.tag
  bannerForm.title = banner.title
  bannerForm.subtitle = banner.subtitle
  bannerForm.buttonText = banner.buttonText
  bannerForm.linkType = banner.linkType || 'category'
  bannerForm.linkUrl = banner.linkUrl
  bannerForm.image = banner.image
  bannerForm.sortOrder = banner.sortOrder || 1
  bannerForm.isActive = banner.isActive !== false
  bannerForm.isExternal = Boolean(banner.isExternal)
  showModal.value = true
}

const saveBanner = () => {
  if (!bannerForm.image) {
    alert('請上傳圖片或輸入圖片網址！')
    return
  }

  bannerForm.isExternal = bannerForm.linkType === 'external'

  if (isEditing.value && currentEditId.value) {
    marketingStore.updateBanner(currentEditId.value, bannerForm)
    adminStore.addAuditLog('更新首頁輪播', `修改輪播 ID #${currentEditId.value}【${bannerForm.title.slice(0, 15)}...】`)
    alert('輪播資料已儲存並同步至前台！')
  } else {
    marketingStore.addBanner(bannerForm)
    adminStore.addAuditLog('新增首頁輪播', `上線新輪播【${bannerForm.title.slice(0, 15)}...】`)
    alert('已成功建立新輪播圖！')
  }
  showModal.value = false
}

const handleDeleteBanner = (banner) => {
  if (confirm(`確定要刪除輪播【${banner.title.slice(0, 15)}...】嗎？`)) {
    marketingStore.deleteBanner(banner.id)
    adminStore.addAuditLog('刪除首頁輪播', `刪除輪播 ID #${banner.id}`)
  }
}
</script>