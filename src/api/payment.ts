import { request } from '../utils/request'

export type PayStatus = 'NOTPAY' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT'

export interface CreateOrderRequest {
  amount: number
  description: string
}

export interface CreateOrderResponse {
  orderNo: string
  amount: number
  description: string
  payStatus: PayStatus
}

export interface OrderStatusResponse {
  orderNo: string
  amount: number
  description: string
  payStatus: PayStatus
}

export interface JsapiPrepayRequest {
  orderNo: string
}

export interface JsapiPrepayResponse {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'RSA'
  paySign: string
}

export interface MockNotifyRequest {
  orderNo: string
  tradeState: 'SUCCESS' | 'NOTPAY' | 'CLOSED' | 'USERPAYING' | 'PAYERROR'
}

export interface MockNotifyResponse {
  success: boolean
}

export function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>('/api/pay/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getOrderStatus(orderNo: string): Promise<OrderStatusResponse> {
  return request<OrderStatusResponse>(`/api/pay/orders/${encodeURIComponent(orderNo)}`)
}

export function getJsapiPrepay(payload: JsapiPrepayRequest): Promise<JsapiPrepayResponse> {
  return request<JsapiPrepayResponse>('/api/pay/jsapi/prepay', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function mockNotify(payload: MockNotifyRequest): Promise<MockNotifyResponse> {
  return request<MockNotifyResponse>('/api/pay/notify/wechat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
