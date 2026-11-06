<template>
  <div class="d-flex flex-column gap-4">
    <div>
      <h1 class="h4 fw-bold text-dark font-serif mb-1">AD-12 系統操作稽核日誌 (Audit Log)</h1>
      <p class="small text-muted mb-0">嚴格只讀儲存機制，任何人員均無法刪除或修改敏感操作軌跡</p>
    </div>

    <div class="card-korean p-4 bg-white shadow-xs">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fs-6 fw-bold text-dark mb-0">不可竄改歷史軌跡 (共 {{ adminStore.auditLogs.length }} 筆)</h2>
        <span class="badge bg-danger rounded-pill">READ-ONLY WORM ARCHIVE</span>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle small mb-0 font-monospace">
          <thead class="table-light">
            <tr>
              <th>日誌 ID</th>
              <th>操作人員</th>
              <th>來源 IP</th>
              <th>操作動作</th>
              <th>敏感異動前後詳情</th>
              <th>時間戳記</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in adminStore.auditLogs" :key="log.id">
              <td class="text-muted">{{ log.id }}</td>
              <td class="fw-bold text-dark">{{ log.operator }}</td>
              <td>{{ log.ip }}</td>
              <td><span class="badge bg-light text-dark border">{{ log.action }}</span></td>
              <td class="text-secondary">{{ log.detail }}</td>
              <td class="text-muted">{{ log.createdAt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAdminStore } from '../../stores/adminStore'
const adminStore = useAdminStore()
</script>