import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './authStore'
import { useProductStore } from './productStore'

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore()
  const productStore = useProductStore()

  const getStorageKey = () => {
    return authStore.user?.isLoggedIn && authStore.user?.phone
      ? `md_cart_user_${authStore.user.phone}`
      : 'md_cart_guest'
  }

  const loadCartData = () => {
    const raw = localStorage.getItem(getStorageKey())
    return raw ? JSON.parse(raw) : []
  }

  const items = ref(loadCartData())
  const isDrawerOpen = ref(false)
  const FREE_SHIPPING_THRESHOLD = 1500
  const outOfStockItems = ref([])

  const availableCoupons = ref([
    {
      code: 'MD100',
      title: '秋冬新品現折 100',
      description: '全館單筆滿 NT$ 1,000 現折 NT$ 100',
      type: 'FIXED',
      discountValue: 100,
      minSpend: 1000,
      targetCategory: 'ALL',
      startDate: '2026-10-01 00:00:00',
      endDate: '2026-12-31 23:59:59',
      isActive: true
    },
    {
      code: 'OUTER200',
      title: '大衣外套限定折扣',
      description: '購買「Outer 外套」品類滿 NT$ 2,500 現折 NT$ 200',
      type: 'FIXED',
      discountValue: 200,
      minSpend: 2500,
      targetCategory: 'Outer 外套',
      startDate: '2026-11-01 00:00:00',
      endDate: '2026-11-30 23:59:59',
      isActive: true
    },
    {
      code: 'VIP90',
      title: 'VIP 專屬 9 折券',
      description: '全館滿 NT$ 2,000 享 9 折（最高折抵 NT$ 500）',
      type: 'PERCENT',
      discountValue: 10,
      maxDiscount: 500,
      minSpend: 2000,
      targetCategory: 'ALL',
      startDate: '2026-11-01 00:00:00',
      endDate: '2026-11-15 23:59:59',
      isActive: true
    }
  ])

  const appliedCoupon = ref(null)
  const usedPoints = ref(0) // 當前使用的點數

  watch(
    items,
    (val) => {
      localStorage.setItem(getStorageKey(), JSON.stringify(val))
      revalidateAppliedCoupon()
      // 當購物車品項異動導致上限降低時，自動修正已使用的點數
      if (usedPoints.value > maxPointsAllowed.value) {
        usedPoints.value = maxPointsAllowed.value
      }
    },
    { deep: true }
  )

  const toggleDrawer = (state) => {
    isDrawerOpen.value = typeof state === 'boolean' ? state : !isDrawerOpen.value
    if (isDrawerOpen.value) outOfStockItems.value = []
  }

  // 優惠券校驗
  const validateCoupon = (coupon, showDetailMessage = true) => {
    if (!coupon || !coupon.isActive) return { isValid: false, message: '無效優惠券' }
    const now = new Date()
    if (now < new Date(coupon.startDate)) return { isValid: false, message: '活動尚未開始' }
    if (now > new Date(coupon.endDate)) return { isValid: false, message: '優惠券已過期' }

    let eligibleSubtotal = 0
    if (coupon.targetCategory === 'ALL') {
      eligibleSubtotal = subtotal.value
    } else {
      eligibleSubtotal = items.value
        .filter((item) => {
          const p = productStore.getProductById(item.id)
          return p && p.category === coupon.targetCategory
        })
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    if (eligibleSubtotal === 0 && coupon.targetCategory !== 'ALL') {
      return { isValid: false, message: `購物車內無「${coupon.targetCategory}」品類商品` }
    }
    if (eligibleSubtotal < coupon.minSpend) {
      return { isValid: false, message: `未達最低門檻 NT$ ${coupon.minSpend.toLocaleString()}` }
    }
    return { isValid: true, eligibleSubtotal }
  }

  const applyCoupon = (couponCodeInput) => {
    const code = couponCodeInput.trim().toUpperCase()
    const target = availableCoupons.value.find((c) => c.code.toUpperCase() === code)
    if (!target) return { success: false, message: `找不到優惠代碼【${code}】` }
    const check = validateCoupon(target)
    if (!check.isValid) return { success: false, message: check.message }
    appliedCoupon.value = target
    return { success: true, message: `成功套用優惠代碼【${target.code}】！` }
  }

  const removeCoupon = () => { appliedCoupon.value = null }

  const revalidateAppliedCoupon = () => {
    if (!appliedCoupon.value) return
    const check = validateCoupon(appliedCoupon.value, false)
    if (!check.isValid) {
      const c = appliedCoupon.value.code
      appliedCoupon.value = null
      alert(`購物車金額異動，原優惠券【${c}】已不符合使用條件，已自動移除。`)
    }
  }

  const discountAmount = computed(() => {
    if (!appliedCoupon.value) return 0
    const coupon = appliedCoupon.value
    const check = validateCoupon(coupon, false)
    if (!check.isValid) return 0
    let discount = 0
    if (coupon.type === 'FIXED') {
      discount = coupon.discountValue
    } else if (coupon.type === 'PERCENT') {
      discount = Math.round(check.eligibleSubtotal * (coupon.discountValue / 100))
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    }
    return Math.min(discount, check.eligibleSubtotal)
  })

  // ==================== 點數折抵上限與校驗核心 (ST-11 規範 1) ====================
  // 最高折抵上限：扣除優惠券後商品小計的 20%，且不得高於會員目前擁有的點數餘額
  const maxPointsAllowed = computed(() => {
    const memberPoints = authStore.user?.points || 0
    const eligibleAmount = Math.max(0, subtotal.value - discountAmount.value)
    // 總額 20% 上限 (四捨五入整數點)
    const ruleCap = Math.floor(eligibleAmount * 0.2)
    return Math.min(memberPoints, ruleCap)
  })

  // 設定並驗證折抵點數
  const setUsedPoints = (inputPoints) => {
    const pts = Math.floor(Number(inputPoints) || 0)
    if (pts < 0) {
      usedPoints.value = 0
      return { success: false, message: '折抵點數不能為負數！' }
    }
    const cap = maxPointsAllowed.value
    if (pts > cap) {
      usedPoints.value = cap
      return {
        success: false,
        adjusted: true,
        message: `已自動調整為最高折抵上限：${cap} 點（扣除優惠券後總額之 20% 與現有餘額上限）`
      }
    }
    usedPoints.value = pts
    return { success: true, message: `已成功套用紅利折抵 ${pts} 點！` }
  }

  const updateQuantity = (skuId, delta) => {
    const item = items.value.find((i) => i.skuId === skuId)
    if (!item) return
    const currentStock = getLatestStock(item.id, skuId)
    const nextQuantity = item.quantity + delta
    if (nextQuantity > currentStock) {
      alert(`已達庫存上限（目前僅剩 ${currentStock} 件）`)
      return
    }
    if (nextQuantity <= 0) {
      removeFromCart(skuId)
      return
    }
    item.quantity = nextQuantity
    if (item.quantity <= currentStock) {
      outOfStockItems.value = outOfStockItems.value.filter((id) => id !== skuId)
    }
  }

  const removeFromCart = (skuId) => {
    items.value = items.value.filter((i) => i.skuId !== skuId)
    outOfStockItems.value = outOfStockItems.value.filter((id) => id !== skuId)
    if (items.value.length === 0) {
      removeCoupon()
      usedPoints.value = 0
    }
  }

  const clearCart = () => {
    items.value = []
    removeCoupon()
    usedPoints.value = 0
    outOfStockItems.value = []
    localStorage.removeItem(getStorageKey())
  }

  const addToCart = (product, sku, quantity = 1) => {
    if (!sku || sku.stock <= 0) return { success: false, message: '該規格已無庫存！' }
    const existing = items.value.find((i) => i.skuId === sku.skuId)
    if (existing) {
      if (existing.quantity + quantity > sku.stock) {
        return { success: false, message: `庫存不足！該款式目前最多僅剩 ${sku.stock} 件。` }
      }
      existing.quantity += quantity
    } else {
      items.value.push({
        id: product.id,
        skuId: sku.skuId,
        name: product.name,
        skuName: `${sku.color} / ${sku.size}`,
        price: sku.price,
        quantity,
        maxStock: sku.stock,
        image: product.image
      })
    }
    toggleDrawer(true)
    return { success: true }
  }

  const getLatestStock = (productId, skuId) => {
    const product = productStore.getProductById(productId)
    if (!product) return 0
    const sku = product.skus.find((s) => s.skuId === skuId)
    return sku ? sku.stock : 0
  }

  const validateCartInventory = () => {
    const errors = []
    outOfStockItems.value = []
    items.value.forEach((item) => {
      const currentStock = getLatestStock(item.id, item.skuId)
      if (currentStock <= 0) {
        errors.push({ skuId: item.skuId, name: item.name, skuName: item.skuName, reason: '商品已斷貨售完' })
        outOfStockItems.value.push(item.skuId)
      } else if (item.quantity > currentStock) {
        errors.push({ skuId: item.skuId, name: item.name, skuName: item.skuName, reason: `庫存不足僅剩 ${currentStock} 件` })
        outOfStockItems.value.push(item.skuId)
      }
    })
    return { isValid: errors.length === 0, errors }
  }

  const totalCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const shippingFee = computed(() =>
    subtotal.value >= FREE_SHIPPING_THRESHOLD || subtotal.value === 0 ? 0 : 80
  )
  const remainingForFreeShipping = computed(() =>
    Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value)
  )

  // 實付總額保證不為負數 (ST-09 / ST-11)
  const total = computed(() => {
    const discounted = Math.max(0, subtotal.value - discountAmount.value - usedPoints.value)
    return discounted + shippingFee.value
  })

  return {
    items,
    isDrawerOpen,
    availableCoupons,
    appliedCoupon,
    discountAmount,
    usedPoints,
    maxPointsAllowed,
    outOfStockItems,
    FREE_SHIPPING_THRESHOLD,
    totalCount,
    subtotal,
    shippingFee,
    remainingForFreeShipping,
    total,
    toggleDrawer,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    setUsedPoints,
    getLatestStock,
    validateCartInventory
  }
})