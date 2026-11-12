import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 1. 會員個人資料核心狀態
  const user = ref({
    isLoggedIn: true,
    name: '陳哲偉',
    phone: '0912345678',
    email: 'user@md-korea.com',
    tier: 'VIP MEMBER',
    points: 1250,
    wishlist: [1, 2], // 收藏商品 ID 列表
    restockRequests: [],
    // 風控管制狀態：NORMAL | WARNING | RESTRICT_COD | RESTRICT_PROMO | BLOCK_ORDER | BANNED
    riskStatus: 'NORMAL',
    blockReason: '',
    savedAddresses: [
      {
        id: 1,
        type: 'HOME',
        recipientName: '陳哲偉',
        phone: '0912345678',
        city: '台北市',
        district: '中正區',
        detail: '忠孝西路一段 100 號 8 樓',
        isDefault: true
      }
    ]
  })

  // 管理者權限標記 (預設 true，方便進入後台)
  const isAdmin = ref(true)

  // 頂層相容屬性 (防止舊元件使用 authStore.isLoggedIn 報錯)
  const isLoggedIn = computed({
    get: () => Boolean(user.value && user.value.isLoggedIn),
    set: (val) => {
      if (user.value) user.value.isLoggedIn = val
    }
  })

  const isAuthenticated = computed(() => isLoggedIn.value)

  // 2. 後台專用：全體會員名冊列表
  const memberList = ref([
    {
      id: 'MB-1001',
      name: '陳哲偉',
      phone: '0912345678',
      email: 'user@md-korea.com',
      tier: 'VIP',
      totalSpent: 14850,
      orderCount: 8,
      abandonCount: 0,
      riskStatus: 'NORMAL',
      notes: '核心常客，偏好韓國東大門外套',
      updatedAt: '2026-11-01'
    },
    {
      id: 'MB-1002',
      name: '黃小芬',
      phone: '0922111333',
      email: 'fen@gmail.com',
      tier: 'GENERAL',
      totalSpent: 3500,
      orderCount: 5,
      abandonCount: 3,
      riskStatus: 'RESTRICT_COD',
      notes: '7-11 逾期未取 3 次導致退貨逆物流，已關閉超取到付',
      updatedAt: '2026-11-08'
    },
    {
      id: 'MB-1003',
      name: '張惡霸',
      phone: '0988777666',
      email: 'badguy@fake.com',
      tier: 'GENERAL',
      totalSpent: 0,
      orderCount: 2,
      abandonCount: 2,
      riskStatus: 'BANNED',
      notes: '多次惡意下單後退貨並於客服辱罵，全面封鎖登入與購買',
      updatedAt: '2026-11-05'
    },
    {
      id: 'MB-1004',
      name: '李刷卡',
      phone: '0933444555',
      email: 'cardtest@yahoo.com.tw',
      tier: 'GENERAL',
      totalSpent: 890,
      orderCount: 1,
      abandonCount: 0,
      riskStatus: 'BLOCK_ORDER',
      notes: '疑似盜刷爭議款未清，待金融機構照會前暫停下單',
      updatedAt: '2026-11-09'
    }
  ])

  // 3. 會員登入
  const login = (loginData = {}) => {
    const matched = memberList.value.find(
      m => m.email === loginData.email || m.phone === loginData.account
    )

    if (matched && matched.riskStatus === 'BANNED') {
      alert('【帳號已被封鎖】此帳號因重大違規已被系統全面禁止登入，如有疑問請洽客服。')
      return false
    }

    user.value = {
      isLoggedIn: true,
      name: loginData.name || (matched ? matched.name : '測試會員'),
      phone: loginData.phone || (matched ? matched.phone : '0912345678'),
      email: loginData.email || (matched ? matched.email : 'user@md-korea.com'),
      tier: matched?.tier || 'VIP MEMBER',
      points: user.value?.points ?? 1250,
      wishlist: user.value?.wishlist ?? [1, 2],
      restockRequests: user.value?.restockRequests ?? [],
      riskStatus: matched ? matched.riskStatus : 'NORMAL',
      blockReason: matched ? matched.notes : '',
      savedAddresses: user.value?.savedAddresses ?? []
    }
    return true
  }

  // 4. 會員登出
  const logout = () => {
    user.value = {
      isLoggedIn: false,
      name: '',
      phone: '',
      email: '',
      tier: '',
      points: 0,
      wishlist: [],
      restockRequests: [],
      riskStatus: 'NORMAL',
      blockReason: '',
      savedAddresses: []
    }
  }

  // 5. 願望清單 / 收藏愛心 (相容 ProductCard 與 ProductDetailView)
  const isInWishlist = (productId) => {
    return Boolean(user.value?.wishlist?.includes(Number(productId)))
  }

  const toggleWishlist = (productId) => {
    if (!user.value.wishlist) user.value.wishlist = []
    const id = Number(productId)
    const index = user.value.wishlist.indexOf(id)
    if (index > -1) {
      user.value.wishlist.splice(index, 1)
    } else {
      user.value.wishlist.push(id)
    }
  }

  // 6. 個人資料更新
  const updateProfile = (profileData = {}) => {
    if (!user.value) return
    Object.assign(user.value, profileData)
  }

  // 7. 地址簿管理
  const addAddress = (address) => {
    if (!user.value.savedAddresses) user.value.savedAddresses = []
    user.value.savedAddresses.push({
      id: Date.now(),
      ...address
    })
  }

  const removeAddress = (addressId) => {
    if (!user.value.savedAddresses) return
    user.value.savedAddresses = user.value.savedAddresses.filter(a => a.id !== addressId)
  }

  // 8. 後台風控：更新會員管制等級
  const updateMemberRisk = (memberId, { riskStatus, notes }) => {
    const target = memberList.value.find(m => m.id === memberId)
    if (target) {
      target.riskStatus = riskStatus
      if (notes !== undefined) target.notes = notes
      target.updatedAt = new Date().toISOString().slice(0, 10)

      // 若為目前登入者，即時連動
      if (user.value && (user.value.email === target.email || user.value.phone === target.phone)) {
        user.value.riskStatus = riskStatus
        user.value.blockReason = notes || ''
      }
      return { success: true, message: `會員【${target.name}】管制狀態已更新為【${riskStatus}】` }
    }
    return { success: false, message: '找不到該會員' }
  }

  // 9. 結帳風控檢查 (前台 CheckoutView 使用)
  const checkCheckoutEligibility = (paymentMethod) => {
    const status = user.value?.riskStatus || 'NORMAL'

    if (status === 'BANNED') {
      return { allowed: false, reason: '您的帳號已被系統安全凍結，無法使用結帳功能，請聯繫官方客服。' }
    }
    if (status === 'BLOCK_ORDER') {
      return { allowed: false, reason: '很抱歉，此帳號目前暫停下單權限，請先聯繫客服完成身分照會。' }
    }
    if (status === 'RESTRICT_COD' && (paymentMethod === 'COD' || paymentMethod === 'CVS_COD')) {
      return { allowed: false, reason: '因您先前有多次包裹未取紀錄，本帳號暫停「貨到付款 / 超取付款」，請改用「信用卡 / 轉帳」預先付款。' }
    }
    return { allowed: true }
  }

  return {
    user,
    isAdmin,
    isLoggedIn,
    isAuthenticated,
    memberList,
    login,
    logout,
    isInWishlist,
    toggleWishlist,
    updateProfile,
    addAddress,
    removeAddress,
    updateMemberRisk,
    checkCheckoutEligibility
  }
})

// 具名匯出與預設匯出雙支援
export default useAuthStore