<template>
  <div class="d-flex flex-column gap-4 w-100" style="min-width: 0;">
    <!-- 頂部頁頭 -->
    <div>
      <h1 class="h4 fw-bold text-dark font-serif mb-1">會員 CRM 與顧客風控黑名單管控制度</h1>
      <p class="small text-muted mb-0">管理顧客消費行為記錄、棄單未取黑名單判定、分級權限限制與行銷優惠券</p>
    </div>

    <!-- 頂部頁籤切換：會員風控管控制度 / 優惠券活動 -->
    <div class="d-flex gap-2 border-bottom pb-2">
      <button
        type="button"
        class="btn btn-sm rounded-pill px-3.5 fw-bold"
        :class="activeTab === 'members' ? 'btn-dark' : 'btn-light text-secondary border'"
        @click="activeTab = 'members'"
      >
        <Users style="width: 14px; height: 14px;" class="me-1" />
        會員名冊與風險管制 ({{ authStore.memberList.length }})
      </button>

      <button
        type="button"
        class="btn btn-sm rounded-pill px-3.5 fw-bold"
        :class="activeTab === 'coupons' ? 'btn-dark' : 'btn-light text-secondary border'"
        @click="activeTab = 'coupons'"
      >
        <Ticket style="width: 14px; height: 14px;" class="me-1" />
        全館行銷優惠券管理
      </button>
    </div>

    <!-- ==================== 模組 1：會員名冊與分級黑名單管制 ==================== -->
    <div v-if="activeTab === 'members'" class="d-flex flex-column gap-3.5">
      
      <!-- 風控看板統計摘要 -->
      <div class="row g-3">
        <div class="col-6 col-md-3">
          <div class="card-korean p-3 bg-white border">
            <span class="text-muted small font-monospace">全體會員數</span>
            <div class="h4 fw-bold font-monospace text-dark mb-0 mt-1">{{ authStore.memberList.length }} 位</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-korean p-3 bg-white border">
            <span class="text-warning-emphasis small font-monospace">限制取貨付款 (超商未取)</span>
            <div class="h4 fw-bold font-monospace text-warning mb-0 mt-1">
              {{ countByRisk('RESTRICT_COD') }} 位
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-korean p-3 bg-white border">
            <span class="text-danger small font-monospace">暫停下單 (凍結中)</span>
            <div class="h4 fw-bold font-monospace text-danger mb-0 mt-1">
              {{ countByRisk('BLOCK_ORDER') }} 位
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card-korean p-3 bg-white border">
            <span class="text-dark small font-monospace">全面封鎖 (黑名單)</span>
            <div class="h4 fw-bold font-monospace text-dark mb-0 mt-1">
              {{ countByRisk('BANNED') }} 位
            </div>
          </div>
        </div>
      </div>

      <!-- 搜尋與篩選列 -->
      <div class="card-korean p-3 bg-white border d-flex flex-wrap gap-2.5 justify-content-between align-items-center">
        <div class="d-flex gap-2 flex-grow-1" style="max-width: 480px;">
          <input
            v-model="searchKeyword"
            type="text"
            class="form-control form-control-sm rounded-pill font-sans"
            placeholder="搜尋姓名、手機號碼、Email..."
          />
          <select v-model="filterRiskStatus" class="form-select form-select-sm rounded-pill font-monospace" style="width: 170px;">
            <option value="ALL">全部管制狀態</option>
            <option value="NORMAL">正常 (NORMAL)</option>
            <option value="WARNING">黃燈觀察 (WARNING)</option>
            <option value="RESTRICT_COD">限制取到付 (RESTRICT_COD)</option>
            <option value="BLOCK_ORDER">禁止下單 (BLOCK_ORDER)</option>
            <option value="BANNED">永久封鎖 (BANNED)</option>
          </select>
        </div>
        <span class="text-muted small font-monospace">符合條件：{{ filteredMembers.length }} 位</span>
      </div>

      <!-- 會員清單與管制操作表格 -->
      <div class="card-korean bg-white shadow-xs p-3.5 p-md-4 border">
        <div class="table-responsive">
          <table class="table table-hover align-middle small mb-0 font-sans">
            <thead class="table-light">
              <tr class="text-secondary text-nowrap" style="font-size: 11px;">
                <th style="min-width: 90px;">會員 ID</th>
                <th style="min-width: 160px;">姓名 / 聯絡方式</th>
                <th style="min-width: 110px;">消費與未取紀錄</th>
                <th style="min-width: 130px;">當前管制等級</th>
                <th style="min-width: 220px;">管制備註原因</th>
                <th style="min-width: 100px;">更新日期</th>
                <th class="text-end text-nowrap" style="min-width: 120px;">管制設定</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in filteredMembers" :key="member.id">
                <td class="font-monospace fw-bold text-muted">{{ member.id }}</td>
                <td>
                  <strong class="text-dark d-block">{{ member.name }}</strong>
                  <span class="text-muted font-monospace d-block" style="font-size: 11px;">{{ member.phone }}</span>
                  <span class="text-muted font-monospace d-block" style="font-size: 10.5px;">{{ member.email }}</span>
                </td>
                <td>
                  <div class="font-monospace fw-semibold text-dark">NT$ {{ member.totalSpent.toLocaleString() }}</div>
                  <div class="text-muted font-monospace" style="font-size: 10.5px;">已成交 {{ member.orderCount }} 筆</div>
                  <div
                    v-if="member.abandonCount > 0"
                    class="text-danger font-monospace fw-bold"
                    style="font-size: 10.5px;"
                  >
                    ⚠ 棄單/未取 {{ member.abandonCount }} 次
                  </div>
                </td>
                <td>
                  <span class="badge py-1 px-2.5 rounded-pill font-monospace" :class="getRiskBadgeClass(member.riskStatus)">
                    {{ getRiskStatusLabel(member.riskStatus) }}
                  </span>
                </td>
                <td>
                  <div class="text-secondary small text-truncate" style="max-width: 240px;" :title="member.notes">
                    {{ member.notes || '—' }}
                  </div>
                </td>
                <td class="font-monospace text-muted small">{{ member.updatedAt }}</td>
                <td class="text-end text-nowrap">
                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 font-monospace"
                    style="font-size: 11px;"
                    @click="openRiskModal(member)"
                  >
                    <ShieldAlert style="width: 12px; height: 12px;" class="me-1" />
                    調整管制
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== 模組 2：優惠券活動管理 ==================== -->
    <div v-else-if="activeTab === 'coupons'" class="card-korean bg-white shadow-xs p-4 border">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fs-6 fw-bold text-dark mb-0">行銷優惠券代碼維護</h2>
        <button class="btn btn-primary btn-sm rounded-pill px-3 py-1 font-monospace" @click="alert('新增優惠券功能運作中')">
          + 建立優惠券
        </button>
      </div>
      <div class="text-muted small py-4 text-center">
        優惠券與促銷模組運作正常，限制優惠狀態的黑名單會員將自動無法套用全館折扣。
      </div>
    </div>

    <!-- ==================== 風險管制調整 Modal ==================== -->
    <Teleport to="body">
      <div v-if="showRiskModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 520px;">
          <div class="modal-content rounded-4 border-0 p-3.5 p-sm-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-5 fw-bold text-dark font-serif d-flex align-items-center gap-2">
                <ShieldAlert style="width: 18px; height: 18px; color: #b54949;" />
                <span>會員風控等級與黑名單設定</span>
              </h3>
              <button type="button" class="btn-close" @click="showRiskModal = false"></button>
            </div>

            <div class="modal-body small px-1 py-3" v-if="activeMember">
              <div class="card-korean p-2.5 bg-light mb-3 border">
                <div class="d-flex justify-content-between">
                  <span class="text-dark fw-bold">{{ activeMember.name }} ({{ activeMember.id }})</span>
                  <span class="font-monospace text-muted">{{ activeMember.phone }}</span>
                </div>
                <div class="text-muted font-monospace mt-1" style="font-size: 11px;">
                  累積消費：NT$ {{ activeMember.totalSpent.toLocaleString() }} · 棄單次數：{{ activeMember.abandonCount }} 次
                </div>
              </div>

              <form @submit.prevent="submitRiskAdjustment" class="d-flex flex-column gap-3">
                <div>
                  <label class="form-label text-secondary fw-semibold mb-1">管制等級設定 *</label>
                  <select v-model="riskForm.riskStatus" class="form-select form-select-sm font-monospace" required>
                    <option value="NORMAL">● 正常狀態 (NORMAL) - 無任何限制</option>
                    <option value="WARNING">▲ 黃燈警示 (WARNING) - 限制高額活動參與</option>
                    <option value="RESTRICT_COD">✕ 限制取貨付款 (RESTRICT_COD) - 停用超取到付與貨到付款</option>
                    <option value="RESTRICT_PROMO">✕ 限制點數優惠 (RESTRICT_PROMO) - 禁止折抵與領券</option>
                    <option value="BLOCK_ORDER">⛔ 暫停下單 (BLOCK_ORDER) - 凍結購物袋與結帳</option>
                    <option value="BANNED">🚫 全面封鎖 (BANNED) - 禁止登入與註冊</option>
                  </select>
                </div>

                <div>
                  <label class="form-label text-secondary fw-semibold mb-1">管制理由與備忘錄 (稽核紀錄) *</label>
                  <textarea
                    v-model="riskForm.notes"
                    required
                    rows="3"
                    class="form-control form-control-sm"
                    placeholder="請詳細填寫原因，例如：7-11 門市逾期未取達 3 次、蓄意詐欺刷卡、與客服衝突辱罵..."
                  ></textarea>
                </div>

                <div class="alert alert-warning py-2 px-3 small font-sans m-0 border-0" style="font-size: 11px;">
                  💡 設定後，系統會在該會員進入結帳頁時自動依規則進行阻斷或隱藏貨到付款選項。
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-danger w-100 rounded-pill py-2.5 fw-bold shadow-xs">
                    確認更新會員風控狀態
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
import { Users, Ticket, ShieldAlert } from 'lucide-vue-next'
import { useAuthStore } from '../../stores/authStore'
import { useAdminStore } from '../../stores/adminStore'

