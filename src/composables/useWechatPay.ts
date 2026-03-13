import { ref } from 'vue'
import { usePaymentStore } from '../store/payment'

export function useWechatPay() {
  const paymentStore = usePaymentStore()
  const loading = ref(false)
  const errorMessage = ref('')

  async function requestPay(orderNo: string): Promise<void> {
    loading.value = true
    errorMessage.value = ''

    try {
      await paymentStore.requestPrepayParams(orderNo)
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求支付参数失败'
      errorMessage.value = message
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    requestPay,
  }
}
