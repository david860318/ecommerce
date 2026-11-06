<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.45); backdrop-filter: blur(2px); z-index: 1060;">
      <div class="modal-dialog modal-dialog-centered" style="max-width: 420px;">
        <div class="modal-content rounded-4 border-0 p-4 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h4 class="modal-title fs-6 fw-bold text-dark">會員登入 / 註冊</h4>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>

          <div class="modal-body small">
            <ul class="nav nav-pills nav-fill mb-3 bg-light rounded-pill p-1">
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link rounded-pill py-1 small"
                  :class="{ 'active bg-white text-dark shadow-xs': mode === 'otp', 'text-muted': mode !== 'otp' }"
                  @click="mode = 'otp'"
                >
                  手機 OTP
                </button>
              </li>
              <li class="nav-item">
                <button
                  type="button"
                  class="nav-link rounded-pill py-1 small"
                  :class="{ 'active bg-white text-dark shadow-xs': mode === 'password', 'text-muted': mode !== 'password' }"
                  @click="mode = 'password'"
                >
                  帳號密碼
                </button>
              </li>
            </ul>

            <!-- 模式 1：OTP -->
            <form v-if="mode === 'otp'" @submit.prevent="handleOtpLogin" class="d-flex flex-column gap-3">
              <div>
                <label class="form-label text-secondary mb-1">台灣手機號碼 *</label>
                <div class="input-group">
                  <input v-model="phone" required type="tel" class="form-control form-control-sm font-monospace" placeholder="0912345678" />
                  <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    :disabled="authStore.otpCountdown > 0"
                    @click="handleSendOtp"
                  >
                    {{ authStore.otpCountdown > 0 ? `${authStore.otpCountdown}s` : '發送驗證碼' }}
                  </button>
                </div>
              </div>

              <div>
                <label class="form-label text-secondary mb-1">6 位數驗證碼 *</label>
                <input v-model="otpCode" required maxlength="6" type="text" class="form-control form-control-sm text-center font-monospace" placeholder="123456" />
              </div>

              <button type="submit" class="btn btn-primary w-100 rounded-pill py-2 mt-1">
                驗證並登入
              </button>
            </form>

            <!-- 模式 2：帳密 -->
            <form v-else @submit.prevent="handlePasswordLogin" class="d-flex flex-column gap-3">
              <div>
                <label class="form-label text-secondary mb-1">帳號 / 信箱 *</label>
                <input v-model="account" required type="text" class="form-control form-control-sm" />
              </div>

              <div>
                <label class="form-label text-secondary mb-1">密碼 (最少 8 碼，含大小寫英數字) *</label>
                <input v-model="password" required type="password" class="form-control form-control-sm" />
              </div>

              <button type="submit" class="btn btn-primary w-100 rounded-pill py-2 mt-1">
                登入帳號
              </button>
            </form>

            <div class="text-center text-muted my-3 position-relative">
              <hr />
              <span class="position-absolute top-50 start-50 translate-middle bg-white px-2" style="font-size: 10px;">或使用社群快速登入</span>
            </div>

            <div class="row g-2">
              <div class="col-6">
                <button type="button" @click="handleOAuth('google')" class="btn btn-outline-secondary btn-sm w-100 rounded-pill">
                  Google 登入
                </button>
              </div>
              <div class="col-6">
                <button type="button" @click="handleOAuth('line')" class="btn btn-outline-success btn-sm w-100 rounded-pill">
                  LINE 登入
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

defineProps({ isOpen: Boolean })
const emit = defineEmits(['close'])
const authStore = useAuthStore()

const mode = ref('otp')
const phone = ref('0912345678')
const otpCode = ref('')
const account = ref('')
const password = ref('')

const handleSendOtp = () => {
  const res = authStore.sendOtp(phone.value)
  alert(res.message)
}
const handleOtpLogin = () => {
  const res = authStore.verifyLogin(phone.value, otpCode.value)
  alert(res.message)
  if (res.success) emit('close')
}
const handlePasswordLogin = () => {
  const res = authStore.loginWithPassword(account.value, password.value)
  alert(res.message)
  if (res.success) emit('close')
}
const handleOAuth = (provider) => {
  const res = authStore.loginWithOAuth(provider)
  alert(res.message)
  if (res.success) emit('close')
}
</script>