const authStore = useAuthStore()
const adminStore = useAdminStore()

const activeTab = ref('members')
const searchKeyword = ref('')
const filterRiskStatus = ref('ALL')

// 彈窗狀態
const showRiskModal = ref(false)
const activeMember = ref(null)
const riskForm = reactive({
  riskStatus: 'NORMAL',
  notes: ''
})

const countByRisk = (status) => {
  return authStore.memberList.filter(m => m.riskStatus === status).length
}

const filteredMembers = computed(() => {
  let list = [...authStore.memberList]

  if (filterRiskStatus.value !== 'ALL') {
    list = list.filter(m => m.riskStatus === filterRiskStatus.value)
  }

  if (searchKeyword.value.trim()) {
    const q = searchKeyword.value.trim().toLowerCase()
    list = list.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.email.toLowerCase().includes(q)
    )
  }

  return list
})

const getRiskStatusLabel = (status) => {
  const map = {
    NORMAL: '正常',
    WARNING: '黃燈觀察',
    RESTRICT_COD: '限制取到付',
    RESTRICT_PROMO: '限制優惠',
    BLOCK_ORDER: '禁止下單',
    BANNED: '永久黑名單'
  }
  return map[status] || status
}

const getRiskBadgeClass = (status) => {
  const map = {
    NORMAL: 'bg-success-subtle text-success border border-success-subtle',
    WARNING: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
    RESTRICT_COD: 'bg-danger-subtle text-danger border border-danger-subtle',
    RESTRICT_PROMO: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
    BLOCK_ORDER: 'bg-danger text-white',
    BANNED: 'bg-dark text-white'
  }
  return map[status] || 'bg-light text-dark'
}

const openRiskModal = (member) => {
  activeMember.value = member
  riskForm.riskStatus = member.riskStatus
  riskForm.notes = member.notes || ''
  showRiskModal.value = true
}

const submitRiskAdjustment = () => {
  if (!activeMember.value) return

  const res = authStore.updateMemberRisk(activeMember.value.id, {
    riskStatus: riskForm.riskStatus,
    notes: riskForm.notes
  })

  adminStore.addAuditLog(
    '調整會員風控狀態',
    `將會員【${activeMember.value.name}】(${activeMember.value.id}) 狀態變更為【${riskForm.riskStatus}】，原因：${riskForm.notes}`
  )

  alert(res.message)
  showRiskModal.value = false
}
</script>