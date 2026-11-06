import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMarketingStore = defineStore('marketing', () => {
  // 1. 後台可動態配置之輪播 Banner (ST-03)
  const banners = ref([
    {
      id: 1,
      title: 'SEOUL 2026 AUTUMN COLLECTION',
      subtitle: '極簡鬆弛感 · 溫潤大地色系針織與俐落西服系列',
      tag: 'NEW ARRIVAL',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
      linkType: 'category', // 'internal' | 'external' | 'category'
      linkUrl: 'Top 上衣',
      isExternal: false,
      buttonText: '探索秋季新品'
    },
    {
      id: 2,
      title: 'CLASSIC WOOL COAT SERIES',
      subtitle: '雙排扣純羊毛短大衣系列 · 限時享滿千折百',
      tag: 'MD RECOMMENDED',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
      linkType: 'category',
      linkUrl: 'Outer 外套',
      isExternal: false,
      buttonText: '選購毛呢大衣'
    },
    {
      id: 3,
      title: 'FOLLOW US ON INSTAGRAM',
      subtitle: '追蹤 @md.0704_ 搶先預覽每週五晚間新品直播穿搭',
      tag: 'COMMUNITY',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80',
      linkType: 'external',
      linkUrl: 'https://www.instagram.com/md.0704_/',
      isExternal: true,
      buttonText: '前往官方 IG'
    }
  ])

  // 2. 二級/三級多層級分類目錄樹 (ST-04)
  const categoryTree = ref([
    {
      name: 'NEW IN 當季新品',
      subcategories: [
        { name: '本週最新上架', items: ['熱銷穿搭 TOP10', 'MD 每日私服', '成套懶人搭配'] },
        { name: '早春微涼企劃', items: ['薄針織防曬開衫', '透膚打底系列'] }
      ]
    },
    {
      name: 'TOP 上身系列',
      subcategories: [
        { name: '襯衫 / 罩衫', items: ['鬆弛感雪紡襯衫', '微抓皺法式條紋', '俐落工裝長版'] },
        { name: '針織 / 毛衣', items: ['方領親膚打底衫', '麻花排扣開衫', '軟糯高領羊絨'] },
        { name: '休閒 T-Shirt', items: ['正韓親膚素 Tee', '復古微落肩印花'] }
      ]
    },
    {
      name: 'BOTTOM 下身系列',
      subcategories: [
        { name: '西裝長褲', items: ['高腰直筒微闊腿', '垂墜落地拖地褲', '俐落九分煙管褲'] },
        { name: '半身裙裝', items: ['後開衩針織長裙', '高腰A字傘裙', '百褶學院風裙'] },
        { name: '正韓牛仔', items: ['修身微喇牛仔褲', '水洗淺藍錐形褲'] }
      ]
    },
    {
      name: 'OUTER 外套大衣',
      subcategories: [
        { name: '保暖大衣', items: ['純羊毛短大衣', '長版西裝翻領大衣'] },
        { name: '西裝外套', items: ['寬鬆微廓形西裝', '復古毛呢西服'] }
      ]
    }
  ])

  return { banners, categoryTree }
})