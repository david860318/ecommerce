<template>
  <div class="container py-3 py-md-5 profile-page-container">
    
    <!-- ==================== 1. 會員名片卡片 (RWD 全面適配) ==================== -->
    <div class="card card-korean member-card-hero p-3.5 p-sm-4 p-md-5 mb-3.5 mb-md-4 shadow-sm position-relative overflow-hidden border">
      <div class="member-card-glow position-absolute top-0 end-0"></div>

      <div class="position-relative d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3.5 gap-md-4" style="z-index: 2;">
        <!-- 左側：會員識別與資料 -->
        <div class="d-flex align-items-center gap-3 gap-md-3.5">
          <div class="avatar-ring-container flex-shrink-0 position-relative">
            <div class="avatar-circle font-serif">
              {{ authStore.user?.name ? authStore.user.name[0] : 'M' }}
            </div>
            <span class="vip-seal-badge position-absolute bottom-0 end-0" title="尊榮認證">
              <Sparkles style="width: 10px; height: 10px; color: #fff;" />
            </span>
          </div>

          <div class="min-w-0 flex-grow-1">
            <div class="d-flex align-items-center gap-1.5 gap-md-2 mb-1 flex-wrap">
              <h1 class="h5 fw-bold text-dark font-serif mb-0 tracking-wide text-truncate" style="max-width: 160px;">
                {{ authStore.user?.name || '會員' }}
              </h1>
              <span class="badge tier-badge font-monospace">
                {{ authStore.user?.tier || 'VIP MEMBER' }}
              </span>
              <button
                type="button"
                class="btn btn-link btn-sm p-0 text-primary text-decoration-none d-flex align-items-center gap-1 font-monospace ms-0 ms-sm-1"
                style="font-size: 11.5px;"
                @click="openProfileModal"
              >
                <Edit2 style="width: 12px; height: 12px;" />
                <span>修改資料</span>
              </button>
            </div>

            <div class="member-meta-info d-flex align-items-center gap-1.5 gap-md-2 text-muted font-monospace small flex-wrap">
              <span>{{ authStore.user?.phone }}</span>
              <span class="bullet-divider d-none d-sm-inline">·</span>
              <span class="text-truncate d-none d-sm-inline" style="max-width: 220px;">{{ authStore.user?.email }}</span>
            </div>

            <div class="tier-perk-hint text-secondary small mt-1 d-flex align-items-center gap-1.5">
              <Crown style="width: 12px; height: 12px; color: var(--md-primary, #9b7e68);" class="flex-shrink-0" />
              <span class="text-truncate" style="font-size: 11px;">全館消費享 <strong>2% 點數回饋</strong></span>
            </div>
          </div>
        </div>

        <!-- 右側：點數資產與登出按鈕 (手機端自適應橫向排版) -->
        <div class="member-assets-panel d-flex align-items-center justify-content-between gap-2.5 gap-md-3">
          <div class="points-asset-card p-2.5 p-sm-3 rounded-3 border d-flex flex-column justify-content-between flex-grow-1 flex-lg-grow-0">
            <div class="d-flex justify-content-between align-items-center gap-2">
              <span class="text-uppercase text-muted font-monospace asset-title">REWARD POINTS</span>
              <Coins style="width: 13px; height: 13px; color: var(--md-primary, #9b7e68);" />
            </div>
            <div class="d-flex align-items-baseline gap-1 mt-0.5">
              <span class="fs-4 fw-bold font-monospace text-dark">{{ (authStore.user?.points || 0).toLocaleString() }}</span>
              <span class="text-muted small font-sans">點</span>
            </div>
            <div class="text-muted font-monospace" style="font-size: 10px;">
              可折抵 NT$ {{ (authStore.user?.points || 0).toLocaleString() }}
            </div>
          </div>

          <button
            @click="handleLogout"
            type="button"
            class="btn btn-outline-danger btn-sm logout-btn rounded-pill d-flex align-items-center justify-content-center gap-1.5 flex-shrink-0"
            aria-label="登出帳號"
          >
            <LogOut style="width: 13px; height: 13px;" />
            <span class="d-inline">登出</span>
          </button>
        </div>
      </div>

      <!-- 晉升進度條 -->
      <div class="tier-upgrade-progress mt-3.5 mt-md-4 pt-2.5 pt-md-3 border-top position-relative" style="border-color: var(--md-border-light, #f3efe9) !important; z-index: 2;">
        <div class="d-flex justify-content-between align-items-center small mb-1.5 font-monospace flex-wrap gap-1">
          <span class="text-muted" style="font-size: 11px;">
            年度累積：<strong class="text-dark">NT$ 14,850</strong> / 20,000
          </span>
          <span class="text-primary fw-bold" style="font-size: 11px;">
            差 NT$ 5,150 晉升 VVIP
          </span>
        </div>
        <div class="progress" style="height: 4px; background-color: var(--md-surface-subtle, #f5f2ed);">
          <div
            class="progress-bar rounded-pill"
            role="progressbar"
            style="width: 74.25%; background-color: var(--md-primary, #9b7e68);"
          ></div>
        </div>
      </div>
    </div>

    <!-- ==================== 2. 頁籤導覽列 (手機端橫向平滑捲動，絕不折行) ==================== -->
    <div class="tabs-scroll-container mb-3.5 mb-md-4 border-bottom">
      <ul class="nav nav-underline d-flex flex-nowrap no-scrollbar pb-0.5 gap-1 gap-md-2">
        <li class="nav-item flex-shrink-0">
          <button
            class="nav-link text-uppercase fw-semibold py-2 px-2.5 px-md-3 border-0 bg-transparent text-nowrap tab-btn"
            :class="activeMainTab === 'orders' ? 'text-primary border-bottom border-primary border-2 fw-bold active' : 'text-secondary'"
            @click="activeMainTab = 'orders'"
          >
            <Package class="me-1 tab-icon" />
            <span>訂單紀錄 ({{ displayOrders.length }})</span>
          </button>
        </li>
        <li class="nav-item flex-shrink-0">
          <button
            class="nav-link text-uppercase fw-semibold py-2 px-2.5 px-md-3 border-0 bg-transparent text-nowrap tab-btn"
            :class="activeMainTab === 'addresses' ? 'text-primary border-bottom border-primary border-2 fw-bold active' : 'text-secondary'"
            @click="activeMainTab = 'addresses'"
          >
            <MapPin class="me-1 tab-icon" />
            <span>常用地址 ({{ (authStore.user?.savedAddresses || []).length }})</span>
          </button>
        </li>
        <li class="nav-item flex-shrink-0">
          <button
            class="nav-link text-uppercase fw-semibold py-2 px-2.5 px-md-3 border-0 bg-transparent text-nowrap tab-btn"
            :class="activeMainTab === 'points' ? 'text-primary border-bottom border-primary border-2 fw-bold active' : 'text-secondary'"
            @click="activeMainTab = 'points'"
          >
            <Coins class="me-1 tab-icon" />
            <span>紅利點數</span>
          </button>
        </li>
        <li class="nav-item flex-shrink-0">
          <button
            class="nav-link text-uppercase fw-semibold py-2 px-2.5 px-md-3 border-0 bg-transparent text-nowrap tab-btn"
            :class="activeMainTab === 'wishlist' ? 'text-primary border-bottom border-primary border-2 fw-bold active' : 'text-secondary'"
            @click="activeMainTab = 'wishlist'"
          >
            <Heart class="me-1 tab-icon" />
            <span>願望清單 ({{ (authStore.user?.wishlist || []).length }})</span>
          </button>
        </li>
        <li class="nav-item flex-shrink-0">
          <button
            class="nav-link text-uppercase fw-semibold py-2 px-2.5 px-md-3 border-0 bg-transparent text-nowrap tab-btn"
            :class="activeMainTab === 'restock' ? 'text-primary border-bottom border-primary border-2 fw-bold active' : 'text-secondary'"
            @click="activeMainTab = 'restock'"
          >
            <Bell class="me-1 tab-icon" />
            <span>補貨提醒 ({{ (authStore.user?.restockRequests || []).length }})</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- ==================== 模組 1：訂單紀錄與 ORDER TIMELINE ==================== -->
    <div v-if="activeMainTab === 'orders'" class="d-flex flex-column gap-3.5 gap-md-4">
      
      <!-- 步驟條 -->
      <div class="card-korean p-3 p-sm-4 shadow-sm bg-white">
        <div class="d-flex justify-content-between align-items-center mb-2.5 mb-md-3">
          <div class="d-flex align-items-center gap-2">
            <span class="rounded-circle pulse-dot" style="width: 7px; height: 7px; background-color: var(--md-primary, #9b7e68);"></span>
            <span class="fw-bold small font-monospace text-uppercase tracking-wider" style="letter-spacing: 0.08em;">ORDER TIMELINE</span>
          </div>
          <span class="small text-muted d-none d-sm-inline" style="font-size: 11.5px;">點擊節點即可篩選狀態</span>
        </div>

        <div class="stepper-scroll-wrapper no-scrollbar">
          <div class="stepper-track d-flex align-items-center justify-content-between">
            <template v-for="(step, sIdx) in interactiveSteps" :key="step.key">
              <div
                class="step-node-item"
                :class="{
                  'is-active': currentStatus === step.key,
                  'is-passed': activeStepIndex >= sIdx && currentStatus !== 'ALL'
                }"
                @click="currentStatus = step.key"
              >
                <div class="node-circle-wrap position-relative">
                  <div class="node-circle">
                    <component :is="step.icon" class="node-icon" />
                  </div>
                  <span
                    v-if="getOrderCount(step.key) > 0"
                    class="position-absolute top-0 start-100 translate-middle badge rounded-pill node-count-badge font-monospace"
                  >
                    {{ getOrderCount(step.key) }}
                  </span>
                </div>
                <div class="node-label font-monospace">
                  {{ step.title }}
                </div>
              </div>

              <div
                v-if="sIdx < interactiveSteps.length - 1"
                class="step-connector flex-grow-1 position-relative"
              >
                <div class="connector-line-bg"></div>
                <div
                  class="connector-line-fill"
                  :style="{
                    width: currentStatus !== 'ALL' && activeStepIndex > sIdx ? '100%' : '0%'
                  }"
                ></div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 狀態統計與切換 -->
      <div class="d-flex justify-content-between align-items-center small text-secondary px-1">
        <div>
          目前檢視：<strong class="text-dark">{{ getFilterTitle(currentStatus) }}</strong> (共 {{ filteredOrders.length }} 筆)
        </div>
        <button
          v-if="currentStatus !== 'ALL'"
          @click="currentStatus = 'ALL'"
          class="btn btn-link btn-sm p-0 text-primary text-decoration-none"
          style="font-size: 11.5px;"
        >
          查看全部訂單 →
        </button>
      </div>

      <!-- 空資料狀態 -->
      <div v-if="filteredOrders.length === 0" class="card-korean text-center py-5 text-muted bg-white">
        <Package class="mb-2 opacity-40" style="width: 40px; height: 40px;" />
        <div class="small">在此狀態下尚無訂單資料</div>
      </div>

      <!-- 訂單清單卡片 (RWD 排版自適應) -->
      <div v-for="order in filteredOrders" :key="order.id" class="card-korean p-3 p-sm-4 shadow-sm bg-white">
        <div class="d-flex justify-content-between align-items-center border-bottom pb-2.5 mb-2.5 flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2 gap-sm-3">
            <span class="fw-bold font-monospace text-dark fs-6">{{ order.id }}</span>
            <span class="text-muted small font-monospace d-none d-sm-inline">{{ order.createdAt }}</span>
          </div>
          <span class="badge py-1 px-2.5" :class="getBadgeClass(order.shippingStatus || order.status)">
            {{ getStatusText(order.shippingStatus || order.status) }}
          </span>
        </div>

        <div class="d-flex flex-column gap-2 mb-3">
          <div
            v-for="(item, idx) in order.items"
            :key="idx"
            class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center small py-1 gap-2"
          >
            <div class="text-truncate w-100" style="max-width: 520px;">
              <span class="fw-medium text-dark">{{ item.name }}</span>
              <span class="text-muted ms-1.5 font-monospace">× {{ item.quantity }}</span>
            </div>
            <div class="d-flex align-items-center justify-content-between w-100 w-sm-auto gap-3 pt-1 pt-sm-0">
              <span class="font-monospace fw-bold">NT$ {{ (item.price * item.quantity).toLocaleString() }}</span>
              <template v-if="(order.shippingStatus || order.status) === 'DELIVERED'">
                <button
                  v-if="!isItemReviewed(order.id, item.name)"
                  type="button"
                  class="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 font-monospace"
                  style="font-size: 11px;"
                  @click="openReviewModal(order, item)"
                >
                  ★ 評價曬圖
                </button>
                <span v-else class="badge bg-light text-muted border font-monospace" style="font-size: 10.5px;">
                  ✓ 已評價
                </span>
              </template>
            </div>
          </div>
        </div>

        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center pt-2.5 border-top small gap-2">
          <div class="text-muted d-flex align-items-center gap-2 flex-wrap">
            <span>{{ order.shippingMethod }}</span>
            <span v-if="order.trackingCode" class="badge bg-light text-dark border font-monospace">
              {{ order.trackingCode }}
            </span>
          </div>
          <div class="d-flex align-items-center justify-content-between w-100 w-sm-auto gap-2 pt-1 pt-sm-0">
            <span class="text-muted d-sm-none font-monospace">實付總額</span>
            <div class="text-end">
              <span class="fw-bold fs-6 font-monospace" style="color: var(--md-primary, #9b7e68);">
                NT$ {{ order.amount.toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 模組 2：常用收件地址管理 (RWD 卡片對齊) ==================== -->
    <div v-if="activeMainTab === 'addresses'" class="d-flex flex-column gap-3">
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h2 class="h6 fw-bold text-dark font-serif mb-0">常用收件地址簿 (ADDRESS BOOK)</h2>
          <span class="text-muted small" style="font-size: 11px;">管理宅配地址與超商自選門市</span>
        </div>
        <button
          type="button"
          class="btn btn-primary btn-sm rounded-pill px-3 py-1.5 fw-bold"
          @click="openAddAddressModal"
        >
          + 新增常用地址
        </button>
      </div>

      <div v-if="(authStore.user?.savedAddresses || []).length === 0" class="card-korean text-center py-5 text-muted bg-white">
        <MapPin class="mb-2 opacity-40 text-primary" style="width: 40px; height: 40px;" />
        <h3 class="h6 fw-bold text-dark mb-1">尚未建立任何常用收件地址</h3>
        <p class="small text-muted mb-2">新增常用地址後，於結帳流程可一鍵快速帶入</p>
        <button class="btn btn-outline-primary btn-sm rounded-pill px-3" @click="openAddAddressModal">
          立即新增第一筆
        </button>
      </div>

      <div v-else class="row g-3">
        <div
          v-for="addr in authStore.user.savedAddresses"
          :key="addr.id"
          class="col-12 col-md-6"
        >
          <div
            class="card-korean p-3.5 bg-white border h-100 d-flex flex-column justify-content-between"
            :class="{ 'border-primary shadow-xs ring-1': addr.isDefault }"
          >
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center gap-1.5 flex-wrap">
                  <span
                    class="badge rounded-pill font-monospace"
                    :class="addr.type === 'HOME' ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success'"
                    style="font-size: 9.5px;"
                  >
                    {{ addr.type === 'HOME' ? '宅配到府' : '超商取貨' }}
                  </span>
                  <span v-if="addr.isDefault" class="badge bg-primary text-white font-monospace" style="font-size: 9.5px;">
                    預設地址
                  </span>
                </div>

                <div class="d-flex gap-1.5">
                  <button
                    type="button"
                    class="btn btn-link btn-sm text-secondary p-0 text-decoration-none"
                    style="font-size: 11px;"
                    @click="openEditAddressModal(addr)"
                  >
                    編輯
                  </button>
                  <span class="text-muted" style="font-size: 10px;">|</span>
                  <button
                    type="button"
                    class="btn btn-link btn-sm text-danger p-0 text-decoration-none"
                    style="font-size: 11px;"
                    @click="handleDeleteAddress(addr.id)"
                  >
                    刪除
                  </button>
                </div>
              </div>

              <div class="fw-bold text-dark fs-6 mb-0.5">{{ addr.recipientName }}</div>
              <div class="text-muted small font-monospace mb-2">{{ addr.phone }}</div>

              <div class="small text-secondary mb-3">
                <template v-if="addr.type === 'HOME'">
                  {{ addr.city }}{{ addr.district }}{{ addr.detail }}
                </template>
                <template v-else>
                  <strong>{{ addr.cvsName }}</strong> (店號: {{ addr.cvsCode }})
                  <div class="text-muted" style="font-size: 11px;">{{ addr.city }}{{ addr.district }}</div>
                </template>
              </div>
            </div>

            <div class="pt-2 border-top mt-auto">
              <button
                v-if="!addr.isDefault"
                type="button"
                class="btn btn-outline-secondary btn-sm rounded-pill w-100 py-1"
                style="font-size: 11px;"
                @click="authStore.setDefaultAddress(addr.id)"
              >
                設為結帳預設地址
              </button>
              <div v-else class="text-success small font-monospace text-center py-1 fw-bold" style="font-size: 11px;">
                ✓ 結帳時優先預載此地址
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 模組 3：紅利點數專區 ==================== -->
    <div v-if="activeMainTab === 'points'" class="d-flex flex-column gap-3.5 gap-md-4">
      <div class="card-korean p-3.5 p-sm-4 shadow-sm bg-white" style="background: linear-gradient(135deg, #faf7f4 0%, #ede7e0 100%);">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <span class="badge bg-dark rounded-pill px-2.5 py-1 mb-2 font-monospace" style="font-size: 9.5px;">
              MD REWARD CLUB
            </span>
            <h2 class="h5 fw-bold text-dark mb-1">我的紅利點數餘額</h2>
            <div class="text-muted small" style="font-size: 12px;">1 點紅利 = NT$ 1 元，結帳時可全額抵扣訂單總額最高 20%</div>
          </div>
          <div class="text-start text-sm-end w-100 w-sm-auto pt-2 pt-sm-0 border-top border-sm-top-0">
            <div class="display-6 fw-bold font-monospace" style="color: var(--md-primary, #9b7e68);">
              {{ (authStore.user?.points || 0).toLocaleString() }} <span class="fs-6 text-dark font-sans">點</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-korean p-3.5 p-sm-4 shadow-sm bg-white">
        <h3 class="fs-6 fw-bold text-dark mb-3">點數收支異動紀錄</h3>
        <div v-if="(authStore.user?.pointsHistory || []).length === 0" class="text-center py-4 text-muted small">
          尚無點數收支紀錄
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle small mb-0">
            <thead class="table-light">
              <tr class="text-secondary text-nowrap" style="font-size: 11px;">
                <th>時間</th>
                <th>摘要</th>
                <th>關聯單號</th>
                <th class="text-end">變動點數</th>
                <th class="text-end">結存餘額</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in authStore.user.pointsHistory" :key="h.id">
                <td class="text-muted font-monospace text-nowrap">{{ h.createdAt }}</td>
                <td class="text-nowrap">{{ h.title }}</td>
                <td class="font-monospace text-muted text-nowrap">{{ h.orderId || '—' }}</td>
                <td class="text-end font-monospace fw-bold text-nowrap" :class="h.amount > 0 ? 'text-success' : 'text-primary'">
                  {{ h.amount > 0 ? `+${h.amount}` : h.amount }} 點
                </td>
                <td class="text-end font-monospace text-nowrap">{{ h.balance }} 點</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== 模組 4：願望清單 ==================== -->
    <div v-if="activeMainTab === 'wishlist'" class="d-flex flex-column gap-3">
      <div v-if="wishlistProducts.length === 0" class="card-korean text-center py-5 text-muted bg-white">
        <Heart class="mb-2 opacity-40 text-danger" style="width: 40px; height: 40px;" />
        <h2 class="h6 fw-bold text-dark">願望清單目前是空的</h2>
        <router-link to="/" class="btn btn-outline-secondary btn-sm rounded-pill px-4 mt-2">前往挑選新品</router-link>
      </div>
      <div v-else class="row g-2.5 g-sm-3">
        <div v-for="p in wishlistProducts" :key="p.id" class="col-12 col-sm-6">
          <div class="card-korean p-2.5 p-sm-3 d-flex gap-2.5 gap-sm-3 align-items-center bg-white shadow-xs">
            <img :src="p.image" class="rounded object-fit-cover flex-shrink-0" style="width: 60px; height: 80px;" />
            <div class="flex-grow-1 min-w-0">
              <h3 class="fw-bold fs-6 text-dark text-truncate mb-1 cursor-pointer" @click="$router.push(`/product/${p.id}`)">{{ p.name }}</h3>
              <div class="fw-bold font-monospace mb-2" style="color: var(--md-primary, #9b7e68);">NT$ {{ p.basePrice.toLocaleString() }}</div>
              <button class="btn btn-primary btn-sm rounded-pill px-3 py-1 small" @click="$router.push(`/product/${p.id}`)">選購款式</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 模組 5：補貨提醒 ==================== -->
    <div v-if="activeMainTab === 'restock'" class="d-flex flex-column gap-2.5 gap-sm-3">
      <div v-if="(authStore.user?.restockRequests || []).length === 0" class="card-korean text-center py-5 text-muted bg-white">
        <Bell class="mb-2 opacity-40" style="width: 40px; height: 40px;" />
        <div class="small">目前沒有任何補貨提醒登記</div>
      </div>
      <div v-for="req in authStore.user?.restockRequests" :key="req.id" class="card-korean p-3 p-sm-3.5 bg-white shadow-xs">
        <div class="d-flex justify-content-between mb-1">
          <strong class="text-dark">{{ req.productName }}</strong>
          <span class="badge bg-warning-subtle text-warning-emphasis">待補貨</span>
        </div>
        <div class="small text-muted mb-2">預約規格：{{ req.skuName }}</div>
        <button class="btn btn-link btn-sm text-danger p-0 text-decoration-none" style="font-size: 11px;" @click="authStore.cancelRestockAlert(req.id)">取消提醒</button>
      </div>
    </div>

    <!-- 彈窗 1：會員基本資料修改 Modal -->
    <Teleport to="body">
      <div v-if="showProfileModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered modal-sm-custom" style="max-width: 440px;">
          <div class="modal-content rounded-4 border-0 p-3.5 p-sm-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-6 fw-bold text-dark d-flex align-items-center gap-2">
                <Edit2 style="width: 16px; height: 16px; color: var(--md-primary, #9b7e68);" />
                <span>編輯會員基本資料</span>
              </h3>
              <button type="button" class="btn-close" @click="showProfileModal = false"></button>
            </div>

            <div class="modal-body small px-1 py-3">
              <form @submit.prevent="submitProfileUpdate" class="d-flex flex-column gap-3">
                <div>
                  <label class="form-label text-secondary mb-1">真實姓名 *</label>
                  <input v-model="profileForm.name" required type="text" class="form-control form-control-sm" placeholder="請輸入姓名" />
                </div>
                <div>
                  <label class="form-label text-secondary mb-1">手機號碼 (用於簡訊通知) *</label>
                  <input v-model="profileForm.phone" required type="tel" pattern="^09\d{8}$" class="form-control form-control-sm font-monospace" placeholder="0912345678" />
                </div>
                <div>
                  <label class="form-label text-secondary mb-1">電子信箱 Email (發票載具通知)</label>
                  <input v-model="profileForm.email" type="email" class="form-control form-control-sm font-monospace" placeholder="user@md-korea.com" />
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2 fw-bold">
                    儲存更新資料
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 彈窗 2：常用地址 新增/編輯 Modal -->
    <Teleport to="body">
      <div v-if="showAddressModal" class="modal fade show d-block modal-backdrop-custom" tabindex="-1" style="z-index: 1070;">
        <div class="modal-dialog modal-dialog-centered modal-sm-custom" style="max-width: 480px;">
          <div class="modal-content rounded-4 border-0 p-3.5 p-sm-4 shadow-xl">
            <div class="modal-header border-0 pb-0">
              <h3 class="modal-title fs-6 fw-bold text-dark d-flex align-items-center gap-2">
                <MapPin style="width: 16px; height: 16px; color: var(--md-primary, #9b7e68);" />
                <span>{{ isEditingAddress ? '編輯常用收件地址' : '新增常用收件地址' }}</span>
              </h3>
              <button type="button" class="btn-close" @click="showAddressModal = false"></button>
            </div>

            <div class="modal-body small px-1 py-3">
              <form @submit.prevent="submitAddress" class="d-flex flex-column gap-3">
                <div>
                  <label class="form-label text-secondary mb-1">收件方式 *</label>
                  <div class="btn-group btn-group-sm w-100" role="group">
                    <button
                      type="button"
                      class="btn"
                      :class="addressForm.type === 'HOME' ? 'btn-primary' : 'btn-outline-secondary'"
                      @click="addressForm.type = 'HOME'"
                    >
                      黑貓宅配到府
                    </button>
                    <button
                      type="button"
                      class="btn"
                      :class="addressForm.type === 'CVS' ? 'btn-primary' : 'btn-outline-secondary'"
                      @click="addressForm.type = 'CVS'"
                    >
                      超商取貨
                    </button>
                  </div>
                </div>

                <div class="row g-2">
                  <div class="col-12 col-sm-6">
                    <label class="form-label text-secondary mb-1">收件人姓名 *</label>
                    <input v-model="addressForm.recipientName" required type="text" class="form-control form-control-sm" placeholder="例如：陳大文" />
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label text-secondary mb-1">收件人手機 *</label>
                    <input v-model="addressForm.phone" required type="tel" pattern="^09\d{8}$" class="form-control form-control-sm font-monospace" placeholder="0912345678" />
                  </div>
                </div>

                <template v-if="addressForm.type === 'HOME'">
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label text-secondary mb-1">縣市 *</label>
                      <input v-model="addressForm.city" required type="text" class="form-control form-control-sm" placeholder="如：台北市" />
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary mb-1">鄉鎮市區 *</label>
                      <input v-model="addressForm.district" required type="text" class="form-control form-control-sm" placeholder="如：信義區" />
                    </div>
                  </div>
                  <div>
                    <label class="form-label text-secondary mb-1">詳細地址 *</label>
                    <input v-model="addressForm.detail" required type="text" class="form-control form-control-sm" placeholder="路街段門牌樓層" />
                  </div>
                </template>

                <template v-else>
                  <div class="row g-2">
                    <div class="col-7">
                      <label class="form-label text-secondary mb-1">門市名稱 *</label>
                      <input v-model="addressForm.cvsName" required type="text" class="form-control form-control-sm" placeholder="如：7-11 鑫鑫門市" />
                    </div>
                    <div class="col-5">
                      <label class="form-label text-secondary mb-1">門市代號 *</label>
                      <input v-model="addressForm.cvsCode" required type="text" class="form-control form-control-sm font-monospace" placeholder="6碼門市號" />
                    </div>
                  </div>
                  <div class="row g-2">
                    <div class="col-6">
                      <label class="form-label text-secondary mb-1">所在縣市</label>
                      <input v-model="addressForm.city" type="text" class="form-control form-control-sm" placeholder="台北市" />
                    </div>
                    <div class="col-6">
                      <label class="form-label text-secondary mb-1">行政區</label>
                      <input v-model="addressForm.district" type="text" class="form-control form-control-sm" placeholder="大安區" />
                    </div>
                  </div>
                </template>

                <div class="form-check mt-1">
                  <input v-model="addressForm.isDefault" class="form-check-input" type="checkbox" id="defaultAddrCheck" />
                  <label class="form-check-label text-secondary" for="defaultAddrCheck">
                    設為結帳預設收件地址
                  </label>
                </div>

                <div class="pt-2">
                  <button type="submit" class="btn btn-primary w-100 rounded-pill py-2 fw-bold">
                    {{ isEditingAddress ? '儲存地址修改' : '確認新增常用地址' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 評價曬圖彈窗 -->
    <ReviewModal
      :is-open="showReviewModal"
      :order-id="activeOrder?.id"
      :product-id="activeProductId"
      :item="activeItem"
      @close="showReviewModal = false"
      @submitted="showReviewModal = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  LogOut,
  Package,
  Heart,
  Bell,
  Coins,
  CreditCard,
  PackageSearch,
  Truck,
  CheckCircle2,
  RotateCcw,
  Ban,
  Layers,
  Sparkles,
  Crown,
  MapPin,
  Edit2
} from 'lucide-vue-next'
import ReviewModal from '../components/ReviewModal.vue'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'
import { useAdminStore } from '../stores/adminStore'

const authStore = useAuthStore()
const productStore = useProductStore()
const adminStore = useAdminStore()
const router = useRouter()

const activeMainTab = ref('orders')
const currentStatus = ref('ALL')

const showReviewModal = ref(false)
const activeOrder = ref(null)
const activeItem = ref(null)
const activeProductId = ref(1)

// 會員個人資料修改
const showProfileModal = ref(false)
const profileForm = reactive({
  name: '',
  phone: '',
  email: ''
})

const openProfileModal = () => {
  profileForm.name = authStore.user?.name || ''
  profileForm.phone = authStore.user?.phone || ''
  profileForm.email = authStore.user?.email || ''
  showProfileModal.value = true
}

const submitProfileUpdate = () => {
  const res = authStore.updateProfile(profileForm)
  alert(res.message)
  if (res.success) {
    showProfileModal.value = false
  }
}

// 常用地址管理
const showAddressModal = ref(false)
const isEditingAddress = ref(false)
const currentEditAddrId = ref(null)

const addressForm = reactive({
  recipientName: '',
  phone: '',
  type: 'HOME',
  city: '台北市',
  district: '',
  detail: '',
  cvsName: '',
  cvsCode: '',
  isDefault: false
})

const openAddAddressModal = () => {
  isEditingAddress.value = false
  currentEditAddrId.value = null
  addressForm.recipientName = authStore.user?.name || ''
  addressForm.phone = authStore.user?.phone || ''
  addressForm.type = 'HOME'
  addressForm.city = '台北市'
  addressForm.district = ''
  addressForm.detail = ''
  addressForm.cvsName = ''
  addressForm.cvsCode = ''
  addressForm.isDefault = false
  showAddressModal.value = true
}

const openEditAddressModal = (addr) => {
  isEditingAddress.value = true
  currentEditAddrId.value = addr.id
  addressForm.recipientName = addr.recipientName
  addressForm.phone = addr.phone
  addressForm.type = addr.type
  addressForm.city = addr.city
  addressForm.district = addr.district
  addressForm.detail = addr.detail
  addressForm.cvsName = addr.cvsName
  addressForm.cvsCode = addr.cvsCode
  addressForm.isDefault = addr.isDefault
  showAddressModal.value = true
}

const submitAddress = () => {
  if (isEditingAddress.value && currentEditAddrId.value) {
    const res = authStore.updateAddress(currentEditAddrId.value, addressForm)
    alert(res.message)
  } else {
    const res = authStore.addAddress(addressForm)
    alert(res.message)
  }
  showAddressModal.value = false
}

const handleDeleteAddress = (id) => {
  if (confirm('確定要刪除此筆收件地址嗎？')) {
    const res = authStore.deleteAddress(id)
    alert(res.message)
  }
}

// 步驟條與訂單流程
const interactiveSteps = [
  { key: 'ALL', title: '全部', icon: Layers },
  { key: 'PENDING_PAYMENT', title: '待付款', icon: CreditCard },
  { key: 'PENDING', title: '備貨中', icon: PackageSearch },
  { key: 'SHIPPED', title: '已出貨', icon: Truck },
  { key: 'DELIVERED', title: '已送達', icon: CheckCircle2 },
  { key: 'REFUNDING', title: '售後', icon: RotateCcw },
  { key: 'CANCELLED', title: '已取消', icon: Ban }
]

const displayOrders = computed(() => adminStore.orders || [])

const activeStepIndex = computed(() => {
  return interactiveSteps.findIndex((s) => s.key === currentStatus.value)
})

const getOrderCount = (key) => {
  if (key === 'ALL') return displayOrders.value.length
  return displayOrders.value.filter((o) => (o.shippingStatus || o.status) === key).length
}

const filteredOrders = computed(() => {
  if (currentStatus.value === 'ALL') return displayOrders.value
  return displayOrders.value.filter((o) => (o.shippingStatus || o.status) === currentStatus.value)
})

const getFilterTitle = (key) => {
  const item = interactiveSteps.find((s) => s.key === key)
  return item ? item.title : '全部'
}

const getStatusText = (status) => {
  const map = {
    PENDING_PAYMENT: '待付款',
    PENDING: '備貨中',
    SHIPPED: '已出貨',
    DELIVERED: '交易完成',
    CANCELLED: '已取消',
    REFUNDING: '售後處理中'
  }
  return map[status] || status
}

const getBadgeClass = (status) => {
  const map = {
    PENDING_PAYMENT: 'bg-warning-subtle text-warning-emphasis',
    PENDING: 'bg-secondary-subtle text-secondary-emphasis',
    SHIPPED: 'bg-info-subtle text-info',
    DELIVERED: 'bg-success-subtle text-success',
    CANCELLED: 'bg-light text-muted border',
    REFUNDING: 'bg-danger-subtle text-danger-emphasis'
  }
  return map[status] || 'bg-light text-dark'
}

const isItemReviewed = (orderId, itemName) => {
  return productStore.reviews.some((r) => r.orderId === orderId)
}

const openReviewModal = (order, item) => {
  activeOrder.value = order
  activeItem.value = item
  const found = productStore.products.find((p) => item.name.includes(p.name))
  activeProductId.value = found ? found.id : 1
  showReviewModal.value = true
}

const wishlistProducts = computed(() => {
  const ids = authStore.user?.wishlist || []
  return productStore.products.filter((p) => ids.includes(p.id))
})

const handleLogout = () => {
  if (confirm('確定登出？')) {
    authStore.logout()
    router.push('/')
  }
}
</script>

<style scoped>
.profile-page-container {
  max-width: 1040px;
  margin: 0 auto;
}

/* ==================== 1. 名片卡片 RWD 樣式 ==================== */
.member-card-hero {
  background: linear-gradient(135deg, #ffffff 0%, #faf8f5 100%) !important;
  border-radius: 16px !important;
  border-color: var(--md-border, #ede8e1) !important;
}

.member-card-glow {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(155, 126, 104, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
}

.avatar-ring-container {
  width: clamp(52px, 12vw, 64px);
  height: clamp(52px, 12vw, 64px);
  padding: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ded3c7 0%, #9b7e68 100%);
  box-shadow: 0 4px 14px rgba(155, 126, 104, 0.22);
}

.avatar-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--md-primary, #9b7e68);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 600;
  border: 2px solid #ffffff;
}

.vip-seal-badge {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b89c85 0%, #836752 100%);
  border: 1.5px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tier-badge {
  background: linear-gradient(90deg, #9b7e68 0%, #836752 100%);
  color: #ffffff;
  font-size: 9.5px;
  letter-spacing: 0.06em;
  padding: 0.35em 0.75em;
  border-radius: 9999px;
  box-shadow: 0 2px 6px rgba(155, 126, 104, 0.25);
}

.bullet-divider {
  opacity: 0.4;
}

.points-asset-card {
  min-width: 140px;
  background-color: #ffffff;
  border-color: var(--md-border, #ede8e1) !important;
  box-shadow: 0 2px 8px rgba(45, 38, 33, 0.03);
}

.asset-title {
  font-size: 9px;
  letter-spacing: 0.08em;
}

.logout-btn {
  padding: 0.45rem 0.9rem;
  font-size: 11.5px;
  height: 38px;
}

/* ==================== 2. 頁籤橫向滾動 RWD ==================== */
.tabs-scroll-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  font-size: clamp(11.5px, 2.5vw, 13px);
}

.tab-icon {
  width: 14px;
  height: 14px;
}

/* ==================== 3. 步驟條橫向滾動 ==================== */
.stepper-scroll-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0.5rem 0.25rem 0.75rem;
}

.stepper-track {
  min-width: 540px;
  padding: 0.25rem 0.5rem;
}

.step-node-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  z-index: 2;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.step-node-item:hover {
  transform: translateY(-2px);
}

.node-circle-wrap {
  width: 40px;
  height: 40px;
}

.node-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid var(--md-border, #ede8e1);
  color: var(--md-text-muted, #9c9289);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.node-icon {
  width: 16px;
  height: 16px;
}

.node-label {
  margin-top: 0.45rem;
  font-size: 11px;
  font-weight: 500;
  color: var(--md-text-secondary, #70665f);
  white-space: nowrap;
  letter-spacing: 0.02em;
  transition: color 0.2s ease;
}

.node-count-badge {
  background-color: #2d2621;
  color: #ffffff;
  font-size: 8px;
  padding: 0.2em 0.5em;
  border: 1.5px solid #ffffff;
  z-index: 3;
}

.step-node-item.is-active .node-circle {
  background-color: var(--md-primary, #9b7e68) !important;
  border-color: var(--md-primary, #9b7e68) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(155, 126, 104, 0.35);
  transform: scale(1.1);
}

.step-node-item.is-active .node-label {
  color: var(--md-primary, #9b7e68) !important;
  font-weight: 700;
}

.step-node-item.is-passed:not(.is-active) .node-circle {
  border-color: rgba(155, 126, 104, 0.5);
  color: var(--md-primary, #9b7e68);
  background-color: var(--md-primary-light, #f7f3ee);
}

.step-connector {
  height: 3px;
  min-width: 24px;
  margin: 0 4px;
  margin-bottom: 1.4rem;
  border-radius: 9999px;
  overflow: hidden;
  z-index: 1;
}

.connector-line-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--md-border-light, #f3efe9);
}

.connector-line-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--md-primary, #9b7e68);
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);
}

.pulse-dot {
  animation: pulse 2s infinite;
}

.ring-1 {
  outline: 2px solid var(--md-primary, #9b7e68);
}

/* Modal 手機端小螢幕邊距保護 */
@media (max-width: 575.98px) {
  .modal-sm-custom {
    margin: 0.75rem;
  }
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

.cursor-pointer {
  cursor: pointer;
}
</style>