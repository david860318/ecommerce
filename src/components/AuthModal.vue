<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
    <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
        <X class="w-5 h-5" />
      </button>

      <div class="text-center mb-6">
        <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl">
          S
        </div>
        <h3 class="text-xl font-bold text-slate-900">手機快速登入 / 註冊</h3>
        <p class="text-xs text-slate-500 mt-1">免記密碼，台灣手機門號 OTP 一鍵驗證</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">手機號碼 *</label>
          <div class="flex gap-2">
            <input
              v-model="phone"
              required
              type="tel"
              placeholder="0912345678"
              class="flex-1 border border-slate-200 p-2.5 rounded-xl text-sm font-mono outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              @click="handleSendOtp"
              :disabled="authStore.otpCountdown > 0"
              class="text-xs px-3 rounded-xl border border-indigo-200 text-indigo-600 font-semibold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {{ authStore.otpCountdown > 0 ? `${authStore.otpCountdown}s 後重發` : '發送驗證碼' }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">6 位數驗證碼 *</label>
          <input
            v-model="otpCode"
            required
            maxlength="6"
            type="text"
            placeholder="請輸入 123456"
            class="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono tracking-widest text-center outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
        >
          驗證並登入
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'

defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])
const authStore = useAuthStore()

const phone = ref('0912345678')
const otpCode = ref('')

const handleSendOtp = () => {
  const res = authStore.sendOtp(phone.value)
  alert(res.message)
}

const handleLogin = () => {
  const res = authStore.verifyLogin(phone.value, otpCode.value)
  alert(res.message)
  if (res.success) {
    emit('close')
  }
}
</script>