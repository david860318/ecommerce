import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAdminStore = defineStore('admin', () => {
  // 1. RBAC 當前管理員 (AD-01)
  const currentAdmin = ref({
    name: '系統管理者',
    role: '超級管理員', // 超級管理員, 商品專員, 出貨客服
    roleLevel: 'SUPER_ADMIN'
  })

  // 2. 訂單數據 (AD-04, AD-05, AD-06, AD-08)
  const orders = ref([
    {
      id: 'ORD-982142',
      customerName: '陳大文',
      phone: '0912-345-678',
      amount: 2480,
      paymentMethod: '信用卡一次付清',
      paymentStatus: 'PAID', // PAID, UNPAID, REFUNDED
      shippingMethod: '黑貓宅配',
      shippingStatus: 'PENDING', // PENDING (待出貨), SHIPPED (已出貨), DELIVERED (已送達)
      trackingCode: '9021884210',
      invoiceNumber: 'AB-88291042',
      invoiceStatus: 'ISSUED', // ISSUED (已開立), VOIDED (已作廢/折讓)
      createdAt: '2026-11-06 09:30',
      items: [{ name: '極簡都會防潑水機能後背包 (曜石黑 / 標準款)', quantity: 1, price: 2480 }]
    },
    {
      id: 'ORD-871239',
      customerName: '林曉玲',
      phone: '0988-765-432',
      amount: 4990,
      paymentMethod: 'LINE Pay',
      paymentStatus: 'PAID',
      shippingMethod: '7-11 超商取貨 (鑫鑫門市)',
      shippingStatus: 'SHIPPED',
      trackingCode: 'CVS-7119028',
      invoiceNumber: 'AB-88291043',
      invoiceStatus: 'ISSUED',
      createdAt: '2026-11-05 14:15',
      items: [{ name: '智能主動降噪藍牙無線耳機 Pro (極光白 / 標準規格)', quantity: 1, price: 4990 }]
    },
    {
      id: 'ORD-761201',
      customerName: '張志豪',
      phone: '0922-111-222',
      amount: 1880,
      paymentMethod: 'ATM 虛擬帳號',
      paymentStatus: 'UNPAID',
      shippingMethod: '黑貓宅配',
      shippingStatus: 'PENDING',
      trackingCode: '',
      invoiceNumber: '',
      invoiceStatus: 'UNISSUED',
      createdAt: '2026-11-06 11:20',
      items: [{ name: '手沖細口不鏽鋼溫控快煮壺 (消光黑 / 800ml)', quantity: 1, price: 1880 }]
    }
  ])

  // 3. 會員列表 (AD-09, AD-01)
  const customers = ref([
    {
      id: 'CUST-001',
      name: '陳大文',
      email: 'chen***@gmail.com',
      phone: '0912-***-678', // 隱碼遮蔽
      totalSpent: 12500,
      orderCount: 4,
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

  // 4. 促銷活動規則 (AD-07)
  const coupons = ref([
    { code: 'SALE100', discount: 100, minSpend: 1000, active: true, expireAt: '2026-12-31' },
    { code: 'NEW2026', discount: 200, minSpend: 2000, active: true, expireAt: '2026-11-30' },
    { code: 'VIP500', discount: 500, minSpend: 5000, active: false, expireAt: '2026-10-31' }
  ])

  // OMS 動作：出貨標籤列印與物流狀態流轉 (AD-04, AD-05)
  const markAsShipped = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return
    if (order.paymentStatus !== 'PAID') {
      alert('該訂單尚未付款，無法執行出貨！')
      return
    }
    order.shippingStatus = 'SHIPPED'
    if (!order.trackingCode) {
      order.trackingCode = 'EXP-' + Math.floor(100000000 + Math.random() * 900000000)
    }
  }

  // 發票作廢 / 線上退款 (AD-06, AD-08)
  const refundAndVoidInvoice = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return
    if (confirm(`確定要針對訂單 ${orderId} 執行刷退與發票折讓/作廢？`)) {
      order.paymentStatus = 'REFUNDED'
      order.invoiceStatus = 'VOIDED'
      order.shippingStatus = 'CANCELLED'
      alert(`訂單 ${orderId} 已完成金流刷退，發票 ${order.invoiceNumber} 已向加值中心申請折讓。`)
    }
  }

  // 營運指標計算 (AD-10)
  const metrics = computed(() => {
    const totalGmv = orders.value
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.amount, 0)
    const paidCount = orders.value.filter(o => o.paymentStatus === 'PAID').length
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
    refundAndVoidInvoice
  }
})