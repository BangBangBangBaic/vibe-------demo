import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  createOrder as createOrderApi,
  getJsapiPrepay,
  getOrderStatus,
  type CreateOrderResponse,
  type JsapiPrepayResponse,
  type PayStatus,
} from '../api/payment'

type PollingTimerId = number

export const usePaymentStore = defineStore('payment', () => {
  const orderNo = ref('')
  const amount = ref(0)
  const description = ref('')
  const payStatus = ref<PayStatus>('NOTPAY')
  const pollingTimerId = ref<PollingTimerId | null>(null)

  const isPaid = computed(() => payStatus.value === 'SUCCESS')

  function patchOrder(data: { orderNo: string; amount: number; description: string; payStatus: PayStatus }): void {
    orderNo.value = data.orderNo
    amount.value = data.amount
    description.value = data.description
    payStatus.value = data.payStatus
  }

  async function createOrder(amountValue: number, descriptionValue: string): Promise<CreateOrderResponse> {
    const result = await createOrderApi({
      amount: amountValue,
      description: descriptionValue,
    })
    patchOrder(result)
    return result
  }

  async function requestPrepayParams(orderNoValue: string): Promise<JsapiPrepayResponse> {
    const prepay = await getJsapiPrepay({ orderNo: orderNoValue })
    return prepay
  }

  function stopPolling(): void {
    if (pollingTimerId.value !== null) {
      window.clearInterval(pollingTimerId.value)
      pollingTimerId.value = null
    }
  }

  async function syncStatus(orderNoValue: string): Promise<PayStatus> {
    const result = await getOrderStatus(orderNoValue)
    patchOrder(result)
    return result.payStatus
  }

  function startPolling(orderNoValue: string, onDone?: (status: PayStatus) => void): void {
    stopPolling()

    pollingTimerId.value = window.setInterval(async () => {
      const status = await syncStatus(orderNoValue)
      if (status === 'SUCCESS' || status === 'FAILED' || status === 'CANCELLED' || status === 'TIMEOUT') {
        stopPolling()
        if (onDone) {
          onDone(status)
        }
      }
    }, 1800) as unknown as number
  }

  return {
    orderNo,
    amount,
    description,
    payStatus,
    pollingTimerId,
    isPaid,
    createOrder,
    requestPrepayParams,
    startPolling,
    stopPolling,
    syncStatus,
  }
})
