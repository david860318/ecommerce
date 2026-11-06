<template>
  <div class="d-flex flex-column gap-4">
    <!-- 頂部標題工具列 -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h1 class="h4 fw-bold text-dark font-serif mb-1">AD-04 ~ 08 訂單履約與售後退貨中心</h1>
        <p class="small text-muted mb-0">託運單出貨、熱感標籤列印、倉庫退貨驗收入庫與線上刷退折讓</p>
      </div>
      <button class="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-2xs" @click="exportOrdersCsv">
        匯出出貨明細 (CSV)
      </button>
    </div>

    <!-- 狀態篩選頁籤 (依訂單與退換貨劃分) -->
    <div class="d-flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="st in statusFilters"
        :key="st.key"
        type="button"
        class="btn btn-sm rounded-pill px-3 text-nowrap"
        :class="activeFilter === st.key ? 'btn-primary' : 'btn-white bg-white text-secondary border border-stone-200'"
        @click="activeFilter = st.key"
      >
        {{ st.label }} ({{ getFilterCount(st.key) }})
      </button>
    </div>

    <!-- 訂單清單資料表格 -->
    <div class="card-korean bg-white shadow-xs overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0">
          <thead class="table-light">
            <tr class="text-secondary" style="font-size: 11px;">
              <th style="min-width: 140px;">訂單編號 / 下單時間</th>
              <th style="min-width: 130px;">顧客資訊 (RBAC)</th>
              <th style="min-width: 220px;">購買品項 / 金額</th>
              <th style="min-width: 130px;">金流 / 發票狀態</th>
              <th style="min-width: 140px;">物流狀態 / 託運碼</th>
              <th style="min-width: 130px;">售後退貨狀態</th>
              <th class="text-end" style="min-width: 200px;">管理操作動作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <!-- 單號與時間 -->
              <td>
                <strong class="font-monospace text-dark d-block">{{ order.id }}</strong>
                <span class="text-muted font-monospace" style="font-size: 10px;">{{ order.createdAt }}</span>
              </td>

              <!-- 顧客資訊 (自動隱碼) -->
              <td>
                <div class="fw-semibold text-dark">{{ adminStore.maskName(order.customerName) }}</div>
                <div class="text-muted font-monospace" style="font-size: 11px;">{{ adminStore.maskPhone(order.phone) }}</div>
              </td>

              <!-- 購買品項 -->
              <td>
                <div v-for="(it, idx) in order.items" :key="idx" class="text-truncate" style="max-width: 220px;">
                  {{ it.name }} × {{ it.quantity }}
                </div>
                <strong class="font-monospace text-primary">NT$ {{ order.amount.toLocaleString() }}</strong>
              </td>

              <!-- 金流與發票 -->
              <td>
                <span class="badge" :class="order.paymentStatus === 'PAID' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'">
                  {{ order.paymentStatus === 'PAID' ? '已付款' : '待付款' }}
                </span>
                <div class="text-muted mt-1 font-monospace" style="font-size: 10px;">
                  發票: {{ order.invoiceNo || '未開立' }}
                  <span v-if="order.invoiceStatus === 'VOID'" class="badge bg-danger text-white">作廢</span>
                  <span v-if="order.invoiceStatus === 'ALLOWANCE'" class="badge bg-secondary text-white">折讓</span>
                </div>
              </td>

              <!-- 物流狀態 -->
              <td>
                <span class="badge" :class="getShippingBadge(order.shippingStatus)">
                  {{ getShippingText(order.shippingStatus) }}
                </span>
                <div v-if="order.trackingCode" class="text-muted font-monospace mt-1" style="font-size: 10px;">
                  {{ order.trackingCode }}
                </div>
              </td>

              <!-- 售後狀態 -->
              <td>
                <template v-if="order.refundStatus === 'NONE'">
                  <span class="text-muted font-monospace">—</span>
                </template>
                <template v-else-if="order.refundStatus === 'APPLIED'">
                  <span class="badge bg-danger-subtle text-danger font-monospace">買家申請退貨</span>
                  <div class="text-muted" style="font-size: 10px;">{{ order.returnReason }}</div>
                </template>
                <template v-else-if="order.refundStatus === 'RECEIVED'">
                  <span class="badge bg-info-subtle text-info font-monospace">已收件驗收</span>
                </template>
                <template v-else-if="order.refundStatus === 'REFUNDED'">
                  <span class="badge bg-secondary text-white font-monospace">已完成退款</span>
                </template>
              </td>

              <!-- 管理動作 -->
              <td class="text-end">
                <div class="d-flex justify-content-end gap-1.5 flex-wrap">
                  <!-- 出貨功能 1：產生託運碼 -->
                  <button
                    v-if="order.paymentStatus === 'PAID' && order.shippingStatus === 'PENDING'"
                    class="btn btn-primary btn-sm rounded-pill py-0.5 px-2.5 font-monospace"
                    style="font-size: 11px;"
                    @click="adminStore.generateShippingLabel(order.id)"
                  >
                    產生託運碼出貨
                  </button>

                  <!-- 出貨功能 2：列印熱感標籤 -->
                  <button
                    v-if="order.trackingCode"
                    class="btn btn-light btn-sm rounded-pill py-0.5 px-2 border"
                    style="font-size: 11px;"
                    @click="printLabel(order)"
                  >
                    列印標籤
                  </button>

                  <!-- 出貨功能 3：標記完成送達 (自動發放點數 ST-11) -->
                  <button
                    v-if="order.shippingStatus === 'SHIPPED'"
                    class="btn btn-outline-success btn-sm rounded-pill py-0.5 px-2 font-monospace"
                    style="font-size: 11px;"
                    @click="adminStore.markAsDelivered(order.id)"
                  >
                    標記送達完成
                  </button>

                  <!-- 售後功能 1：退貨商品驗收入庫 (回補庫存) -->
                  <button
                    v-if="order.refundStatus === 'APPLIED'"
                    class="btn btn-info btn-sm text-white rounded-pill py-0.5 px-2 font-monospace"
                    style="font-size: 11px;"
                    @click="adminStore.confirmReturnReceived(order.id)"
                  >
                    驗收退貨入庫
                  </button>

                  <!-- 售後功能 2：線上原路退款與發票折讓 -->
                  <button
                    v-if="order.refundStatus === 'RECEIVED'"
                    class="btn btn-danger btn-sm rounded-pill py-0.5 px-2.5 fw-bold font-monospace"
                    style="font-size: 11px;"
                    @click="adminStore.executeRefund(order.id)"
                  >
                    核准線上退款
                  </button>

                  <!-- 發票作廢 -->
                  <button
                    v-if="order.invoiceStatus === 'ISSUED' && order.refundStatus === 'NONE'"
                    class="btn btn-outline-secondary btn-sm rounded-pill py-0.5 px-2"
                    style="font-size: 11px;"
                    @click="adminStore.voidInvoice(order.id)"
                  >
                    作廢發票
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 10x10 cm 熱感式託運標籤列印 Modal (AD-05) -->
    <Teleport to="body">
      <div v-if="printingOrder" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.55); backdrop-filter: blur(2px); z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 360px;">
          <div class="modal-content rounded-4 border-0 p-4 shadow-xl text-center">
            <h3 class="fs-6 fw-bold mb-3 font-serif">熱感式託運單 (10x10 cm)</h3>
            <div class="border p-3 rounded-3 bg-white font-monospace text-start small mb-3">
              <div class="fw-bold border-bottom pb-1 mb-2">{{ printingOrder.shippingMethod }}</div>
              <div>託運單號: <strong>{{ printingOrder.trackingCode }}</strong></div>
              <div>收件人: {{ printingOrder.customerName }}</div>
              <div>聯絡電話: {{ printingOrder.phone }}</div>
              <div class="border-top pt-2 mt-2 text-center">
                <div class="bg-dark text-white py-2 mb-1 fw-bold tracking-widest">||| ||||| |||| |||</div>
                <span style="font-size: 10px;">{{ printingOrder.trackingCode }}</span>
              </div>
            </div>
            <button class="btn btn-dark w-100 rounded-pill py-2" @click="printingOrder = null">完成列印並關閉</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()
