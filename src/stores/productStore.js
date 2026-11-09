import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('product', () => {
  const products = ref([
    {
      id: 1,
      name: '法式極簡微抓皺鬆弛感雪紡襯衫',
      category: 'Top 上衣',
      basePrice: 1380,
      originalPrice: 1680,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=80'
      ],
      tag: 'NEW',
      salesCount: 320,
      createdAt: '2026-11-05 10:00:00',
      descriptionHtml: '<p>嚴選親膚垂墜雪紡面料，領口微抓皺法式剪裁，展現慵懶氣質。</p>',
      description: '嚴選親膚垂墜雪紡面料，領口自然抓皺剪裁，展現慵懶不造作的韓系鬆弛美感。',
      skus: [
        { skuId: 'TOP-01-CRM-F', color: '奶油杏', size: 'FREE', price: 1380, stock: 15 },
        { skuId: 'TOP-01-OAT-F', color: '淺燕麥', size: 'FREE', price: 1380, stock: 8 },
        { skuId: 'TOP-01-WHT-F', color: '霧白', size: 'FREE', price: 1480, stock: 0 }
      ]
    },
    {
      id: 2,
      name: '經典廓形雙排扣純羊毛短大衣',
      category: 'Outer 外套',
      basePrice: 2880,
      originalPrice: 3480,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=1200&q=80'
      ],
      tag: 'HOT',
      salesCount: 512,
      createdAt: '2026-11-04 14:30:00',
      descriptionHtml: '<p>高磅數保暖純羊毛混紡，微落肩立體廓形剪裁，自帶高級氣場。</p>',
      description: '高磅數保暖純羊毛混紡，微落肩俐落剪裁，內搭高領毛衣即可營造高級層次感。',
      skus: [
        { skuId: 'OUT-02-MOC-S', color: '摩卡咖', size: 'S', price: 2880, stock: 6 },
        { skuId: 'OUT-02-MOC-M', color: '摩卡咖', size: 'M', price: 2880, stock: 12 },
        { skuId: 'OUT-02-BLK-F', color: '曜石黑', size: 'FREE', price: 2980, stock: 4 }
      ]
    },
    {
      id: 3,
      name: '垂墜慵懶感微闊腿高腰西裝長褲',
      category: 'Bottom 下身',
      basePrice: 1580,
      originalPrice: 1880,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80'
      ],
      tag: 'MD PICK',
      salesCount: 428,
      createdAt: '2026-11-03 16:20:00',
      descriptionHtml: '<p>高腰修身遮肉版型，面料滑順抗皺挺闊。</p>',
      description: '高腰遮肉版型，面料滑順挺闊，走動間呈現極具質感的流動線條。',
      skus: [
        { skuId: 'BOT-03-GRY-S', color: '灰杏', size: 'S', price: 1580, stock: 20 },
        { skuId: 'BOT-03-GRY-M', color: '灰杏', size: 'M', price: 1580, stock: 14 }
      ]
    },
    {
      id: 4,
      name: '後開衩優雅垂墜直筒針織長裙',
      category: 'Dress 裙裝',
      basePrice: 1480,
      originalPrice: 1780,
      status: 'ACTIVE',
      image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1200&q=80'
      ],
      tag: 'POPULAR',
      salesCount: 290,
      createdAt: '2026-11-02 11:10:00',
      descriptionHtml: '<p>彈性極佳親膚坑條針織，下擺微後開衩剪裁。</p>',
      description: '彈性極佳的親膚坑條針織，修飾臀腿比例，下擺微後開衩設計讓步伐更顯輕盈優雅。',
      skus: [
        { skuId: 'DRS-04-BEI-F', color: '燕麥杏', size: 'FREE', price: 1480, stock: 18 }
      ]
    }
  ])

  // 評價資料庫
  const reviews = ref([
    {
      id: 'REV-1001',
      productId: 1,
      orderId: 'ORD-20261102-03',
      userName: '陳大文',
      userPhone: '0912345678',
      rating: 5,
      content: '布料觸感非常軟糯舒服，燕麥奶色非常顯白，自然垂墜感很好，上班休閒穿都適合！',
      images: [
        'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=600&q=80'
      ],
      createdAt: '2026-11-05 18:30'
    }
  ])

  const categories = ref(['全部商品', 'Top 上衣', 'Outer 外套', 'Bottom 下身', 'Dress 裙裝'])
  const selectedCategory = ref('全部商品')
  const searchInput = ref('')
  const debouncedSearchQuery = ref('')
  let debounceTimer = null

  const setSearchQuery = (val) => {
    searchInput.value = val
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedSearchQuery.value = (val || '').trim()
      currentPage.value = 1
    }, 300)
  }

  const sortBy = ref('default')
  const currentPage = ref(1)
  const pageSize = ref(8)
  const viewMode = ref('pagination')
  const loadedCount = ref(8)

  const setCategory = (cat) => {
    selectedCategory.value = cat
    currentPage.value = 1
    loadedCount.value = pageSize.value
  }

  const setSortBy = (sort) => {
    sortBy.value = sort
    currentPage.value = 1
    loadedCount.value = pageSize.value
  }

  // 前台商品過濾（相容缺少 status 欄位的商品，預設皆為上架）
  const filteredProducts = computed(() => {
    const query = debouncedSearchQuery.value.toLowerCase()
    return products.value
      .filter((p) => {
        const isOnline = p.status ? p.status === 'ACTIVE' : true
        const matchCategory =
          selectedCategory.value === '全部商品' || p.category === selectedCategory.value
        if (!isOnline || !matchCategory) return false
        if (!query) return true
        return (
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          p.category.toLowerCase().includes(query)
        )
      })
      .sort((a, b) => {
        if (sortBy.value === 'price-asc') return a.basePrice - b.basePrice
        if (sortBy.value === 'price-desc') return b.basePrice - a.basePrice
        if (sortBy.value === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
        if (sortBy.value === 'sales') return b.salesCount - a.salesCount
        return 0
      })
  })

  const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize.value) || 1)
  const paginatedProducts = computed(() => {
    if (viewMode.value === 'infinite') {
      return filteredProducts.value.slice(0, loadedCount.value)
    }
    const start = (currentPage.value - 1) * pageSize.value
    return filteredProducts.value.slice(start, start + pageSize.value)
  })

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const loadMore = () => {
    if (loadedCount.value < filteredProducts.value.length) {
      loadedCount.value += pageSize.value
    }
  }

  const hasMore = computed(() => loadedCount.value < filteredProducts.value.length)

  const getProductById = (id) => {
    return products.value.find((p) => p.id === Number(id))
  }

  const getProductReviews = (productId) => {
    return reviews.value.filter((r) => r.productId === Number(productId))
  }

  const getProductRatingSummary = (productId) => {
    const pReviews = getProductReviews(productId)
    if (pReviews.length === 0) {
      return { average: 5.0, count: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
    }
    const sum = pReviews.reduce((acc, cur) => acc + cur.rating, 0)
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    pReviews.forEach((r) => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++
    })
    return {
      average: Number((sum / pReviews.length).toFixed(1)),
      count: pReviews.length,
      breakdown
    }
  }

  const addReview = (reviewData) => {
    const newRev = {
      id: 'REV-' + Date.now().toString().slice(-6),
      productId: Number(reviewData.productId),
      orderId: reviewData.orderId,
      userName: reviewData.userName,
      userPhone: reviewData.userPhone,
      rating: Number(reviewData.rating),
      content: reviewData.content.trim(),
      images: (reviewData.images || []).slice(0, 5),
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    }
    reviews.value.unshift(newRev)
    return { success: true, message: '感謝您的真實心得與曬圖分享！' }
  }

  const addNewProduct = (productData) => {
    const nextId = products.value.length > 0 ? Math.max(...products.value.map((p) => p.id)) + 1 : 1
    const newProduct = {
      id: nextId,
      name: productData.name,
      category: productData.category || 'Top 上衣',
      basePrice: Number(productData.basePrice),
      originalPrice: Number(productData.originalPrice || productData.basePrice),
      status: productData.status || 'ACTIVE',
      image: productData.image,
      images: productData.images && productData.images.length > 0 ? productData.images : [productData.image],
      tag: 'NEW',
      salesCount: 0,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      descriptionHtml: productData.descriptionHtml || `<p>${productData.name}</p>`,
      description: productData.description || productData.name,
      skus: productData.skus && productData.skus.length > 0 ? productData.skus : [
        { skuId: `SKU-${nextId}-01`, color: '預設色', size: 'FREE', price: Number(productData.basePrice), stock: 10 }
      ]
    }
    products.value.unshift(newProduct)
    return { success: true, product: newProduct }
  }

  const updateProduct = (productId, updatedData) => {
    const idx = products.value.findIndex((p) => p.id === Number(productId))
    if (idx === -1) return { success: false, message: '商品不存在' }
    products.value[idx] = {
      ...products.value[idx],
      name: updatedData.name,
      category: updatedData.category,
      basePrice: Number(updatedData.basePrice),
      originalPrice: Number(updatedData.originalPrice || updatedData.basePrice),
      status: updatedData.status,
      image: updatedData.image,
      descriptionHtml: updatedData.descriptionHtml,
      description: updatedData.description || updatedData.name,
      skus: updatedData.skus
    }
    return { success: true, product: products.value[idx] }
  }

  const deleteProduct = (productId) => {
    const idx = products.value.findIndex((p) => p.id === Number(productId))
    if (idx !== -1) {
      const deleted = products.value.splice(idx, 1)[0]
      return { success: true, product: deleted }
    }
    return { success: false }
  }

  const batchToggleStatus = (productIds, targetStatus) => {
    let count = 0
    products.value.forEach((p) => {
      if (productIds.includes(p.id)) {
        p.status = targetStatus
        count++
      }
    })
    return { success: true, count }
  }

  const batchAdjustPrice = (productIds, mode, val) => {
    let count = 0
    products.value.forEach((p) => {
      if (productIds.includes(p.id)) {
        if (mode === 'PERCENT') {
          p.basePrice = Math.max(1, Math.round(p.basePrice * (Number(val) / 100)))
        } else if (mode === 'FIXED') {
          p.basePrice = Math.max(1, p.basePrice + Number(val))
        }
        p.skus.forEach((s) => { s.price = p.basePrice })
        count++
      }
    })
    return { success: true, count }
  }

  const batchAdjustStock = (productIds, mode, val) => {
    let count = 0
    products.value.forEach((p) => {
      if (productIds.includes(p.id)) {
        p.skus.forEach((s) => {
          if (mode === 'SET') s.stock = Math.max(0, Number(val))
          else if (mode === 'ADD') s.stock = Math.max(0, s.stock + Number(val))
          count++
        })
      }
    })
    return { success: true, count }
  }

  return {
    products,
    reviews,
    categories,
    selectedCategory,
    searchInput,
    debouncedSearchQuery,
    sortBy,
    currentPage,
    pageSize,
    viewMode,
    totalPages,
    filteredProducts,
    paginatedProducts,
    hasMore,
    setSearchQuery,
    setCategory,
    setSortBy,
    goToPage,
    loadMore,
    getProductById,
    getProductReviews,
    getProductRatingSummary,
    addReview,
    addNewProduct,
    updateProduct,
    deleteProduct,
    batchToggleStatus,
    batchAdjustPrice,
    batchAdjustStock
  }
})