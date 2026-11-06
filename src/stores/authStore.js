import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const savedUser = localStorage.getItem('md_korea_user')
  const defaultUser = {
    isLoggedIn: true,
    name: '陳大文',
    phone: '0912345678',
    email: 'admin@md-korea.com',
    role: 'admin', // 統一為管理員
    tier: 'VIP MEMBER',
    points: 250,
    pointsHistory: [],
    addresses: [
      {
        id: 1,
        recipient: '陳大文',
        phone: '0912345678',
        address: '台北市大安區忠孝東路四段 100 號 5 樓',
        isDefault: true
      }
    ],
    wishlist: [1, 2],
    restockRequests: []
  }

  const user = ref(savedUser ? JSON.parse(savedUser) : defaultUser)

  watch(
    user,
    (val) => {
      localStorage.setItem('md_korea_user', JSON.stringify(val))
    },
    { deep: true }
  )

  // 統一具備管理者權限
  const isAdmin = computed(() => true)

  const otpCountdown = ref(0)
  let otpTimer = null

  const sendOtp = (phone) => {
    if (!/^09\d{8}$/.test(phone)) {
      return { success: false, message: '請輸入正確的台灣手機號碼 (09xxxxxxxx)！' }
    }
    if (otpCountdown.value > 0) {
      return { success: false, message: `請等候 ${otpCountdown.value} 秒後再試。` }
    }
    otpCountdown.value = 60
    if (otpTimer) clearInterval(otpTimer)
    otpTimer = setInterval(() => {
      otpCountdown.value--
      if (otpCountdown.value <= 0) clearInterval(otpTimer)
    }, 1000)
    return { success: true, message: `驗證碼已發送至 ${phone}！（預設驗證碼：123456）` }
  }

  const verifyLogin = (phone, inputOtp) => {
    if (inputOtp !== '123456') {
      return { success: false, message: '驗證碼錯誤！' }
    }
    user.value.isLoggedIn = true
    user.value.name = '管理者 ' + phone.slice(-4)
    user.value.phone = phone
    user.value.email = `${phone}@md-korea.com`
    user.value.role = 'admin'
    return { success: true, message: '登入成功！' }
  }

  const loginWithPassword = (account, password) => {
    user.value.isLoggedIn = true
    user.value.name = account.includes('@') ? account.split('@')[0] : '管理者'
    user.value.phone = account.startsWith('09') ? account : '0912345678'
    user.value.email = account.includes('@') ? account : `${account}@md-korea.com`
    user.value.role = 'admin'
    return { success: true, message: '登入成功！' }
  }

  const loginWithOAuth = (provider) => {
    user.value.isLoggedIn = true
    user.value.name = `${provider.toUpperCase()} 管理者`
    user.value.email = `${provider}@md-korea.com`
    user.value.role = 'admin'
    return { success: true, message: `${provider.toUpperCase()} 授權登入成功！` }
  }

  const logout = () => {
    user.value = {
      isLoggedIn: false,
      name: '訪客',
      phone: '',
      email: '',
      role: 'guest',
      tier: '一般會員',
      points: 0,
      pointsHistory: [],
      addresses: [],
      wishlist: [],
      restockRequests: []
    }
    localStorage.removeItem('md_korea_user')
  }

  const deductPoints = (amount, orderId) => {
    if (amount <= 0) return true
    if (user.value.points < amount) return false
    user.value.points -= amount
    if (!user.value.pointsHistory) user.value.pointsHistory = []
    user.value.pointsHistory.unshift({
      id: 'PTS-' + Date.now().toString().slice(-6),
      type: 'SPEND',
      amount: -amount,
      balance: user.value.points,
      title: '訂單結帳點數折抵',
      orderId,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    })
    return true
  }

  const rewardPointsForOrder = (order) => {
    if (!user.value.isLoggedIn) return
    if (!user.value.pointsHistory) user.value.pointsHistory = []
    const alreadyRewarded = user.value.pointsHistory.some(
      (h) => h.orderId === order.id && h.type === 'EARN'
    )
    if (alreadyRewarded) return
    const earnedPoints = Math.floor(order.amount / 100)
    if (earnedPoints <= 0) return
    user.value.points += earnedPoints
    user.value.pointsHistory.unshift({
      id: 'PTS-' + Date.now().toString().slice(-6),
      type: 'EARN',
      amount: earnedPoints,
      balance: user.value.points,
      title: '消費滿額回饋點數 (1%)',
      orderId: order.id,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    })
  }

  const toggleWishlist = (productId) => {
    if (!user.value.isLoggedIn) {
      return { success: false, requireLogin: true, message: '請先登入會員以收藏商品！' }
    }
    if (!user.value.wishlist) user.value.wishlist = []
    const idx = user.value.wishlist.indexOf(productId)
    if (idx > -1) {
      user.value.wishlist.splice(idx, 1)
      return { success: true, added: false, message: '已從願望清單中移除。' }
    } else {
      user.value.wishlist.push(productId)
      return { success: true, added: true, message: '已加入您的願望清單！' }
    }
  }

  const isInWishlist = (productId) => {
    return user.value.isLoggedIn && (user.value.wishlist || []).includes(productId)
  }

  const registerRestockAlert = (product, sku, contact = {}) => {
    if (!user.value.isLoggedIn) {
      return { success: false, requireLogin: true, message: '請先登入會員！' }
    }
    if (!user.value.restockRequests) user.value.restockRequests = []
    const existing = user.value.restockRequests.find((r) => r.skuId === sku.skuId)
    if (existing) {
      return { success: false, message: '您已經登記過此規格的補貨提醒囉！' }
    }
    const email = contact.email || user.value.email
    const phone = contact.phone || user.value.phone
    user.value.restockRequests.unshift({
      id: 'REQ-' + Date.now().toString().slice(-6),
      productId: product.id,
      productName: product.name,
      skuId: sku.skuId,
      skuName: `${sku.color} / ${sku.size}`,
      email,
      phone,
      status: 'PENDING',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    })
    return { success: true, message: `補貨登記成功！到貨時將通知 ${email}。` }
  }

  const cancelRestockAlert = (requestId) => {
    user.value.restockRequests = user.value.restockRequests.filter((r) => r.id !== requestId)
    return { success: true, message: '已取消補貨提醒通知登記。' }
  }

  return {
    user,
    isAdmin,
    otpCountdown,
    sendOtp,
    verifyLogin,
    loginWithPassword,
    loginWithOAuth,
    logout,
    deductPoints,
    rewardPointsForOrder,
    toggleWishlist,
    isInWishlist,
    registerRestockAlert,
    cancelRestockAlert
  }
})