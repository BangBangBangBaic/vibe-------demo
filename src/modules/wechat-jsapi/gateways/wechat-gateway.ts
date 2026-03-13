import type { OrderStatus } from "../../../shared/types/api";

export interface WechatCreateJsapiRequest {
  out_trade_no: string;
  description: string;
  amount: {
    total: number;
    currency: "CNY";
  };
  payer: {
    sp_openid: string;
  };
}

export interface WechatCreateJsapiResponse {
  prepay_id: string;
}

export interface WechatQueryTransactionResponse {
  out_trade_no: string;
  transaction_id: string;
  trade_state: OrderStatus;
  amount: {
    total: number;
    payer_total: number;
    currency: "CNY";
  };
}

export interface WechatGateway {
  createPartnerTransactionJsapi(
    request: WechatCreateJsapiRequest,
  ): Promise<WechatCreateJsapiResponse>;
  queryByOutTradeNo(outTradeNo: string): Promise<WechatQueryTransactionResponse>;
}
