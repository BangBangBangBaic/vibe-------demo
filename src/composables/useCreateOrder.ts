import { computed, ref } from 'vue'
import { usePaymentStore } from '../store/payment'
import { buildMobilePayLink } from '../utils/qrcode'

export function useCreateOrder() {
  const paymentStore = usePaymentStore()
  const loading = ref(false)
  const errorMessage = ref('')

  const qrContent = computed(() =>
    paymentStore.orderNo ? buildMobilePayLink(paymentStore.orderNo) : ''
  )

  async function submitCreateOrder(amount: number, description: string): Promise<void> {
    loading.value = true
    errorMessage.value = ''
    try {
      await paymentStore.createOrder(amount, description)
    } catch (error) {
      const message = error instanceof Error ? error.message : '创建订单失败'
      errorMessage.value = message
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    qrContent,
    submitCreateOrder,
  }
}
