<template>
  <main class="page mobile-page">
    <h1 class="page-title">微信支付</h1>
    <p class="page-desc">订单号: {{ orderNo }}</p>

    <AmountCard merchant="微信收款Demo商户" :amount="amount" :description="description" />

    <ErrorState v-if="mergedError" :message="mergedError" @retry="reloadStatus" />

    <LoadingState v-if="isProcessing" text="支付处理中，正在查询订单状态..." />

    <button type="button" class="pay-btn" :disabled="requesting" @click="openSheet">
      {{ requesting ? '请求参数中...' : '确认支付' }}
    </button>

    <WechatSheet :visible="showSheet" @cancel="showSheet = false" @confirm="confirmPay" />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AmountCard from '../../components/pay/AmountCard.vue'
import ErrorState from '../../components/common/ErrorState.vue'
import LoadingState from '../../components/common/LoadingState.vue'
import WechatSheet from '../../components/pay/WechatSheet.vue'
import { useOrderStatusPolling } from '../../composables/useOrderStatusPolling'
import { useWechatPay } from '../../composables/useWechatPay'
import { usePaymentStore } from '../../store/payment'

const props = defineProps<{
  orderNo: string
}>()

const router = useRouter()
const paymentStore = usePaymentStore()
const showSheet = ref(false)
const errorMessage = ref('')

const { loading: requesting, errorMessage: payErrorMessage, requestPay } = useWechatPay()
const { start } = useOrderStatusPolling()

const amount = computed(() => paymentStore.amount)
const description = computed(() => paymentStore.description || '微信扫码支付订单')
const isProcessing = computed(() => paymentStore.payStatus === 'PROCESSING')

async function reloadStatus(): Promise<void> {
  errorMessage.value = ''
  try {
    const status = await paymentStore.syncStatus(props.orderNo)
    if (status === 'SUCCESS' || status === 'FAILED' || status === 'CANCELLED' || status === 'TIMEOUT') {
      await router.push({
        name: 'pay-result',
        params: { orderNo: props.orderNo },
        query: { status },
      })
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '订单查询失败'
  }
}

async function openSheet(): Promise<void> {
  await reloadStatus()
  if (!errorMessage.value) {
    showSheet.value = true
  }
}

async function confirmPay(): Promise<void> {
  showSheet.value = false
  errorMessage.value = ''

  try {
    await requestPay(props.orderNo)
    paymentStore.payStatus = 'PROCESSING'

    start(props.orderNo, async (status) => {
      await router.push({
        name: 'pay-result',
        params: { orderNo: props.orderNo },
        query: { status },
      })
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '支付请求失败'
  }
}

onMounted(async () => {
  await reloadStatus()
})

const mergedError = computed(() => errorMessage.value || payErrorMessage.value)
</script>

<style scoped>
.mobile-page {
  display: grid;
  gap: 16px;
}

.pay-btn {
  height: 48px;
  border: 0;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  background: linear-gradient(90deg, var(--brand), var(--brand-strong));
}

.pay-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
