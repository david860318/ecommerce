import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useCartStore = defineStore('cart', () => {
  // 從 LocalStorage 載入初始值
  const savedCart = localStorage.getItem('shopflow_cart')
  const items = ref(savedCart ? JSON.parse(savedCart) : [])
  const isDrawerOpen = ref(false)
  const couponCode = ref('')
  const discountAmount = ref(0)
  const usedPoints = ref(0) // 使用點數折抵
  const FREE_SHIPPING_THRESHOLD = 1500

  // 監聽購物車異動並自動持久化至 LocalStorage
  watch(
    items,
    (newItems) => {
      localStorage.setItem('shopflow_cart', JSON.stringify(newItems))
    },
    { deep: true }
  )

  const toggleDrawer = (state) => {
    isDrawerOpen.value = typeof state === 'boolean' ? state : !isDrawerOpen.value
  }

  const addToCart = (product, sku, quantity = 1) => {
    if (!sku || sku.stock <= 0) {
      return { success: false, message: '該規格商品已售完！' }
    }

    const existing = items.value.find((item) => item.skuId === sku.skuId)
    if (existing) {
      if (existing.quantity + quantity > sku.stock) {
        return { success: false, message: `庫存不足！該規格最多僅能選購 ${sku.stock} 件。` }
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
        image: product.image,
        selected: true // 預設勾選結帳
      })
    }
    toggleDrawer(true)
    return { success: true }
  }

  const updateQuantity = (skuId, delta) => {
    const item = items.value.find((i) => i.skuId === skuId)
    if (!item) return
    const nextQty = item.quantity + delta
    if (nextQty > item.maxStock) {
      alert(`已達庫存上限（最多 ${item.maxStock} 件）`)
      return
    }
    item.quantity = nextQty
    if (item.quantity <= 0) {
      removeFromCart(skuId)
    }
  }

  const removeFromCart = (skuId) => {
    items.value = items.value.filter((i) => i.skuId !== skuId)
    if (items.value.length === 0) {
      clearCoupon()
      usedPoints.value = 0
    }
  }

  const clearCoupon = () => {
    couponCode.value = ''
    discountAmount.value = 0
  }

  const clearCart = () => {
    items.value = []
    clearCoupon()
    usedPoints.value = 0
    localStorage.removeItem('shopflow_cart')
  }

  // 套用折扣碼
  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase()
    if (normalized === 'SALE100') {
      if (subtotal.value < 1000) {
        return { success: false, message: '【SALE100】折抵門檻需滿 NT$ 1,000！' }
      }
      discountAmount.value = 100
      couponCode.value = 'SALE100'
      return { success: true, message: '折扣碼已生效，現折 NT$ 100！' }
    }
    return { success: false, message: '無效或已過期的優惠代碼。' }
  }

  // 設定點數折抵
  const setUsedPoints = (points, maxAvailable) => {
    const maxAllowed = Math.min(maxAvailable, Math.floor(subtotal.value * 0.3)) // 最高折抵 30%
    if (points > maxAllowed) {
      usedPoints.value = maxAllowed
      return { success: false, message: `點數折抵不可超過訂單 30% (上限 ${maxAllowed} 點)` }
    }
    usedPoints.value = Math.max(0, points)
    return { success: true }
  }

  // 計算選中項目的金額
  const selectedItems = computed(() => items.value.filter((i) => i.selected !== false))
  const totalCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotal = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const shippingFee = computed(() => (subtotal.value >= FREE_SHIPPING_THRESHOLD || subtotal.value === 0) ? 0 : 80)
  const remainingForFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value))
  const total = computed(() => Math.max(0, subtotal.value + shippingFee.value - discountAmount.value - usedPoints.value))

  return {
    items,
    selectedItems,
    isDrawerOpen,
    couponCode,
    discountAmount,
    usedPoints,
    FREE_SHIPPING_THRESHOLD,
    toggleDrawer,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearCoupon,
    applyCoupon,
    setUsedPoints,
    totalCount,
    subtotal,
    shippingFee,
    remainingForFreeShipping,
    total
  }
})