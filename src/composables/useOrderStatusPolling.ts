import { onBeforeUnmount } from 'vue'
import { type PayStatus } from '../api/payment'
import { usePaymentStore } from '../store/payment'

export function useOrderStatusPolling() {
  const paymentStore = usePaymentStore()

  function start(orderNo: string, onDone?: (status: PayStatus) => void): void {
    paymentStore.startPolling(orderNo, onDone)
  }

  function stop(): void {
    paymentStore.stopPolling()
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    start,
    stop,
  }
}
