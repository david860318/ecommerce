import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAdmin = ref(true)

  const user = ref({
    isLoggedIn: true,
    id: 'CUST-001',
    name: '陳大文',
    phone: '0912345678',
    email: 'user@md-korea.com',
    tier: 'VIP MEMBER',
    points: 1250,
    wishlist: [1, 2],
    restockRequests: [],
    pointsHistory: [
      { id: 'PH-01', title: '完成訂單回饋贈點 (2%)', orderId: 'ORD-20261105-08', amount: 58, balance: 1250, createdAt: '2026-11-05 14:00' },
      { id: 'PH-02', title: '新會員註冊歡迎禮', orderId: '', amount: 500, balance: 1192, createdAt: '2026-10-01 10:00' }
    ],
    // 常用收件地址清單
    savedAddresses: [
      {
        id: 'ADDR-1',
        recipientName: '陳大文',
        phone: '0912345678',
        type: 'HOME', // HOME: 宅配 | CVS: 超商門市
        city: '台北市',
        district: '信義區',
        detail: '松仁路 100 號 12 樓',
        cvsName: '',
        cvsCode: '',
        isDefault: true
      },
      {
        id: 'ADDR-2',
        recipientName: '陳大文 (代收)',
        phone: '0912345678',
        type: 'CVS',
        city: '台北市',
        district: '大安區',
        detail: '',
        cvsName: '7-11 鑫鑫門市',
        cvsCode: '991234',
        isDefault: false
      }
    ]
  })

  // 1. 修改會員基本資料
  const updateProfile = (profileData) => {
    if (!profileData.name || !profileData.phone) {
      return { success: false, message: '姓名與手機號碼為必填！' }
    }
    user.value.name = profileData.name.trim()
    user.value.phone = profileData.phone.trim()
    user.value.email = (profileData.email || '').trim()
    return { success: true, message: '會員基本資料已成功更新！' }
  }

  // 2. 常用地址簿管理：新增常用地址
  const addAddress = (addrData) => {
    const newId = 'ADDR-' + Date.now().toString().slice(-4)
    const isFirst = user.value.savedAddresses.length === 0
    const shouldBeDefault = Boolean(addrData.isDefault || isFirst)

    if (shouldBeDefault) {
      user.value.savedAddresses.forEach(a => a.isDefault = false)
    }

    const newAddr = {
      id: newId,
      recipientName: addrData.recipientName.trim(),
      phone: addrData.phone.trim(),
      type: addrData.type || 'HOME',
      city: addrData.city || '',
      district: addrData.district || '',
      detail: addrData.detail || '',
      cvsName: addrData.cvsName || '',
      cvsCode: addrData.cvsCode || '',
      isDefault: shouldBeDefault
    }

    user.value.savedAddresses.unshift(newAddr)
    return { success: true, message: '常用地址已成功新增！' }
  }

  // 3. 常用地址簿管理：修改常用地址
  const updateAddress = (addrId, addrData) => {
    const idx = user.value.savedAddresses.findIndex(a => a.id === addrId)
    if (idx === -1) return { success: false, message: '找不到該地址' }

    if (addrData.isDefault) {
      user.value.savedAddresses.forEach(a => a.isDefault = false)
    }

    user.value.savedAddresses[idx] = {
      ...user.value.savedAddresses[idx],
      recipientName: addrData.recipientName.trim(),
      phone: addrData.phone.trim(),
      type: addrData.type || 'HOME',
      city: addrData.city || '',
      district: addrData.district || '',
      detail: addrData.detail || '',
      cvsName: addrData.cvsName || '',
      cvsCode: addrData.cvsCode || '',
      isDefault: Boolean(addrData.isDefault)
    }
    return { success: true, message: '收件地址已更新！' }
  }

  // 4. 刪除常用地址
  const deleteAddress = (addrId) => {
    const idx = user.value.savedAddresses.findIndex(a => a.id === addrId)
    if (idx !== -1) {
      const isDefault = user.value.savedAddresses[idx].isDefault
      user.value.savedAddresses.splice(idx, 1)
      if (isDefault && user.value.savedAddresses.length > 0) {
        user.value.savedAddresses[0].isDefault = true
      }
      return { success: true, message: '收件地址已刪除！' }
    }
    return { success: false, message: '找不到該地址' }
  }

  // 5. 設為預設地址
  const setDefaultAddress = (addrId) => {
    user.value.savedAddresses.forEach(a => {
      a.isDefault = a.id === addrId
    })
    return { success: true, message: '已設為結帳預設收件地址！' }
  }

  // 願望清單
  const isInWishlist = (productId) => user.value?.wishlist?.includes(Number(productId)) || false
  const toggleWishlist = (productId) => {
    const pId = Number(productId)
    const idx = user.value.wishlist.indexOf(pId)
    if (idx > -1) {
      user.value.wishlist.splice(idx, 1)
      return { success: true, message: '已從願望清單移除' }
    } else {
      user.value.wishlist.push(pId)
      return { success: true, message: '已加入願望清單 ❤️' }
    }
  }

  // 補貨登記
  const registerRestockAlert = (product, sku, formData) => {
    const exists = user.value.restockRequests.some(r => r.skuId === sku.skuId)
    if (exists) return { success: false, message: '您已登記過此規格的補貨提醒！' }
    user.value.restockRequests.push({
      id: 'RESTOCK-' + Date.now().toString().slice(-4),
      productId: product.id,
      productName: product.name,
      skuId: sku.skuId,
      skuName: `${sku.color} / ${sku.size}`,
      email: formData.email,
      phone: formData.phone,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    })
    return { success: true, message: '補貨登記成功！到貨時系統將優先發信通知。' }
  }

  const cancelRestockAlert = (id) => {
    const idx = user.value.restockRequests.findIndex(r => r.id === id)
    if (idx > -1) {
      user.value.restockRequests.splice(idx, 1)
      return { success: true, message: '已取消補貨提醒' }
    }
    return { success: false }
  }

  const rewardPointsForOrder = (order) => {
    const pts = Math.round(order.amount * 0.02)
    user.value.points += pts
    user.value.pointsHistory.unshift({
      id: 'PH-' + Date.now().toString().slice(-4),
      title: '完成訂單贈點 (2%)',
      orderId: order.id,
      amount: pts,
      balance: user.value.points,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    })
  }

  const logout = () => {
    user.value.isLoggedIn = false
  }

  return {
    isAdmin,
    user,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isInWishlist,
    toggleWishlist,
    registerRestockAlert,
    cancelRestockAlert,
    rewardPointsForOrder,
    logout
  }
})