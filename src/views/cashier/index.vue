<template>
  <main class="page cashier-page">
    <h1 class="page-title">商家收款台</h1>
    <p class="page-desc">创建订单后展示二维码，顾客扫码进入手机支付页。</p>

    <form class="form" @submit.prevent="handleCreateOrder">
      <label>
        收款金额 (元)
        <input v-model.number="amountInput" type="number" min="0.01" step="0.01" required />
      </label>

      <label>
        商品描述
        <input v-model.trim="descriptionInput" type="text" maxlength="64" required />
      </label>

      <button type="submit" :disabled="loading">{{ loading ? '生成中...' : '生成二维码' }}</button>
    </form>

    <ErrorState v-if="errorMessage" :message="errorMessage" @retry="handleCreateOrder" />

    <QrDisplay :content="qrContent" />

    <p v-if="orderNo" class="order-text">订单号: {{ orderNo }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ErrorState from '../../components/common/ErrorState.vue'
import QrDisplay from '../../components/pay/QrDisplay.vue'
import { useCreateOrder } from '../../composables/useCreateOrder'
import { usePaymentStore } from '../../store/payment'

const paymentStore = usePaymentStore()
const amountInput = ref(1)
const descriptionInput = ref('微信扫码收款')

const { loading, errorMessage, qrContent, submitCreateOrder } = useCreateOrder()

const orderNo = paymentStore.orderNo

async function handleCreateOrder(): Promise<void> {
  if (amountInput.value <= 0) {
    return
  }

  await submitCreateOrder(amountInput.value, descriptionInput.value)
}
</script>

<style scoped>
.cashier-page {
  display: grid;
  gap: 18px;
}

.form {
  display: grid;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}

label {
  display: grid;
  gap: 7px;
  color: var(--text-muted);
}

input {
  height: 44px;
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0 12px;
  font-size: 15px;
}

button {
  height: 44px;
  border-radius: 10px;
  border: 0;
  color: #fff;
  background: linear-gradient(90deg, var(--brand), var(--brand-strong));
  cursor: pointer;
}

.order-text {
  margin: 0;
  color: var(--text-muted);
}
</style>
