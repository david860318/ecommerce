<template>
  <div class="max-w-md mx-auto px-4 py-20 text-center">
    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
      <CheckCircle2 class="w-8 h-8" />
    </div>
    <h1 class="text-2xl font-bold text-slate-900 mb-2">訂單已成功建立！</h1>
    <p class="text-sm text-slate-500 mb-6">
      感謝您的訂購，系統已排程物流出貨。<br />
      您的訂單編號為：<span class="font-mono font-bold text-slate-800">{{ $route.query.orderId || 'ORD-982142' }}</span>
    </p>
    <router-link
      to="/"
      class="inline-block bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-6 py-3 rounded-xl transition"
    >
      返回首頁繼續瀏覽
    </router-link>
  </div>
</template>

<script setup>
import { CheckCircle2 } from 'lucide-vue-next'
</script>