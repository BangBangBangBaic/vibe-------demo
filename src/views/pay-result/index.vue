<template>
  <main class="page result-page">
    <h1 class="page-title">支付结果</h1>
    <p class="page-desc">订单号: {{ orderNo }}</p>

    <section class="result-card" :class="statusClass">
      <p class="status-text">{{ statusText }}</p>
      <p class="status-desc">{{ statusDesc }}</p>
    </section>

    <RouterLink class="back-btn" to="/cashier">返回收款台</RouterLink>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { PayStatus } from '../../api/payment'

const props = defineProps<{
  orderNo: string
}>()

const route = useRoute()

const status = computed<PayStatus>(() => {
  const raw = String(route.query.status || 'FAILED') as PayStatus
  return raw
})

const statusText = computed(() => {
  if (status.value === 'SUCCESS') {
    return '支付成功'
  }
  if (status.value === 'PROCESSING') {
    return '支付处理中'
  }
  if (status.value === 'CANCELLED') {
    return '用户取消支付'
  }
  if (status.value === 'TIMEOUT') {
    return '支付超时'
  }
  return '支付失败'
})

const statusDesc = computed(() => {
  if (status.value === 'SUCCESS') {
    return '订单已完成，款项将按商户结算规则入账。'
  }
  return '请返回收款台重试，或检查后端Mock通知与订单状态。'
})

const statusClass = computed(() =>
  status.value === 'SUCCESS' ? 'success' : status.value === 'PROCESSING' ? 'processing' : 'failed'
)

const orderNo = computed(() => props.orderNo)
</script>

<style scoped>
.result-page {
  display: grid;
  gap: 16px;
}

.result-card {
  border-radius: 16px;
  border: 1px solid var(--border);
  padding: 18px;
  background: var(--surface-soft);
}

.result-card.success {
  border-color: color-mix(in srgb, var(--brand) 40%, white);
}

.result-card.processing {
  border-color: #f2ca8a;
}

.result-card.failed {
  border-color: color-mix(in srgb, var(--danger) 40%, white);
}

.status-text {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.status-desc {
  margin: 8px 0 0;
  color: var(--text-muted);
}

.back-btn {
  justify-self: start;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 10px 14px;
  background: #fff;
}
</style>
