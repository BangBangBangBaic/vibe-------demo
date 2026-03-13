import type { OrderStatus } from "../../shared/types/api";

export interface CreateOrderRequest {
  description: string;
  amount: {
    total: number;
  };
  payer: {
    openid: string;
  };
}

export interface CreateOrderResult {
  orderNo: string;
  amount: {
    total: number;
  };
  qrCodeContent: string;
}

export interface BuildJsapiRequest {
  orderNo: string;
}

export interface NotifyRequest {
  id: string;
  event_type: "TRANSACTION.SUCCESS" | "TRANSACTION.CLOSED";
  resource: {
    out_trade_no: string;
    transaction_id: string;
    trade_state: OrderStatus;
    amount: {
      total: number;
    };
  };
}

export interface JsapiPayParams {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: "RSA";
  paySign: string;
}

export interface OrderEntity {
  orderNo: string;
  description: string;
  amountTotal: number;
  openid: string;
  status: OrderStatus;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}
