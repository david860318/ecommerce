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
      status: 'ACTIVE', // ACTIVE 上架 | INACTIVE 下架
      image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1200&q=80'
      ],
      tag: 'NEW',
      salesCount: 320,
      createdAt: '2026-11-05 10:00:00',
      descriptionHtml: '<p>嚴選<strong>親膚垂墜雪紡面料</strong>，領口微抓皺法式剪裁，走動間呈現極具質感的流動線條。</p><ul><li>產地：韓國製（Made in Korea）</li><li>版型：慵懶寬鬆落肩</li></ul>',
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

  const categories = ref(['全部商品', 'Top 上衣', 'Outer 外套', 'Bottom 下身', 'Dress 裙裝'])
  const selectedCategory = ref('全部商品')
  const searchInput = ref('')
  const debouncedSearchQuery = ref('')
  let debounceTimer = null

  const setSearchQuery = (val) => {
    searchInput.value = val
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedSearchQuery.value = val.trim()
      currentPage.value = 1
    }, 300)
  }

  const sortBy = ref('default')
  const currentPage = ref(1)
  const pageSize = ref(4)
  const viewMode = ref('pagination')
  const loadedCount = ref(4)

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

  // 前台只展示 ACTIVE 上架商品
  const filteredProducts = computed(() => {
    const query = debouncedSearchQuery.value.toLowerCase()
    return products.value
      .filter((p) => {
        const isOnline = p.status === 'ACTIVE'
        const matchCategory =
          selectedCategory.value === '全部商品' || p.category === selectedCategory.value
        if (!isOnline || !matchCategory) return false
        if (!query) return true
        return (
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.skus.some((s) => s.color.toLowerCase().includes(query))
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

  // ==================== 後台專用：SPU / SKU 新增、修改與批次處理 (AD-02) ====================
  // 1. 新增商品
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
      skus: productData.skus.map((s, idx) => ({
        skuId: s.skuId || `SKU-${nextId}-${idx + 1}`,
        color: s.color,
        size: s.size,
        price: Number(s.price || productData.basePrice),
        stock: Number(s.stock || 0)
      }))
    }
    products.value.unshift(newProduct)
    return { success: true, product: newProduct }
  }

  // 2. 編輯更新商品
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
      images: updatedData.images && updatedData.images.length > 0 ? updatedData.images : [updatedData.image],
      descriptionHtml: updatedData.descriptionHtml,
      description: updatedData.description || updatedData.name,
      skus: updatedData.skus.map((s, sIdx) => ({
        skuId: s.skuId || `SKU-${productId}-${sIdx + 1}`,
        color: s.color,
        size: s.size,
        price: Number(s.price || updatedData.basePrice),
        stock: Number(s.stock || 0)
      }))
    }
    return { success: true, product: products.value[idx] }
  }

  // 3. 刪除商品
  const deleteProduct = (productId) => {
    const idx = products.value.findIndex((p) => p.id === Number(productId))
    if (idx !== -1) {
      const deleted = products.value.splice(idx, 1)[0]
      return { success: true, product: deleted }
    }
    return { success: false, message: '找不到該商品' }
  }

  // 4. 一鍵批次上下架
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

  // 5. 一鍵批次調整價格 (支援百分比打折或固定金額)
  const batchAdjustPrice = (productIds, mode, val) => {
    let count = 0
    products.value.forEach((p) => {
      if (productIds.includes(p.id)) {
        if (mode === 'PERCENT') {
          p.basePrice = Math.max(1, Math.round(p.basePrice * (Number(val) / 100)))
        } else if (mode === 'FIXED') {
          p.basePrice = Math.max(1, p.basePrice + Number(val))
        }
        // 同步各規格 SKU 售價
        p.skus.forEach((s) => {
          s.price = p.basePrice
        })
        count++
      }
    })
    return { success: true, count }
  }

  // 6. 一鍵批次調整庫存 (統一增減或設為固定值)
  const batchAdjustStock = (productIds, mode, val) => {
    let skuCount = 0
    products.value.forEach((p) => {
      if (productIds.includes(p.id)) {
        p.skus.forEach((s) => {
          if (mode === 'SET') {
            s.stock = Math.max(0, Number(val))
          } else if (mode === 'ADD') {
            s.stock = Math.max(0, s.stock + Number(val))
          }
          skuCount++
        })
      }
    })
    return { success: true, count: skuCount }
  }

  return {
    products,
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
    addNewProduct,
    updateProduct,
    deleteProduct,
    batchToggleStatus,
    batchAdjustPrice,
    batchAdjustStock
  }
})