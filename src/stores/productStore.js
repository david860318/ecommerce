import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProductStore = defineStore('products', () => {
  const products = ref([
    {
      id: 1,
      name: '極簡都會防潑水機能後背包',
      category: '生活風格',
      basePrice: 2480,
      originalPrice: 3200,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      tag: '新品',
      rating: 4.8,
      salesCount: 142,
      createdAt: '2026-10-01',
      description: '防潑水機能面料，配置專用筆電避震防護層與人體工學舒壓肩帶。',
      skus: [
        { skuId: 'BP-BLK', color: '曜石黑', size: '標準款', price: 2480, stock: 8 },
        { skuId: 'BP-GRY', color: '太空灰', size: '標準款', price: 2480, stock: 4 },
        { skuId: 'BP-NVY', color: '海軍藍', size: '加大款', price: 2680, stock: 0 }
      ]
    },
    {
      id: 2,
      name: '智能主動降噪藍牙無線耳機 Pro',
      category: '3C數位',
      basePrice: 4990,
      originalPrice: 5990,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      tag: '熱銷',
      rating: 4.9,
      salesCount: 388,
      createdAt: '2026-09-15',
      description: '新一代 ANC 主動降噪晶片，長達 40 小時續航，支援多設備無縫連接。',
      skus: [
        { skuId: 'HP-WHT', color: '極光白', size: '標準規格', price: 4990, stock: 6 },
        { skuId: 'HP-BLK', color: '夜幕黑', size: '標準規格', price: 4990, stock: 2 }
      ]
    },
    {
      id: 3,
      name: '手沖細口不鏽鋼溫控快煮壺',
      category: '廚房家電',
      basePrice: 1880,
      originalPrice: 2280,
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80',
      tag: '現貨',
      rating: 4.7,
      salesCount: 95,
      createdAt: '2026-10-20',
      description: '±1°C 精準溫控，專利細口水流穩定，專業咖啡師推薦規格。',
      skus: [
        { skuId: 'KB-MAT', color: '消光黑', size: '800ml', price: 1880, stock: 12 },
        { skuId: 'KB-SLV', color: '鏡面銀', size: '800ml', price: 1880, stock: 0 }
      ]
    },
    {
      id: 4,
      name: '天然冷杉雪松精油香氛擴香組',
      category: '居家選品',
      basePrice: 1280,
      originalPrice: 1580,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
      tag: '推薦',
      rating: 4.6,
      salesCount: 210,
      createdAt: '2026-08-11',
      description: '植萃純天然精油，無化學香精添加，營造舒適沉穩的居家放鬆氛圍。',
      skus: [
        { skuId: 'AR-CED', color: '雪松木', size: '150ml', price: 1280, stock: 15 }
      ]
    }
  ])

  const selectedCategory = ref('全部')
  const searchQuery = ref('')
  const sortBy = ref('default') // default, price-asc, price-desc, sales

  const categories = computed(() => ['全部', ...new Set(products.value.map(p => p.category))])

  const filteredProducts = computed(() => {
    let result = products.value.filter(product => {
      const matchCat = selectedCategory.value === '全部' || product.category === selectedCategory.value
      const matchSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
      return matchCat && matchSearch
    })

    if (sortBy.value === 'price-asc') {
      result.sort((a, b) => a.basePrice - b.basePrice)
    } else if (sortBy.value === 'price-desc') {
      result.sort((a, b) => b.basePrice - a.basePrice)
    } else if (sortBy.value === 'sales') {
      result.sort((a, b) => b.salesCount - a.salesCount)
    }

    return result
  })

  return {
    products,
    selectedCategory,
    searchQuery,
    sortBy,
    categories,
    filteredProducts
  }
})