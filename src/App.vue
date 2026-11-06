<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar />
    <div class="flex-grow-1">
      <router-view />
    </div>
    <CartDrawer />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import CartDrawer from './components/CartDrawer.vue'
</script>