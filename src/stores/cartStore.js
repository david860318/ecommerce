import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([]) // 項目結構: { id, skuId, name, skuName, price, quantity, maxStock, image }
  const isDrawerOpen = ref(false)
  const couponCode = ref('')
  const discountAmount = ref(0)
  const FREE_SHIPPING_THRESHOLD = 1500

  const toggleDrawer = (state) => {
    isDrawerOpen.value = typeof state === 'boolean' ? state : !isDrawerOpen.value
  }

  const addToCart = (product, sku, quantity = 1) => {
    if (!sku || sku.stock <= 0) {
      return { success: false, message: '該規格商品已售完，無法加入購物車！' }
    }

    const existing = items.value.find(item => item.skuId === sku.skuId)
    if (existing) {
      if (existing.quantity + quantity > sku.stock) {
        return { success: false, message: `庫存不足！該規格目前最多僅能選購 ${sku.stock} 件。` }
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

  const updateQuantity = (skuId, delta) => {
    const item = items.value.find(i => i.skuId === skuId)
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
    items.value = items.value.filter(i => i.skuId !== skuId)
    if (items.value.length === 0) {
      clearCoupon()
    }
  }

  const clearCoupon = () => {
    couponCode.value = ''
    discountAmount.value = 0
  }

  const clearCart = () => {
    items.value = []
    clearCoupon()
  }

  // 驗證折扣代碼門檻 (AC: ST-08)
  const applyCoupon = (code) => {
    const normalized = code.trim().toUpperCase()
    if (normalized === 'SALE100') {
      if (subtotal.value < 1000) {
        return { success: false, message: '【SALE100】折抵門檻需滿 NT$ 1,000，目前金額尚未達標。' }
      }
      discountAmount.value = 100
      couponCode.value = 'SALE100'
      return { success: true, message: '折扣碼已生效，現折 NT$ 100！' }
    }
    return { success: false, message: '無效或已過期的優惠代碼。' }
  }

  const totalCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const shippingFee = computed(() => (subtotal.value >= FREE_SHIPPING_THRESHOLD || subtotal.value === 0) ? 0 : 80)
  const remainingForFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value))
  const total = computed(() => Math.max(0, subtotal.value + shippingFee.value - discountAmount.value))

  return {
    items,
    isDrawerOpen,
    couponCode,
    discountAmount,
    FREE_SHIPPING_THRESHOLD,
    toggleDrawer,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    clearCoupon,
    applyCoupon,
    totalCount,
    subtotal,
    shippingFee,
    remainingForFreeShipping,
    total
  }
})