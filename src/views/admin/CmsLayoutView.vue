<template>
  <div class="d-flex flex-column gap-4">
    <div>
      <h1 class="h4 fw-bold text-dark font-serif mb-1">AD-11 首頁排版可視化管理 (CMS)</h1>
      <p class="small text-muted mb-0">自訂前台首頁區塊順序與顯示狀態，設定完成即時在前台首頁同步生效</p>
    </div>

    <div class="card-korean p-4 bg-white shadow-xs" style="max-width: 600px;">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fs-6 fw-bold text-dark mb-0">前台首頁渲染順序 (由上至下)</h2>
        <span class="badge bg-secondary font-monospace" style="font-size: 10px;">LIVE SYNC</span>
      </div>

      <div class="d-flex flex-column gap-2.5">
        <div
          v-for="(sec, idx) in adminStore.homeSections"
          :key="sec.id"
          class="p-3 rounded-3 border d-flex justify-content-between align-items-center bg-light"
        >
          <div class="d-flex align-items-center gap-2.5">
            <span
              class="badge rounded-circle text-white d-flex align-items-center justify-content-center"
              style="width: 24px; height: 24px; background-color: #9b7e68;"
            >
              {{ idx + 1 }}
            </span>
            <span class="fw-semibold text-dark">{{ sec.name }}</span>
          </div>

          <div class="d-flex align-items-center gap-1.5">
            <button
              class="btn btn-outline-secondary btn-sm rounded-3 py-1 px-2.5"
              :disabled="idx === 0"
              @click="moveSection(idx, -1)"
            >
              ↑ 上移
            </button>
            <button
              class="btn btn-outline-secondary btn-sm rounded-3 py-1 px-2.5"
              :disabled="idx === adminStore.homeSections.length - 1"
              @click="moveSection(idx, 1)"
            >
              ↓ 下移
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from '../../stores/adminStore'
const adminStore = useAdminStore()

const moveSection = (index, delta) => {
  const targetIndex = index + delta
  const item = adminStore.homeSections.splice(index, 1)[0]
  adminStore.homeSections.splice(targetIndex, 0, item)
  adminStore.addAuditLog('首頁 CMS 版面調整', `區塊【${item.name}】移至順位第 ${targetIndex + 1} 位`)
}
</script>