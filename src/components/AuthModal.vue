<template>
  <!-- 使用 Teleport 直接將彈窗脫離父層掛載到 body，避免被任何父層的 overflow 或 transform 裁切 -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      @click.self="$emit('close')"
    >
      <!-- 彈跳視窗本體：限制最大高度 90vh 並支援內部自動捲動，避免在小螢幕被切掉 -->
      <div
        class="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
      >
        <!-- 右上角關閉按鈕 -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X class="w-5 h-5" />
        </button>

        <!-- 可捲動的主內容區域 -->
        <div class="p-6 sm:p-8 overflow-y-auto scrollbar-thin">
          <!-- 標題與 Logo -->
          <div class="text-center mb-6">
            <div class="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 font-bold text-xl shadow-md">
              S
            </div>
            <h3 class="text-xl font-extrabold text-slate-900">會員快速登入 / 註冊</h3>
            <p class="text-xs text-slate-500 mt-1">支援台灣手機 OTP、帳密與社群快速綁定</p>
          </div>

          <!-- 登入方式切換頁籤 -->
          <div class="flex border-b border-slate-100 mb-5 text-xs font-bold">
            <button
              type="button"
              @click="mode = 'otp'"
              class="flex-1 pb-2.5 transition border-b-2"
              :class="mode === 'otp' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'"
            >
              手機 OTP 驗證碼
            </button>
            <button
              type="button"
              @click="mode = 'password'"
              class="flex-1 pb-2.5 transition border-b-2"
              :class="mode === 'password' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'"
            >
              帳號密碼登入
            </button>
          </div>

          <!-- 模式 1：手機 OTP 驗證碼登入 -->
          <form v-if="mode === 'otp'" @submit.prevent="handleOtpLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">台灣手機門號 (09xxxxxxxx) *</label>
              <div class="flex gap-2">
                <input
                  v-model="phone"
                  required
                  pattern="^09\d{8}$"
                  type="tel"
                  placeholder="0912345678"
                  class="flex-1 border border-slate-200 p-2.5 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                  type="button"
                  @click="handleSendOtp"
                  :disabled="authStore.otpCountdown > 0"
                  class="text-xs px-3.5 rounded-xl border border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {{ authStore.otpCountdown > 0 ? `${authStore.otpCountdown}s 後重發` : '發送驗證碼' }}
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">※ 限制 60 秒重發一次，驗證碼 5 分鐘內有效。</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">6 位數驗證碼 *</label>
              <input
                v-model="otpCode"
                required
                maxlength="6"
                type="text"
                placeholder="請輸入 6 碼數字"
                class="w-full border border-slate-200 p-2.5 rounded-xl text-base font-mono tracking-widest text-center outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm transition active:scale-[0.99] shadow-sm"
            >
              驗證並完成登入
            </button>
          </form>

          <!-- 模式 2：帳號密碼登入 (含密碼強度驗證) -->
          <form v-else @submit.prevent="handlePasswordLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">帳號 / Email / 手機 *</label>
              <input
                v-model="account"
                required
                type="text"
                placeholder="輸入會員帳號或 Email"
                class="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">會員密碼 *</label>
              <input
                v-model="password"
                required
                type="password"
                placeholder="最少 8 碼，含大小寫英文字母與數字"
                class="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />

              <!-- 密碼強度即時提示 -->
              <div class="mt-2 space-y-1 text-[11px]">
                <div class="flex items-center gap-1.5" :class="password.length >= 8 ? 'text-emerald-600 font-medium' : 'text-slate-400'">
                  <span>●</span> 長度至少 8 碼以上 ({{ password.length }}/8)
                </div>
                <div class="flex items-center gap-1.5" :class="/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-400'">
                  <span>●</span> 包含英文大寫與小寫字母 (A-Z, a-z)
                </div>
                <div class="flex items-center gap-1.5" :class="/[0-9]/.test(password) ? 'text-emerald-600 font-medium' : 'text-slate-400'">
                  <span>●</span> 包含至少 1 個數字 (0-9)
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm transition active:scale-[0.99] shadow-sm"
            >
              登入 / 註冊新會員
            </button>
          </form>

          <!-- 分隔線 -->
          <div class="relative my-6 text-center">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
            <span class="relative bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">或使用第三方帳號登入</span>
          </div>

          <!-- Google / LINE OAuth 第三方快速登入 -->
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="handleOAuth('google')"
              class="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl text-xs font-semibold text-slate-700 transition"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Google 登入
            </button>

            <button
              type="button"
              @click="handleOAuth('line')"
              class="flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05b34c] py-2.5 rounded-xl text-xs font-semibold text-white transition shadow-xs"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975 1.764-1.954 2.548-3.967 2.548-5.968z"/>
              </svg>
              LINE 登入
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
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

const mode = ref('otp')
const phone = ref('0912345678')
const otpCode = ref('')
const account = ref('')
const password = ref('')

// 發送驗證碼
const handleSendOtp = () => {
  const res = authStore.sendOtp(phone.value)
  alert(res.message)
}

// 驗證 OTP
const handleOtpLogin = () => {
  const res = authStore.verifyLogin(phone.value, otpCode.value)
  alert(res.message)
  if (res.success) {
    emit('close')
  }
}

// 帳密登入
const handlePasswordLogin = () => {
  const res = authStore.loginWithPassword(account.value, password.value)
  alert(res.message)
  if (res.success) {
    emit('close')
  }
}

// 社群登入
const handleOAuth = (provider) => {
  const res = authStore.loginWithOAuth(provider)
  alert(res.message)
  if (res.success) {
    emit('close')
  }
}
</script>