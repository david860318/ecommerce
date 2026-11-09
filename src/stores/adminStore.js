import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'
import { useProductStore } from './productStore'
import { useCartStore } from './cartStore'

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore()
  const productStore = useProductStore()
  const cartStore = useCartStore()

  const currentAdmin = ref({
    username: 'admin@md-korea.com',
    name: '系統管理者'
  })

  const maskPhone = (phone) => phone || ''
  const maskName = (name) => name || ''

  const orders = ref([
    {
      id: 'ORD-20261106-01',
      customerName: '陳大文',
      phone: '0912345678',
      amount: 1480,
      paymentMethod: '信用卡 3D 一次付清',
      paymentStatus: 'PAID',
      shippingMethod: '7-11 超商取貨 (鑫鑫門市)',
      shippingType: 'CVS',
      shippingStatus: 'PENDING',
      trackingCode: '',
      invoiceNo: 'QQ-88219412',
      invoiceStatus: 'ISSUED',
      refundStatus: 'NONE',
      returnReason: '',
      createdAt: '2026-11-06 14:00',
      items: [
        { skuId: 'TOP-01-CRM-F', name: '法式極簡微抓皺鬆弛感雪紡襯衫 (奶油杏/FREE)', quantity: 1, price: 1480 }
      ]
    },
    {
      id: 'ORD-20261105-08',
      customerName: '王曉明',
      phone: '0922888123',
      amount: 2880,
      paymentMethod: 'LINE Pay',
      paymentStatus: 'PAID',
      shippingMethod: '黑貓宅配到府 (台北市信義區松仁路10號)',
      shippingType: 'HOME',
      shippingStatus: 'SHIPPED',
      trackingCode: 'TCAT-90218842',
      invoiceNo: 'QQ-88219413',
      invoiceStatus: 'ISSUED',
      refundStatus: 'NONE',
      returnReason: '',
      createdAt: '2026-11-05 09:30',
      items: [
        { skuId: 'OUT-02-MOC-S', name: '經典廓形雙排扣純羊毛短大衣 (摩卡咖/S)', quantity: 1, price: 2880 }
      ]
    },
    {
      id: 'ORD-20261102-03',
      customerName: '張美麗',
      phone: '0988666222',
      amount: 1480,
      paymentMethod: '信用卡 3D 一次付清',
      paymentStatus: 'PAID',
      shippingMethod: '黑貓宅配到府',
      shippingType: 'HOME',
      shippingStatus: 'DELIVERED',
      trackingCode: 'TCAT-90218841',
      invoiceNo: 'QQ-88219400',
      invoiceStatus: 'ISSUED',
      refundStatus: 'APPLIED',
      returnReason: '尺寸不合身，申請退貨',
      createdAt: '2026-11-02 10:10',
      items: [
        { skuId: 'DRS-04-BEI-F', name: '後開衩優雅垂墜直筒針織長裙 (燕麥杏/FREE)', quantity: 1, price: 1480 }
      ]
    }
  ])

  const generateShippingLabel = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    if (!order.trackingCode) {
      order.trackingCode = order.shippingType === 'CVS'
        ? 'CVS-' + Math.floor(10000000 + Math.random() * 90000000)
        : 'TCAT-' + Math.floor(10000000 + Math.random() * 90000000)
    }
    order.shippingStatus = 'SHIPPED'
    addAuditLog('產生出貨託運單', `訂單 ${orderId} 生成代碼 ${order.trackingCode} 並轉為已出貨`)
  }

  const markAsDelivered = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    order.shippingStatus = 'DELIVERED'
    authStore.rewardPointsForOrder(order)
    addAuditLog('訂單送達結案', `訂單 ${orderId} 標記已送達，自動派發回饋點數`)
  }

  const confirmReturnReceived = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    order.refundStatus = 'RECEIVED'
    order.items.forEach((item) => {
      productStore.products.forEach((p) => {
        const targetSku = p.skus.find((s) => s.skuId === item.skuId)
        if (targetSku) {
          targetSku.stock += item.quantity
          stockLogs.value.unshift({
            id: 'LOG-' + Date.now().toString().slice(-4),
            skuId: targetSku.skuId,
            productName: `${p.name} (${targetSku.color}/${targetSku.size})`,
            changeQty: +item.quantity,
            afterStock: targetSku.stock,
            reason: `退貨驗收入庫 (訂單 ${orderId})`,
            operator: currentAdmin.value.name,
            createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
          })
        }
      })
    })
    addAuditLog('退貨驗收入庫', `訂單 ${orderId} 檢驗無誤，庫存自動回補`)
    alert(`訂單 ${orderId} 商品驗收完成，庫存已自動回補！`)
  }

  const executeRefund = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    order.refundStatus = 'REFUNDED'
    order.shippingStatus = 'CANCELLED'
    order.invoiceStatus = 'ALLOWANCE'
    addAuditLog('執行金流退款', `訂單 ${orderId} 完成刷退，發票開立折讓單`)
    alert(`訂單 ${orderId} 款項已原路刷退，發票線上折讓已開立！`)
  }

  const voidInvoice = (orderId) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return
    order.invoiceStatus = 'VOID'
    addAuditLog('發票作廢', `訂單 ${orderId} 發票 ${order.invoiceNo} 標記作廢`)
    alert(`發票 ${order.invoiceNo} 已作廢！`)
  }

  const addNewCoupon = (couponData) => {
    const code = couponData.code.trim().toUpperCase()
    if (!code) return { success: false, message: '請輸入優惠代碼！' }
    const exists = cartStore.availableCoupons.some((c) => c.code === code)
    if (exists) return { success: false, message: '此優惠代碼已存在！' }

    const newCoupon = {
      code,
      title: couponData.title,
      description: couponData.description,
      type: couponData.type || 'FIXED',
      discountValue: Number(couponData.discountValue),
      minSpend: Number(couponData.minSpend || 0),
      targetCategory: couponData.targetCategory || 'ALL',
      startDate: couponData.startDate + ' 00:00:00',
      endDate: couponData.endDate + ' 23:59:59',
      isActive: true
    }
    cartStore.availableCoupons.unshift(newCoupon)
    addAuditLog('新增行銷優惠券', `建立代碼【${code}】: ${couponData.title}`)
    return { success: true, message: `優惠券【${code}】已成功建立並同步前台！` }
  }

  const stockLogs = ref([
    {
      id: 'LOG-5001',
      skuId: 'TOP-01-CRM-F',
      productName: '法式極簡雪紡襯衫 (奶油杏/FREE)',
      changeQty: -1,
      afterStock: 15,
      reason: '顧客結帳扣除 (訂單 ORD-20261106-01)',
      operator: '系統自動',
      createdAt: '2026-11-06 14:00'
    }
  ])

  const adjustProductStock = (productId, skuId, delta, reason) => {
    const p = productStore.getProductById(productId)
    if (!p) return
    const sku = p.skus.find((s) => s.skuId === skuId)
    if (!sku) return
    sku.stock += delta
    stockLogs.value.unshift({
      id: 'LOG-' + Date.now().toString().slice(-4),
      skuId: sku.skuId,
      productName: `${p.name} (${sku.color}/${sku.size})`,
      changeQty: delta,
      afterStock: sku.stock,
      reason: reason || '管理員手動調整',
      operator: currentAdmin.value.name,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    })
    addAuditLog('庫存手動調整', `規格 ${sku.skuId} 變更 ${delta}，現存 ${sku.stock}`)
  }

  const customers = ref([
    {
      id: 'CUST-001',
      name: '陳大文',
      phone: '0912345678',
      email: 'user@md-korea.com',
      tier: 'VIP 會員',
      ltv: 14850,
      orderCount: 8,
      lastLogin: '2026-11-06 12:40',
      tags: ['高頻回購', '熱愛外套'],
      isBlacklisted: false
    },
    {
      id: 'CUST-002',
      name: '黃小胖',
      phone: '0977112233',
      email: 'pang@test.com',
      tier: '一般會員',
      ltv: 890,
      orderCount: 1,
      lastLogin: '2026-10-20 09:15',
      tags: ['超商未取貨逾期'],
      isBlacklisted: true
    }
  ])

  const toggleCustomerBlacklist = (custId) => {
    const c = customers.value.find((u) => u.id === custId)
    if (!c) return
    c.isBlacklisted = !c.isBlacklisted
    addAuditLog('會員黑名單變更', `會員 ${c.name} 改為：${c.isBlacklisted ? '黑名單' : '正常'}`)
  }

  // 首頁 CMS 區塊定義
  const homeSections = ref([
    { id: 'banner', name: '首頁精選輪播 Banner', visible: true },
    { id: 'filter_bar', name: '分類篩選與即時搜尋欄位', visible: true },
    { id: 'product_grid', name: '當季熱銷商品展示網格 (Product Grid)', visible: true }
  ])

  const auditLogs = ref([
    {
      id: 'AUD-9001',
      operator: '系統管理者',
      ip: '220.133.45.92',
      action: '修改商品售價',
      detail: '更新「純羊毛短大衣」售價',
      createdAt: '2026-11-05 14:20'
    }
  ])

  const addAuditLog = (action, detail) => {
    auditLogs.value.unshift({
      id: 'AUD-' + Date.now().toString().slice(-6),
      operator: currentAdmin.value.name,
      ip: '220.133.45.92',
      action,
      detail,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    })
  }

  return {
    currentAdmin,
    maskPhone,
    maskName,
    orders,
    generateShippingLabel,
    markAsDelivered,
    confirmReturnReceived,
    executeRefund,
    voidInvoice,
    addNewCoupon,
    stockLogs,
    adjustProductStock,
    customers,
    toggleCustomerBlacklist,
    homeSections,
    auditLogs,
    addAuditLog
  }
})