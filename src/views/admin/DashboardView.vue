<template>
  <div class="dashboard-container d-flex flex-column gap-4 w-100">
    <!-- ==================== 1. 頁面標題與匯出工具列 ==================== -->
    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h1 class="h4 fw-bold text-dark font-serif mb-1">AD-10 營運數據儀表板</h1>
        <p class="small text-muted mb-0">即時監控全店 GMV、轉化率指標、熱銷穿搭排行與財務金物流收支對帳</p>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn btn-outline-secondary btn-sm rounded-pill px-3 shadow-2xs font-monospace d-flex align-items-center gap-1.5"
          @click="exportFilteredReport"
        >
          <Download style="width: 14px; height: 14px;" />
          <span>匯出當前對帳報表 (CSV)</span>
        </button>
      </div>
    </div>

    <!-- ==================== 2. 多維度篩選工具列 ==================== -->
    <div class="card-korean p-3.5 bg-white shadow-xs">
      <div class="d-flex flex-column gap-3">
        <!-- 上排：時間預設標籤與自訂日期 -->
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <div class="d-flex align-items-center gap-1.5 text-muted">
              <Calendar style="width: 15px; height: 15px; color: var(--md-primary, #9b7e68);" />
              <span class="small fw-semibold text-dark" style="font-size: 12px;">時間維度：</span>
            </div>
            <div class="btn-group btn-group-sm rounded-pill border p-0.5 bg-light" role="group">
              <button
                v-for="preset in datePresets"
                :key="preset.key"
                type="button"
                class="btn btn-sm rounded-pill py-1 px-3 font-monospace border-0"
                :class="filter.period === preset.key ? 'btn-white bg-white text-dark shadow-2xs fw-bold' : 'text-muted'"
                @click="selectDatePreset(preset.key)"
              >
                {{ preset.label }}
              </button>
            </div>
          </div>

          <!-- 自訂起訖日期選擇 -->
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="small text-muted font-monospace" style="font-size: 11px;">自訂區間：</span>
            <input
              v-model="filter.startDate"
              type="date"
              class="form-control form-control-sm rounded-3 font-monospace"
              style="width: 135px; font-size: 11.5px;"
              @change="filter.period = 'custom'"
            />
            <span class="text-muted small">至</span>
            <input
              v-model="filter.endDate"
              type="date"
              class="form-control form-control-sm rounded-3 font-monospace"
              style="width: 135px; font-size: 11.5px;"
              @change="filter.period = 'custom'"
            />
          </div>
        </div>

        <hr class="my-0 border-stone-200" style="opacity: 0.6;" />

        <!-- 下排：狀態與金物流維度下拉篩選 -->
        <div class="row g-2.5 align-items-center">
          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label text-muted mb-1" style="font-size: 11px;">訂單履約狀態</label>
            <select v-model="filter.shippingStatus" class="form-select form-select-sm rounded-3 font-monospace">
              <option value="ALL">全部狀態 (不限)</option>
              <option value="PENDING">備貨中 (待出貨)</option>
              <option value="SHIPPED">已出貨 (運送中)</option>
              <option value="DELIVERED">已送達 (完成結案)</option>
              <option value="CANCELLED">已取消 / 售後退貨</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label text-muted mb-1" style="font-size: 11px;">付款金流渠道</label>
            <select v-model="filter.paymentMethod" class="form-select form-select-sm rounded-3 font-monospace">
              <option value="ALL">全部金流渠道</option>
              <option value="CREDIT">信用卡線上 3D</option>
              <option value="LINEPAY">LINE Pay 行動支付</option>
              <option value="ATM">ATM 虛擬帳號轉帳</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-md-3">
            <label class="form-label text-muted mb-1" style="font-size: 11px;">配送物流溫層</label>
            <select v-model="filter.shippingType" class="form-select form-select-sm rounded-3 font-monospace">
              <option value="ALL">全部配送方式</option>
              <option value="CVS">7-11 / 全家超商取件</option>
              <option value="HOME">黑貓宅急便到府</option>
            </select>
          </div>

          <div class="col-12 col-sm-6 col-md-3 d-flex align-items-end">
            <button
              type="button"
              class="btn btn-outline-secondary btn-sm rounded-3 w-100 py-1.5"
              style="font-size: 12px;"
              @click="resetFilter"
            >
              重設篩選條件
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 3. 四大核心 KPI 指標卡片 ==================== -->
    <div class="row g-3">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-korean p-3.5 bg-white shadow-xs h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small text-uppercase font-monospace" style="font-size: 11px;">篩選區間 GMV</span>
              <span class="badge bg-success-subtle text-success font-monospace" style="font-size: 9.5px;">實收入帳</span>
            </div>
            <div class="h3 fw-bold font-monospace text-dark mb-1">
              NT$ {{ computedMetrics.gmv.toLocaleString() }}
            </div>
          </div>
          <div class="text-muted small" style="font-size: 11px;">
            有效訂單累計實付營業額
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-korean p-3.5 bg-white shadow-xs h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small text-uppercase font-monospace" style="font-size: 11px;">區間總訂單數</span>
              <span class="badge bg-primary-subtle text-primary font-monospace" style="font-size: 9.5px;">
                {{ computedMetrics.orderCount }} 筆
              </span>
            </div>
            <div class="h3 fw-bold font-monospace text-dark mb-1">
              {{ computedMetrics.orderCount }} <small class="fs-6 fw-normal text-muted">筆</small>
            </div>
          </div>
          <div class="text-muted small" style="font-size: 11px;">
            履約出貨率：<strong class="text-dark font-monospace">{{ computedMetrics.fulfillmentRate }}%</strong>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-korean p-3.5 bg-white shadow-xs h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small text-uppercase font-monospace" style="font-size: 11px;">平均客單價 (AOV)</span>
              <span class="badge bg-info-subtle text-info font-monospace" style="font-size: 9.5px;">均值試算</span>
            </div>
            <div class="h3 fw-bold font-monospace text-dark mb-1">
              NT$ {{ computedMetrics.aov.toLocaleString() }}
            </div>
          </div>
          <div class="text-muted small" style="font-size: 11px;">
            免運門檻 NT$ 1,500 激勵效應
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-xl-3">
        <div class="card-korean p-3.5 bg-white shadow-xs h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="text-muted small text-uppercase font-monospace" style="font-size: 11px;">售後退貨退款率</span>
              <span class="badge bg-warning-subtle text-warning-emphasis font-monospace" style="font-size: 9.5px;">售後監控</span>
            </div>
            <div class="h3 fw-bold font-monospace text-dark mb-1">
              {{ computedMetrics.refundRate }}%
            </div>
          </div>
          <div class="text-muted small" style="font-size: 11px;">
            共 {{ computedMetrics.refundCount }} 筆退貨申請
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 4. 熱銷單品排行 vs 金流佔比分析 ==================== -->
    <div class="row g-3">
      <!-- 熱銷商品銷售排行 -->
      <div class="col-12 col-lg-7">
        <div class="card-korean p-4 bg-white shadow-xs h-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fs-6 fw-bold text-dark mb-0">熱門單品累積銷售排行</h2>
            <span class="text-muted font-monospace" style="font-size: 11px;">件數排序</span>
          </div>

          <div class="d-flex flex-column gap-3">
            <div
              v-for="(item, idx) in topProducts"
              :key="item.id"
              class="d-flex align-items-center gap-3"
            >
              <span
                class="fw-bold font-monospace text-center rounded-circle flex-shrink-0"
                :class="idx === 0 ? 'bg-primary text-white' : 'bg-light text-secondary border'"
                style="width: 24px; height: 24px; font-size: 11px; line-height: 24px;"
              >
                {{ idx + 1 }}
              </span>
              <img :src="item.image" class="rounded object-fit-cover flex-shrink-0" style="width: 42px; height: 56px;" />
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="fw-semibold text-dark text-truncate small" style="max-width: 280px;">{{ item.name }}</span>
                  <span class="font-monospace text-muted small">{{ item.salesCount }} 件</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    :style="{
                      width: `${(item.salesCount / maxSalesCount) * 100}%`,
                      backgroundColor: idx === 0 ? 'var(--md-primary, #9b7e68)' : '#c8b8ab'
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 支付渠道佔比結構 -->
      <div class="col-12 col-lg-5">
        <div class="card-korean p-4 bg-white shadow-xs h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="fs-6 fw-bold text-dark mb-0">支付金流渠道組成結構</h2>
              <span class="text-muted font-monospace" style="font-size: 11px;">當前篩選資料</span>
            </div>

            <div class="d-flex flex-column gap-3 mb-3">
              <div v-for="pay in paymentBreakdown" :key="pay.name">
                <div class="d-flex justify-content-between align-items-center small mb-1">
                  <span class="text-dark">{{ pay.name }}</span>
                  <span class="font-monospace fw-bold">{{ pay.percent }}% (NT$ {{ pay.amount.toLocaleString() }})</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" :style="{ width: `${pay.percent}%`, backgroundColor: pay.color }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-3 bg-light rounded-3 small text-muted font-monospace" style="font-size: 11px;">
            💡 系統支援 EMV 3-D Secure 2.0 雙因子驗證，整體授權完成率達 98.4%。
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 5. 財務損益對帳與金物流成本試算表 ==================== -->
    <div class="card-korean p-4 bg-white shadow-xs">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="fs-6 fw-bold text-dark mb-0">金物流手續費對帳與實收損益試算</h2>
          <span class="text-muted small" style="font-size: 11px;">依當前篩選訂單動態扣除 2.5% 金流手續費與 NT$ 65 物流成本</span>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0 font-monospace">
          <thead class="table-light">
            <tr class="text-secondary text-nowrap" style="font-size: 11px;">
              <th style="min-width: 150px;">金流支付方式</th>
              <th style="min-width: 100px;">訂單筆數</th>
              <th style="min-width: 140px;">交易總額 (Gross GMV)</th>
              <th style="min-width: 150px;">金流手續費 (信用卡/LinePay: 2.5%)</th>
              <th style="min-width: 140px;">物流成本 (NT$65/筆)</th>
              <th class="text-end" style="min-width: 140px;">實收淨額 (Net Revenue)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in financialReportRows" :key="row.channel">
              <td class="fw-semibold text-dark text-nowrap">{{ row.channel }}</td>
              <td class="text-nowrap">{{ row.count }} 筆</td>
              <td class="text-nowrap">NT$ {{ row.gross.toLocaleString() }}</td>
              <td class="text-danger text-nowrap">{{ row.fee === 0 ? 'NT$ 0 (買方自付)' : `- NT$ ${row.fee.toLocaleString()}` }}</td>
              <td class="text-danger text-nowrap">- NT$ {{ row.shippingCost.toLocaleString() }}</td>
              <td class="text-end fw-bold text-success fs-6 text-nowrap">NT$ {{ row.net.toLocaleString() }}</td>
            </tr>
          </tbody>
          <tfoot class="table-group-divider">
            <tr class="fw-bold text-dark text-nowrap">
              <td>合計彙總</td>
              <td>{{ computedMetrics.orderCount }} 筆</td>
              <td>NT$ {{ computedMetrics.gmv.toLocaleString() }}</td>
              <td class="text-danger">- NT$ {{ totalPaymentFee.toLocaleString() }}</td>
              <td class="text-danger">- NT$ {{ totalShippingCost.toLocaleString() }}</td>
              <td class="text-end text-success fs-6">NT$ {{ totalNetRevenue.toLocaleString() }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { Calendar, Download } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'
import { useProductStore } from '../../stores/productStore'

const adminStore = useAdminStore()
const productStore = useProductStore()

const datePresets = [
  { key: 'today', label: '今日' },
  { key: '7days', label: '近 7 天' },
  { key: '30days', label: '近 30 天' },
  { key: 'month', label: '本月' },
  { key: 'all', label: '全部' }
]

const filter = reactive({
  period: 'all',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  shippingStatus: 'ALL',
  paymentMethod: 'ALL',
  shippingType: 'ALL'
})

const selectDatePreset = (presetKey) => {
  filter.period = presetKey
  const now = new Date()
  const formatDate = (d) => d.toISOString().slice(0, 10)

  if (presetKey === 'today') {
    filter.startDate = formatDate(now)
    filter.endDate = formatDate(now)
  } else if (presetKey === '7days') {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    filter.startDate = formatDate(start)
    filter.endDate = formatDate(now)
  } else if (presetKey === '30days') {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    filter.startDate = formatDate(start)
    filter.endDate = formatDate(now)
  } else if (presetKey === 'month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    filter.startDate = formatDate(startOfMonth)
    filter.endDate = formatDate(now)
  } else if (presetKey === 'all') {
    filter.startDate = '2026-01-01'
    filter.endDate = '2026-12-31'
  }
}

const resetFilter = () => {
  filter.period = 'all'
  filter.startDate = '2026-01-01'
  filter.endDate = '2026-12-31'
  filter.shippingStatus = 'ALL'
  filter.paymentMethod = 'ALL'
  filter.shippingType = 'ALL'
}

// 訂單過濾
const filteredOrders = computed(() => {
  return (adminStore.orders || []).filter((order) => {
    const orderDate = (order.createdAt || '').slice(0, 10)
    if (filter.startDate && orderDate < filter.startDate) return false
    if (filter.endDate && orderDate > filter.endDate) return false

    if (filter.shippingStatus !== 'ALL') {
      if (filter.shippingStatus === 'CANCELLED') {
        if (order.shippingStatus !== 'CANCELLED' && order.refundStatus === 'NONE') return false
      } else if (order.shippingStatus !== filter.shippingStatus) {
        return false
      }
    }

    if (filter.paymentMethod !== 'ALL') {
      if (filter.paymentMethod === 'CREDIT' && !order.paymentMethod.includes('信用卡')) return false
      if (filter.paymentMethod === 'LINEPAY' && !order.paymentMethod.includes('LINE Pay')) return false
      if (filter.paymentMethod === 'ATM' && !order.paymentMethod.includes('ATM')) return false
    }

    if (filter.shippingType !== 'ALL') {
      if (filter.shippingType === 'CVS' && !order.shippingMethod.includes('超商')) return false
      if (filter.shippingType === 'HOME' && !order.shippingMethod.includes('黑貓')) return false
    }

    return true
  })
})

// KPI 動態指標計算
const computedMetrics = computed(() => {
  const list = filteredOrders.value
  const totalCount = list.length
  if (totalCount === 0) {
    return { gmv: 0, orderCount: 0, aov: 0, fulfillmentRate: 0, refundRate: 0, refundCount: 0 }
  }

  const validOrders = list.filter((o) => o.shippingStatus !== 'CANCELLED' && o.refundStatus !== 'REFUNDED')
  const gmv = validOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
  const aov = validOrders.length > 0 ? Math.round(gmv / validOrders.length) : 0

  const fulfilledCount = list.filter((o) => o.shippingStatus === 'SHIPPED' || o.shippingStatus === 'DELIVERED').length
  const fulfillmentRate = Math.round((fulfilledCount / totalCount) * 100)

  const refundCount = list.filter((o) => o.refundStatus && o.refundStatus !== 'NONE').length
  const refundRate = Math.round((refundCount / totalCount) * 100)

  return {
    gmv,
    orderCount: totalCount,
    aov,
    fulfillmentRate,
    refundRate,
    refundCount
  }
})

// 熱門單品排行
const topProducts = computed(() => {
  return [...productStore.products]
    .sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
    .slice(0, 4)
})

const maxSalesCount = computed(() => {
  const counts = topProducts.value.map((p) => p.salesCount || 0)
  return Math.max(...counts, 1)
})

// 支付方式結構
const paymentBreakdown = computed(() => {
  const list = filteredOrders.value
  const total = list.reduce((s, o) => s + (o.amount || 0), 0) || 1

  let creditAmt = 0, linePayAmt = 0, atmAmt = 0

  list.forEach((o) => {
    if (o.paymentMethod.includes('信用卡')) creditAmt += o.amount || 0
    else if (o.paymentMethod.includes('LINE Pay')) linePayAmt += o.amount || 0
    else atmAmt += o.amount || 0
  })

  return [
    { name: '信用卡線上 3D', amount: creditAmt, percent: Math.round((creditAmt / total) * 100), color: '#9b7e68' },
    { name: 'LINE Pay 快速支付', amount: linePayAmt, percent: Math.round((linePayAmt / total) * 100), color: '#06c755' },
    { name: 'ATM 虛擬帳號', amount: atmAmt, percent: Math.round((atmAmt / total) * 100), color: '#adb5bd' }
  ]
})

// 財務損益試算表
const financialReportRows = computed(() => {
  const list = filteredOrders.value
  const channels = [
    { key: 'CREDIT', name: '信用卡線上 3D (一次付清)', rate: 0.025 },
    { key: 'LINEPAY', name: 'LINE Pay 行動支付', rate: 0.025 },
    { key: 'ATM', name: 'ATM 虛擬帳號轉帳', rate: 0 }
  ]

  return channels.map((c) => {
    const ordersInChannel = list.filter((o) => {
      if (c.key === 'CREDIT') return o.paymentMethod.includes('信用卡')
      if (c.key === 'LINEPAY') return o.paymentMethod.includes('LINE Pay')
      return o.paymentMethod.includes('ATM')
    })

    const count = ordersInChannel.length
    const gross = ordersInChannel.reduce((sum, o) => sum + (o.amount || 0), 0)
    const fee = Math.round(gross * c.rate)
    const shippingCost = count * 65
    const net = Math.max(0, gross - fee - shippingCost)

    return {
      channel: c.name,
      count,
      gross,
      fee,
      shippingCost,
      net
    }
  })
})

const totalPaymentFee = computed(() => financialReportRows.value.reduce((s, r) => s + r.fee, 0))
const totalShippingCost = computed(() => financialReportRows.value.reduce((s, r) => s + r.shippingCost, 0))
const totalNetRevenue = computed(() => financialReportRows.value.reduce((s, r) => s + r.net, 0))

// 匯出報表
const exportFilteredReport = () => {
  let csv = 'data:text/csv;charset=utf-8,金流渠道,訂單筆數,總交易額(GMV),金流手續費,物流託運成本,實收淨額\n'
  financialReportRows.value.forEach((r) => {
    csv += `${r.channel},${r.count},${r.gross},${r.fee},${r.shippingCost},${r.net}\n`
  })
  csv += `合計彙總,${computedMetrics.value.orderCount},${computedMetrics.value.gmv},${totalPaymentFee.value},${totalShippingCost.value},${totalNetRevenue.value}\n`

  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csv))
  link.setAttribute('download', `MD_Finance_Report_${filter.startDate}_${filter.endDate}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.dashboard-container {
  min-width: 0;
  max-width: 100%;
}

.shadow-2xs {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.btn-white {
  background-color: #ffffff !important;
}
</style>