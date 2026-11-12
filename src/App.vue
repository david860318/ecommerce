<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <!-- 頂部導覽列 -->
    <Navbar />

    <!-- ★ 核心：頁面切換容器 (如果缺了這行，全站都是白畫面) ★ -->
    <div class="flex-grow-1">
      <router-view />
    </div>

    <!-- 購物車抽屜 -->
    <CartDrawer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import CartDrawer from './components/CartDrawer.vue'
</script>