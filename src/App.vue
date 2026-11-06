<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900">
    <Navbar />
    <div class="flex-1">
      <router-view />
    </div>
    <CartDrawer />

    <footer class="bg-white border-t border-slate-200 py-6 mt-16 text-center text-xs text-slate-400">
      © 2026 SHOPFLOW B2C 購物網站. 依據系統需求規格書規範建構.
    </footer>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import CartDrawer from './components/CartDrawer.vue'
</script>