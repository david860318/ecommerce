import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref({
    isLoggedIn: false,
    name: '訪客用戶',
    phone: '',
    email: '',
    tier: '一般會員',
    points: 120, // 點數儲備 (ST-10)
    addresses: [
      { id: 1, recipient: '陳大文', phone: '0912345678', address: '台北市大安區忠孝東路四段 100 號 5 樓', isDefault: true },
      { id: 2, recipient: '陳大文 (公司)', phone: '0912345678', address: '台北市信義區松仁路 32 號 8 樓', isDefault: false }
    ],
    wishlist: [1, 2] // 願望清單商品 ID (ST-09)
  })

  // OTP 倒數狀態 (AC: ST-01)
  const otpCountdown = ref(0)
  let otpTimer = null

  const startOtpTimer = () => {
    otpCountdown.value = 60
    if (otpTimer) clearInterval(otpTimer)
    otpTimer = setInterval(() => {
      otpCountdown.value--
      if (otpCountdown.value <= 0) {
        clearInterval(otpTimer)
      }
    }, 1000)
  }

  // 發送 OTP
  const sendOtp = (phone) => {
    const phoneRegex = /^09\d{8}$/
    if (!phoneRegex.test(phone)) {
      return { success: false, message: '手機號碼格式不符，請輸入台灣 09 開頭 10 碼電話。' }
    }
    startOtpTimer()
    return { success: true, message: '驗證碼已發送至手機！(模擬驗證碼：123456)' }
  }

  // 驗證登入
  const verifyLogin = (phone, otpCode) => {
    if (otpCode !== '123456') {
      return { success: false, message: '驗證碼錯誤，請重新輸入 (測試碼：123456)' }
    }
    user.value.isLoggedIn = true
    user.value.name = '陳大文'
    user.value.phone = phone
    user.value.email = 'user@shopflow.tw'
    return { success: true, message: '登入成功！' }
  }

  const logout = () => {
    user.value.isLoggedIn = false
    user.value.phone = ''
  }

  // 願望清單切換 (ST-09)
  const toggleWishlist = (productId) => {
    const idx = user.value.wishlist.indexOf(productId)
    if (idx > -1) {
      user.value.wishlist.splice(idx, 1)
      return { added: false, message: '已從願望清單移除' }
    } else {
      user.value.wishlist.push(productId)
      return { added: true, message: '已加入願望清單！' }
    }
  }

  const isInWishlist = (productId) => user.value.wishlist.includes(productId)

  // 新增地址簿 (ST-02)
  const addAddress = (addressObj) => {
    if (user.value.addresses.length >= 5) {
      return { success: false, message: '地址簿最多僅能儲存 5 組常用地址。' }
    }
    user.value.addresses.push({
      id: Date.now(),
      ...addressObj,
      isDefault: user.value.addresses.length === 0
    })
    return { success: true, message: '常用地址已新增' }
  }

  return {
    user,
    otpCountdown,
    sendOtp,
    verifyLogin,
    logout,
    toggleWishlist,
    isInWishlist,
    addAddress
  }
})