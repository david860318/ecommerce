<template>
  <div class="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
    <!-- 側邊導航欄 -->
    <aside class="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white">
            A
          </div>
          <span class="font-bold text-base tracking-wide">SHOPFLOW 後台</span>
        </div>
      </div>

      <!-- 側邊導覽選單 -->
      <nav class="flex-1 p-3 space-y-1 text-xs font-medium">
        <router-link
          to="/admin"
          exact-active-class="bg-indigo-600 text-white font-bold"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition"
        >
          <LayoutDashboard class="w-4 h-4" />
          營運儀表板 (AD-10)
        </router-link>

        <router-link
          to="/admin/products"
          active-class="bg-indigo-600 text-white font-bold"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition"
        >
          <Boxes class="w-4 h-4" />
          商品與庫存 (AD-02/03)
        </router-link>

        <router-link
          to="/admin/orders"
          active-class="bg-indigo-600 text-white font-bold"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition"
        >
          <ClipboardList class="w-4 h-4" />
          訂單履約與發票 (OMS)
        </router-link>

        <router-link
          to="/admin/marketing"
          active-class="bg-indigo-600 text-white font-bold"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition"
        >
          <Tag class="w-4 h-4" />
          促銷與 CRM 會員 (AD-07/09)
        </router-link>
      </nav>

      <!-- 底部管理員資訊與回前台入口 -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        <div class="flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-emerald-400" />
          <div class="text-[11px] leading-tight">
            <div class="font-bold text-white">{{ adminStore.currentAdmin.name }}</div>
            <div class="text-slate-400">{{ adminStore.currentAdmin.role }}</div>
          </div>
        </div>
        <router-link
          to="/"
          class="block text-center w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg transition"
        >
          ← 返回顧客前台商城
        </router-link>
      </div>
    </aside>

    <!-- 後台主要內容呈現區 -->
    <main class="flex-1 p-6 md:p-8 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { LayoutDashboard, Boxes, ClipboardList, Tag, ShieldCheck } from 'lucide-vue-next'
import { useAdminStore } from '../../stores/adminStore'

const adminStore = useAdminStore()
</script>