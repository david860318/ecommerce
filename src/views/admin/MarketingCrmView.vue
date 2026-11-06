<template>
  <div class="d-flex flex-column gap-4">
    <!-- 標題工具列 -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h1 class="h4 fw-bold text-dark font-serif mb-1">AD-07 & AD-09 行銷促銷與會員 CRM</h1>
        <p class="small text-muted mb-0">優惠券生成與排程設定、會員 LTV 價值統計與超商棄單黑名單管制</p>
      </div>

      <!-- 新增優惠券觸發按鈕 -->
      <button class="btn btn-primary btn-sm rounded-pill px-3 shadow-2xs fw-bold" @click="showCouponModal = true">
        + 建立新優惠券
      </button>
    </div>

    <!-- 模組 1：行銷優惠券清單 (AD-07) -->
    <div class="card-korean p-4 bg-white shadow-xs">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fs-6 fw-bold text-dark mb-0">全站優惠券與促銷代碼 (共 {{ cartStore.availableCoupons.length }} 組)</h2>
        <span class="badge bg-success-subtle text-success font-monospace" style="font-size: 10px;">前台即時同步</span>
      </div>

      <div class="row g-3">
        <div v-for="c in cartStore.availableCoupons" :key="c.code" class="col-12 col-md-6 col-lg-4">
          <div class="card-korean p-3 border bg-light h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="badge bg-dark font-monospace">{{ c.code }}</span>
                <span class="badge" :class="isCouponActive(c) ? 'bg-success rounded-pill' : 'bg-secondary rounded-pill'">
                  {{ isCouponActive(c) ? '生效中' : '已過期' }}
                </span>
              </div>
              <strong class="text-dark d-block mt-1">{{ c.title }}</strong>
              <p class="text-muted small mb-2">{{ c.description }}</p>
            </div>
            <div class="border-top pt-2 text-muted font-monospace" style="font-size: 10px;">
              <div>門檻：滿 NT$ {{ c.minSpend }} · 折抵：{{ c.type === 'PERCENT' ? `${c.discountValue}% (打折)` : `NT$ ${c.discountValue}` }}</div>
              <div>品類：{{ c.targetCategory === 'ALL' ? '全館商品' : c.targetCategory }}</div>
              <div>排程：{{ c.startDate.slice(0, 10) }} ~ {{ c.endDate.slice(0, 10) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模組 2：會員名冊與黑名單 (AD-09) -->
    <div class="card-korean p-4 bg-white shadow-xs">
      <h2 class="fs-6 fw-bold text-dark mb-3">會員名冊與顧客黑名單控管</h2>
      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0">
          <thead class="table-light">
            <tr class="text-secondary" style="font-size: 11px;">
              <th>會員名稱 / 編號</th>
              <th>聯絡手機 / 信箱 (RBAC)</th>
              <th>會員等級 / 累積消費 (LTV)</th>
              <th>客群標籤 (Tags)</th>
              <th>超取管制狀態</th>
              <th class="text-end">管理操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cust in adminStore.customers" :key="cust.id">
              <td>
                <strong class="text-dark">{{ adminStore.maskName(cust.name) }}</strong>
                <span class="text-muted font-monospace d-block" style="font-size: 10px;">{{ cust.id }}</span>
              </td>
              <td class="font-monospace">
                <div>{{ adminStore.maskPhone(cust.phone) }}</div>
                <div class="text-muted" style="font-size: 11px;">{{ cust.email }}</div>
              </td>
              <td>
                <span class="badge bg-primary-subtle text-primary">{{ cust.tier }}</span>
                <div class="font-monospace fw-bold mt-1 text-dark">LTV: NT$ {{ cust.ltv.toLocaleString() }}</div>
              </td>
              <td>
                <div class="d-flex gap-1 flex-wrap">
                  <span v-for="t in cust.tags" :key="t" class="badge bg-light text-dark border">
                    {{ t }}
                  </span>
                </div>
              </td>
              <td>
                <span v-if="cust.isBlacklisted" class="badge bg-danger rounded-pill">
                  ⚠ 禁止使用超商貨到付款
                </span>
                <span v-else class="badge bg-success-subtle text-success rounded-pill">
                  信用良好
                </span>
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm rounded-pill px-3 py-1 font-monospace"
                  :class="cust.isBlacklisted ? 'btn-outline-success' : 'btn-outline-danger'"
                  style="font-size: 11px;"
                  @click="adminStore.toggleCustomerBlacklist(cust.id)"
                >
                  {{ cust.isBlacklisted ? '解除黑名單' : '列入黑名單' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== 新增優惠券彈窗 Modal (AD-07) ==================== -->
    <Teleport to="body">
      <div v-if="showCouponModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.55); backdrop-filter: blur(2px); z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 480px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-6 fw-bold text-dark font-serif">建立新優惠券促銷代碼</h3>
              <button type="button" class="btn-close" @click="showCouponModal = false"></button>
            </div>
            <div class="modal-body small">
              <form @submit.prevent="submitCreateCoupon" class="d-flex flex-column gap-3">
                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">折扣代碼 (英數大寫) *</label>
                    <input v-model="newCouponForm.code" required type="text" class="form-control form-control-sm font-monospace text-uppercase" placeholder="SPRING2026" />
                  </div>
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">折扣類型 *</label>
                    <select v-model="newCouponForm.type" class="form-select form-select-sm">
                      <option value="FIXED">固定金額扣減 (NT$)</option>
                      <option value="PERCENT">百分比折抵 (%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="form-label text-secondary mb-1">優惠活動名稱 *</label>
                  <input v-model="newCouponForm.title" required type="text" class="form-control form-control-sm" placeholder="例如：春季新品專屬折 150" />
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">折扣數值 *</label>
                    <input v-model.number="newCouponForm.discountValue" required type="number" min="1" class="form-control form-control-sm font-monospace" placeholder="150" />
                  </div>
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">最低消費門檻 (NT$) *</label>
                    <input v-model.number="newCouponForm.minSpend" required type="number" min="0" class="form-control form-control-sm font-monospace" placeholder="1000" />
                  </div>
                </div>

                <div>
                  <label class="form-label text-secondary mb-1">適用商品品類</label>
                  <select v-model="newCouponForm.targetCategory" class="form-select form-select-sm">
                    <option value="ALL">全館所有品類通用</option>
                    <option value="Top 上衣">Top 上衣</option>
                    <option value="Outer 外套">Outer 外套</option>
                    <option value="Bottom 下身">Bottom 下身</option>
                    <option value="Dress 裙裝">Dress 裙裝</option>
                  </select>
                </div>

                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">排程開始日期 *</label>
                    <input v-model="newCouponForm.startDate" required type="date" class="form-control form-control-sm font-monospace" />
                  </div>
                  <div class="col-6">
                    <label class="form-label text-secondary mb-1">排程結束日期 *</label>
                    <input v-model="newCouponForm.endDate" required type="date" class="form-control form-control-sm font-monospace" />
                  </div>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2.5 fw-bold">
                    確認新增並立即在前台啟用
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
import { useAdminStore } from '../../stores/adminStore'
import { useCartStore } from '../../stores/cartStore'

const adminStore = useAdminStore()
const cartStore = useCartStore()

const showCouponModal = ref(false)

const newCouponForm = reactive({
  code: '',
  title: '',
  description: '',
  type: 'FIXED',
  discountValue: 100,
  minSpend: 1000,
  targetCategory: 'ALL',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '2026-12-31'
})

const isCouponActive = (c) => {
  const now = new Date()
  return now >= new Date(c.startDate) && now <= new Date(c.endDate)
}

const submitCreateCoupon = () => {
  newCouponForm.description = `${newCouponForm.targetCategory === 'ALL' ? '全館' : newCouponForm.targetCategory}單筆滿 NT$ ${newCouponForm.minSpend} 現折 ${newCouponForm.type === 'PERCENT' ? newCouponForm.discountValue + '%' : 'NT$ ' + newCouponForm.discountValue}`
  const res = adminStore.addNewCoupon(newCouponForm)
  alert(res.message)
  if (res.success) {
    showCouponModal.value = false
    newCouponForm.code = ''
    newCouponForm.title = ''
  }
}
</script>