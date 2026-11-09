import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarketingStore = defineStore('marketing', () => {
  // 原有 Banners 資料...
  const banners = ref([
    {
      id: 1,
      tag: 'SEASON OFF · 2026 WINTER',
      title: '首爾冬季極簡特輯，\n探索晨霧微光中的鬆弛線條。',
      subtitle: '全館冬季新品結帳享免運，滿額 NT$ 2,500 再贈精緻羊毛圍巾。',
      buttonText: '探索全系列',
      linkType: 'category',
      linkUrl: 'Outer 外套',
      isExternal: false,
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 1
    },
    {
      id: 2,
      tag: 'NEW ARRIVAL',
      title: '溫潤羊毛與親膚針織，\n重塑日常優雅廓形。',
      subtitle: '正韓直送，法式優雅與現代極簡的完美融合。',
      buttonText: '瀏覽上衣專區',
      linkType: 'category',
      linkUrl: 'Top 上衣',
      isExternal: false,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 2
    },
    {
      id: 3,
      tag: 'MD PICK',
      title: '慵懶垂墜感，\n微闊腿西裝長褲系列。',
      subtitle: '穿出率性俐落，版型修身挺拔。',
      buttonText: '立即選購',
      linkType: 'category',
      linkUrl: 'Bottom 下身',
      isExternal: false,
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
      isActive: true,
      sortOrder: 3
    }
  ])

  // 主分類導覽選單樹 (Navbar Category Tree)
  const categoryTree = ref([
    {
      name: 'Top 上衣',
      subcategories: [
        { name: '質感襯衫', items: ['雪紡襯衫', '長袖純棉襯衫', '立領法式襯衫'] },
        { name: '針織與毛衣', items: ['喀什米爾針織', '開襟小外套', '寬鬆落肩毛衣'] }
      ]
    },
    {
      name: 'Outer 外套',
      subcategories: [
        { name: '羊毛大衣', items: ['經典雙排扣長大衣', '廓形短大衣'] },
        { name: '西裝外套', items: ['法式休閒西裝', '微墊肩俐落外套'] }
      ]
    },
    {
      name: 'Bottom 下身',
      subcategories: [
        { name: '長褲系列', items: ['高腰西裝長褲', '直筒微闊腿褲'] },
        { name: '裙裝系列', items: ['開衩針織裙', '垂墜感百褶長裙'] }
      ]
    }
  ])

  // Banner 管理方法...
  const addBanner = (bannerData) => {
    const nextId = banners.value.length > 0 ? Math.max(...banners.value.map(b => b.id)) + 1 : 1
    const newBanner = {
      id: nextId,
      tag: bannerData.tag || 'NEW PROMOTION',
      title: bannerData.title || '',
      subtitle: bannerData.subtitle || '',
      buttonText: bannerData.buttonText || '立即選購',
      linkType: bannerData.linkType || 'category',
      linkUrl: bannerData.linkUrl || 'Top 上衣',
      isExternal: Boolean(bannerData.isExternal),
      image: bannerData.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
      isActive: bannerData.isActive !== false,
      sortOrder: Number(bannerData.sortOrder || banners.value.length + 1)
    }
    banners.value.push(newBanner)
    return { success: true, banner: newBanner }
  }

  const updateBanner = (id, updatedData) => {
    const idx = banners.value.findIndex(b => b.id === Number(id))
    if (idx === -1) return { success: false, message: '找不到該輪播圖' }
    banners.value[idx] = { ...banners.value[idx], ...updatedData, id: Number(id) }
    return { success: true, banner: banners.value[idx] }
  }

  const deleteBanner = (id) => {
    const idx = banners.value.findIndex(b => b.id === Number(id))
    if (idx !== -1) {
      banners.value.splice(idx, 1)
      return { success: true }
    }
    return { success: false, message: '找不到該輪播圖' }
  }

  const toggleBannerStatus = (id) => {
    const banner = banners.value.find(b => b.id === Number(id))
    if (banner) {
      banner.isActive = !banner.isActive
      return { success: true, isActive: banner.isActive }
    }
    return { success: false }
  }

  // ==================== 後台專用：主分類導覽選單 (Navbar Mega Menu) 管理 ====================
  // 1. 新增主分類 (一級分類)
  const addPrimaryCategory = (categoryData) => {
    categoryTree.value.push({
      name: categoryData.name,
      subcategories: categoryData.subcategories || []
    })
    return { success: true }
  }

  // 2. 修改指定主分類
  const updatePrimaryCategory = (index, categoryData) => {
    if (index >= 0 && index < categoryTree.value.length) {
      categoryTree.value[index] = {
        name: categoryData.name,
        subcategories: categoryData.subcategories || []
      }
      return { success: true }
    }
    return { success: false, message: '分類不存在' }
  }

  // 3. 刪除指定主分類
  const deletePrimaryCategory = (index) => {
    if (index >= 0 && index < categoryTree.value.length) {
      categoryTree.value.splice(index, 1)
      return { success: true }
    }
    return { success: false }
  }

  // 4. 移動主分類順序
  const movePrimaryCategory = (index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= categoryTree.value.length) return
    const temp = categoryTree.value[index]
    categoryTree.value[index] = categoryTree.value[targetIdx]
    categoryTree.value[targetIdx] = temp
  }

  return {
    banners,
    categoryTree,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    addPrimaryCategory,
    updatePrimaryCategory,
    deletePrimaryCategory,
    movePrimaryCategory
  }
})