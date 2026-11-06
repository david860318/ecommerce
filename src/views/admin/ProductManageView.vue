<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">商品與庫存管理 (PIM)</h1>
        <p class="text-xs text-slate-500 mt-1">管理多規格 SKU 售價、庫存扣減警戒與即時狀態 (AD-02, AD-03)</p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
      >
        + 新增商品 SPU
      </button>
    </div>

    <!-- 商品列表卡片 -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-slate-50 text-slate-700 border-b border-slate-200">
            <tr>
              <th class="p-4">商品與分類</th>
              <th class="p-4">SKU 規格列表</th>
              <th class="p-4">規格售價</th>
              <th class="p-4">現有庫存 (安全閾值: 3)</th>
              <th class="p-4 text-center">庫存微調操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-for="product in productStore.products" :key="product.id">
              <tr v-for="(sku, index) in product.skus" :key="sku.skuId" class="hover:bg-slate-50/50">
                <!-- 第一列顯示 SPU 資訊 -->
                <td v-if="index === 0" :rowspan="product.skus.length" class="p-4 align-top border-r border-slate-100 bg-white">
                  <div class="flex gap-3">
                    <img :src="product.image" class="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                    <div>
                      <span class="text-[10px] bg-slate-100 text-indigo-600 font-semibold px-1.5 py-0.5 rounded">{{ product.category }}</span>
                      <h4 class="font-bold text-slate-800 text-sm mt-1 max-w-[200px] truncate">{{ product.name }}</h4>
                      <span class="text-slate-400 text-[11px]">累積銷量：{{ product.salesCount }}</span>
                    </div>
                  </div>
                </td>

                <td class="p-4 font-mono font-medium text-slate-700">
                  <span class="font-bold text-slate-900">{{ sku.color }} / {{ sku.size }}</span>
                  <span class="block text-[10px] text-slate-400">SKU: {{ sku.skuId }}</span>
                </td>

                <td class="p-4 font-bold text-slate-900">
                  NT$ {{ sku.price.toLocaleString() }}
                </td>

                <!-- 安全庫存警戒標紅 (AD-03) -->
                <td class="p-4">
                  <div class="flex items-center gap-2">
                    <span
                      class="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      :class="sku.stock === 0 ? 'bg-rose-100 text-rose-700' : sku.stock <= 3 ? 'bg-amber-100 text-amber-700 font-bold' : 'bg-emerald-50 text-emerald-700'"
                    >
                      {{ sku.stock === 0 ? '缺貨已售完' : sku.stock <= 3 ? `庫存偏低 (${sku.stock})` : `現貨 ${sku.stock} 件` }}
                    </span>
                  </div>
                </td>

                <td class="p-4 text-center">
                  <div class="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      @click="adjustStock(sku, -1)"
                      class="w-6 h-6 rounded bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                    >
                      -
                    </button>
                    <span class="w-8 text-center font-mono font-bold">{{ sku.stock }}</span>
                    <button
                      @click="adjustStock(sku, 1)"
                      class="w-6 h-6 rounded bg-white hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProductStore } from '../../stores/productStore'

const productStore = useProductStore()
const showAddModal = ref(false)

const adjustStock = (sku, delta) => {
  const next = sku.stock + delta
  if (next < 0) return
  sku.stock = next
}
</script>