const activeFilter = ref('ALL')
const printingOrder = ref(null)

const statusFilters = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待出貨' },
  { key: 'SHIPPED', label: '已出貨' },
  { key: 'DELIVERED', label: '已送達' },
  { key: 'RETURNS', label: '退貨處理中' }
]

const getFilterCount = (key) => {
  if (key === 'ALL') return adminStore.orders.length
  if (key === 'RETURNS') return adminStore.orders.filter((o) => o.refundStatus !== 'NONE').length
  return adminStore.orders.filter((o) => o.shippingStatus === key).length
}

const filteredOrders = computed(() => {
  if (activeFilter.value === 'ALL') return adminStore.orders
  if (activeFilter.value === 'RETURNS') {
    return adminStore.orders.filter((o) => o.refundStatus !== 'NONE')
  }
  return adminStore.orders.filter((o) => o.shippingStatus === activeFilter.value)
})

const getShippingText = (status) => {
  const map = { PENDING: '備貨中', SHIPPED: '已出貨', DELIVERED: '已送達', CANCELLED: '已取消' }
  return map[status] || status
}

const getShippingBadge = (status) => {
  const map = {
    PENDING: 'bg-secondary-subtle text-secondary-emphasis',
    SHIPPED: 'bg-info-subtle text-info',
    DELIVERED: 'bg-success-subtle text-success',
    CANCELLED: 'bg-light text-muted border'
  }
  return map[status] || 'bg-light text-dark'
}

const printLabel = (order) => { printingOrder.value = order }

const exportOrdersCsv = () => {
  let csv = 'data:text/csv;charset=utf-8,訂單編號,收件人,金額,金流,物流狀態,託運單號,退貨狀態\n'
  adminStore.orders.forEach((o) => {
    csv += `${o.id},${o.customerName},${o.amount},${o.paymentMethod},${o.shippingStatus},${o.trackingCode || ''},${o.refundStatus}\n`
  })
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csv))
  link.setAttribute('download', `Orders_Report_${Date.now()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>