import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 從 LocalStorage 載入初始值，若無則採用預設範例會員資料
  const savedUser = localStorage.getItem('shopflow_user')
  const defaultUser = {
    isLoggedIn: true,
    name: '陳大文',
    phone: '0912345678',
    email: 'david.chen@shopflow.tw',
    tier: 'VIP 會員',
    points: 150,
    authProvider: 'local', // local, phone, password, google, line
    addresses: [
      {
        id: 1,
        recipient: '陳大文',
        phone: '0912345678',
        address: '台北市大安區忠孝東路四段 100 號 5 樓',
        isDefault: true
      },
      {
        id: 2,
        recipient: '陳大文 (公司)',
        phone: '0912345678',
        address: '台北市信義區松仁路 32 號 8 樓',
        isDefault: false
      }
    ],
    wishlist: [1, 2] // 收藏商品 ID 清單
  }

  const user = ref(savedUser ? JSON.parse(savedUser) : defaultUser)

  // 監聽狀態異動並自動同步回 LocalStorage
  watch(
    user,
    (val) => {
      localStorage.setItem('shopflow_user', JSON.stringify(val))
    },
    { deep: true }
  )

  // OTP 驗證狀態 (AC: ST-01: 60 秒冷卻、5 分鐘有效期)
  const otpCountdown = ref(0)
  const otpGeneratedTime = ref(null) // 發送時間戳記
  const currentOtpCode = ref('')
  let otpTimer = null

  // 1. 發送 6 碼 OTP 驗證碼
  const sendOtp = (phone) => {
    const phoneRegex = /^09\d{8}$/
    if (!phoneRegex.test(phone)) {
      return { success: false, message: '手機號碼格式不正確，請輸入 09 開頭共 10 碼電話！' }
    }

    if (otpCountdown.value > 0) {
      return { success: false, message: `請稍候 ${otpCountdown.value} 秒後再重新發送驗證碼！` }
    }

    // 產生隨機 6 碼數字
    currentOtpCode.value = Math.floor(100000 + Math.random() * 900000).toString()
    otpGeneratedTime.value = Date.now()

    // 啟動 60 秒冷卻倒數
    otpCountdown.value = 60
    if (otpTimer) clearInterval(otpTimer)
    otpTimer = setInterval(() => {
      otpCountdown.value--
      if (otpCountdown.value <= 0) {
        clearInterval(otpTimer)
      }
    }, 1000)

    return {
      success: true,
      code: currentOtpCode.value,
      message: `驗證碼已發送至 ${phone}！\n【ShopFlow 驗證碼：${currentOtpCode.value}】（5 分鐘內有效）`
    }
  }

  // 2. 驗證 OTP 登入
  const verifyLogin = (phone, inputOtp) => {
    if (!currentOtpCode.value) {
      return { success: false, message: '尚未發送驗證碼，請先點擊發送！' }
    }

    // 檢查 5 分鐘（300 秒）有效期限 (AC: ST-01)
    const now = Date.now()
    if (now - otpGeneratedTime.value > 5 * 60 * 1000) {
      currentOtpCode.value = ''
      return { success: false, message: '驗證碼已過期（超過 5 分鐘），請重新發送！' }
    }

    if (inputOtp !== currentOtpCode.value) {
      return { success: false, message: '驗證碼輸入錯誤，請確認後重新輸入！' }
    }

    // 登入成功寫入
    user.value.isLoggedIn = true
    user.value.name = '會員 (' + phone.slice(-4) + ')'
    user.value.phone = phone
    user.value.email = `${phone}@shopflow.tw`
    user.value.authProvider = 'phone'
    currentOtpCode.value = ''
    return { success: true, message: '手機 OTP 驗證成功，歡迎回來！' }
  }

  // 3. 密碼強度驗證：至少 8 碼，含大小寫英文字母與數字 (AC: ST-01)
  const validatePasswordStrength = (pwd) => {
    if (pwd.length < 8) return false
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNum = /[0-9]/.test(pwd)
    return hasUpper && hasLower && hasNum
  }

  // 4. 帳號密碼註冊 / 登入
  const loginWithPassword = (account, password) => {
    if (!validatePasswordStrength(password)) {
      return {
        success: false,
        message: '密碼強度不足！需至少 8 碼，並同時包含英文大寫字母、英文小寫字母與數字。'
      }
    }
    user.value.isLoggedIn = true
    user.value.name = account.includes('@') ? account.split('@')[0] : '會員'
    user.value.phone = account.startsWith('09') ? account : '0912345678'
    user.value.email = account.includes('@') ? account : `${account}@shopflow.tw`
    user.value.authProvider = 'password'
    return { success: true, message: '帳號密碼驗證通過，登入成功！' }
  }

  // 5. 第三方 Google / LINE OAuth 授權模擬建檔登入 (AC: ST-01)
  const loginWithOAuth = (provider) => {
    user.value.isLoggedIn = true
    user.value.authProvider = provider

    if (provider === 'google') {
      user.value.name = 'Google 使用者'
      user.value.email = 'google.user@gmail.com'
      user.value.phone = '0988-123-456'
    } else if (provider === 'line') {
      user.value.name = 'LINE 好友'
      user.value.email = 'line.user@line.me'
      user.value.phone = '0977-654-321'
    }

    return {
      success: true,
      message: `${provider.toUpperCase()} 授權成功！系統已自動完成會員綁定與建檔登入。`
    }
  }

  // 6. 更新個人資料 (AC: ST-02)
  const updateProfile = (name, email) => {
    user.value.name = name
    user.value.email = email
    return { success: true, message: '個人基本資料已更新！' }
  }

  // 7. 地址簿維護：上限 5 組、設為預設 (AC: ST-02)
  const addAddress = (addr) => {
    if (user.value.addresses.length >= 5) {
      return {
        success: false,
        message: '地址簿最多僅能儲存 5 組常用地址！請刪除不需要的地址後再新增。'
      }
    }
    const isDefault = user.value.addresses.length === 0 || !!addr.isDefault
    if (isDefault) {
      user.value.addresses.forEach((a) => (a.isDefault = false))
    }
    user.value.addresses.push({
      id: Date.now(),
      recipient: addr.recipient,
      phone: addr.phone,
      address: addr.address,
      isDefault
    })
    return { success: true, message: '常用地址已新增！' }
  }

  const updateAddress = (id, updated) => {
    const idx = user.value.addresses.findIndex((a) => a.id === id)
    if (idx === -1) return { success: false, message: '查無此地址' }
    if (updated.isDefault) {
      user.value.addresses.forEach((a) => (a.isDefault = false))
    }
    user.value.addresses[idx] = { ...user.value.addresses[idx], ...updated }
    return { success: true, message: '地址資料已更新！' }
  }

  const removeAddress = (id) => {
    const target = user.value.addresses.find((a) => a.id === id)
    user.value.addresses = user.value.addresses.filter((a) => a.id !== id)
    // 若刪除的是預設地址且還有其他地址，自動將第一筆設為預設
    if (target?.isDefault && user.value.addresses.length > 0) {
      user.value.addresses[0].isDefault = true
    }
    return { success: true, message: '常用地址已刪除' }
  }

  const setDefaultAddress = (id) => {
    user.value.addresses.forEach((a) => {
      a.isDefault = a.id === id
    })
    return { success: true, message: '已設為預設配送地址' }
  }

  // 8. 願望清單收藏切換 (AC: ST-09)
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

  // 9. 登出機制：清除狀態與 LocalStorage
  const logout = () => {
    user.value = {
      isLoggedIn: false,
      name: '訪客用戶',
      phone: '',
      email: '',
      tier: '一般會員',
      points: 0,
      authProvider: 'local',
      addresses: [],
      wishlist: []
    }
    localStorage.removeItem('shopflow_user')
  }

  return {
    user,
    otpCountdown,
    sendOtp,
    verifyLogin,
    validatePasswordStrength,
    loginWithPassword,
    loginWithOAuth,
    updateProfile,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    toggleWishlist,
    isInWishlist,
    logout
  }
})