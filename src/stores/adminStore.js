import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  // 1. RBAC 當前登入管理員資訊 (AD-01)
  const currentAdmin = ref({
    name: '系統管理者',
    role: '超級管理員',
    roleLevel: 'SUPER_ADMIN'
  })

  // 2. 訂單數據：支援完整的狀態機與流轉時間戳記 (AD-04, AD-05, AD-06, AD-08)
  const orders = ref([
    {
      id: 'ORD-982142',
      customerName: '陳大文',
      phone: '0912-***-678',
      amount: 2480,
      paymentMethod: '信用卡一次付清',
      paymentStatus: 'PAID', // PAID (已付款), UNPAID (待付款), REFUNDED (已退款)
      shippingMethod: '黑貓宅配',
      shippingStatus: 'PENDING', // PENDING (待出貨), SHIPPED (運送中), DELIVERED (已送達), CANCELLED (已取消)
      trackingCode: '',
      invoiceNumber: 'AB-88291042',
      invoiceStatus: 'ISSUED', // ISSUED (已開立), VOIDED (已作廢/折讓), UNISSUED (未開立)
      createdAt: '2026-11-06 09:30',
      paidAt: '2026-11-06 09:32',
      shippedAt: null,
      deliveredAt: null,
      items: [{ name: '極簡都會防潑水機能後背包 (曜石黑 / 標準款)', quantity: 1, price: 2480 }]
    },
    {
      id: 'ORD-871239',
      customerName: '陳大文',
      phone: '0912-***-678',
      amount: 4990,
      paymentMethod: 'LINE Pay',
      paymentStatus: 'PAID',
      shippingMethod: '7-11 超商取貨 (鑫鑫門市)',
      shippingStatus: 'SHIPPED',
      trackingCode: 'CVS-7119028',
      invoiceNumber: 'AB-88291043',
      invoiceStatus: 'ISSUED',
      createdAt: '2026-11-05 14:15',
      paidAt: '2026-11-05 14:16',
      shippedAt: '2026-11-05 18:00',
      deliveredAt: null,
      items: [{ name: '智能主動降噪藍牙無線耳機 Pro (極光白 / 標準規格)', quantity: 1, price: 4990 }]
    },
    {
      id: 'ORD-761201',
      customerName: '陳大文',
      phone: '0912-***-678',
      amount: 1880,
      paymentMethod: 'ATM 虛擬帳號',
      paymentStatus: 'UNPAID',
      shippingMethod: '黑貓宅配',
      shippingStatus: 'PENDING',
      trackingCode: '',
      invoiceNumber: '',
      invoiceStatus: 'UNISSUED',
      createdAt: '2026-11-06 11:20',
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      items: [{ name: '手沖細口不鏽鋼溫控快煮壺 (消光黑 / 800ml)', quantity: 1, price: 1880 }]
    },
    {
      id: 'ORD-650912',
      customerName: '林小玲',
      phone: '0988-***-432',
      amount: 1280,
      paymentMethod: '信用卡一次付清',
      paymentStatus: 'PAID',
      shippingMethod: '黑貓宅配',
      shippingStatus: 'DELIVERED',
      trackingCode: '9021884299',
      invoiceNumber: 'AB-88291039',
      invoiceStatus: 'ISSUED',
      createdAt: '2026-11-03 10:10',
      paidAt: '2026-11-03 10:12',
      shippedAt: '2026-11-03 15:30',
      deliveredAt: '2026-11-05 11:00',
      items: [{ name: '天然冷杉雪松精油香氛擴香組 (雪松木 / 150ml)', quantity: 1, price: 1280 }]
    }
  ])

  // 3. 會員 CRM 資料庫 (AD-09, AD-01)
  const customers = ref([
    {
      id: 'CUST-001',
      name: '陳大文',
      email: 'david.chen@shopflow.tw',
      phone: '0912-***-678',
      totalSpent: 9350,
      orderCount: 3,
      tag: 'VIP 客戶',
      isBlacklisted: false
    },
    {
      id: 'CUST-002',
      name: '李小美',
      email: 'lee***@hotmail.com',
      phone: '0933-***-888',
      totalSpent: 890,
      orderCount: 1,
      tag: '一般會員',
      isBlacklisted: false
    },
    {
      id: 'CUST-003',
      name: '王惡霸',
      email: 'bad***@yahoo.com',
      phone: '0977-***-999',
      totalSpent: 0,
      orderCount: 3,
      tag: '超商未取警示',
      isBlacklisted: true // 限制超商取貨付款
    }
  ])

  // 4. 行銷折扣規則 (AD-07)
  const coupons = ref([
    { code: 'SALE100', discount: 100, minSpend: 1000, active: true, expireAt: '2026-12-31' },
    { code: 'NEW2026', discount: 200, minSpend: 2000, active: true, expireAt: '2026-11-30' },
    { code: 'VIP500', discount: 500, minSpend: 5000, active: false, expireAt: '2026-10-31' }
  ])

  // 訂單狀態流轉 1：出貨處理並產生物流追蹤號 (AD-04, AD-05)
  const markAsShipped = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    if (order.paymentStatus !== 'PAID') {
      alert('該訂單買家尚未付款，無法執行出貨！')
      return
    }
    order.shippingStatus = 'SHIPPED'
    order.shippedAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
    if (!order.trackingCode) {
      order.trackingCode = 'EXP-' + Math.floor(100000000 + Math.random() * 900000000)
    }
  }

  // 訂單狀態流轉 2：標記送達完成 (AD-04)
  const markAsDelivered = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    order.shippingStatus = 'DELIVERED'
    order.deliveredAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
  }

  // 訂單狀態流轉 3：取消訂單、發票作廢與線上退款 (AD-06, AD-08)
  const refundAndVoidInvoice = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    if (confirm(`確定要針對訂單 ${orderId} 執行刷退與發票折讓/作廢？`)) {
      order.paymentStatus = 'REFUNDED'
      order.shippingStatus = 'CANCELLED'
      order.invoiceStatus = 'VOIDED'
      alert(`訂單 ${orderId} 已完成金流線上刷退，發票 ${order.invoiceNumber || '無'} 已完成折讓登記！`)
    }
  }

  // 營運指標即時試算 (AD-10)
  const metrics = computed(() => {
    const validOrders = orders.value.filter((o) => o.paymentStatus === 'PAID')
    const totalGmv = validOrders.reduce((sum, o) => sum + o.amount, 0)
    const paidCount = validOrders.length
    const aov = paidCount > 0 ? Math.round(totalGmv / paidCount) : 0

    return {
      totalGmv,
      orderCount: orders.value.length,
      paidCount,
      aov,
      conversionRate: '3.42%'
    }
  })

  return {
    currentAdmin,
    orders,
    customers,
    coupons,
    metrics,
    markAsShipped,
    markAsDelivered,
    refundAndVoidInvoice
  }
})