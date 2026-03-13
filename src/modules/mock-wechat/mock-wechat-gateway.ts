import { AppError } from "../../shared/errors/app-error";
import type {
  WechatCreateJsapiRequest,
  WechatCreateJsapiResponse,
  WechatGateway,
  WechatQueryTransactionResponse,
} from "../wechat-jsapi/gateways/wechat-gateway";
import { OrderRepository } from "../payment/repositories/order-repository";

export class MockWechatGateway implements WechatGateway {
  constructor(private readonly orderRepository: OrderRepository) {}

  public async createPartnerTransactionJsapi(
    request: WechatCreateJsapiRequest,
  ): Promise<WechatCreateJsapiResponse> {
    if (request.description.includes("SYSTEM_BUSY") || request.amount.total === 500001) {
      throw new AppError("System busy", 503);
    }

    const order = this.orderRepository.findByOrderNo(request.out_trade_no);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.amountTotal !== request.amount.total) {
      throw new AppError("Amount mismatch", 400);
    }

    return {
      prepay_id: `wx201410272009395522657a690389285100${order.orderNo.slice(-6)}`,
    };
  }

  public async queryByOutTradeNo(outTradeNo: string): Promise<WechatQueryTransactionResponse> {
    const order = this.orderRepository.findByOrderNo(outTradeNo);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    return {
      out_trade_no: order.orderNo,
      transaction_id: order.transactionId ?? `420000000000${order.orderNo.slice(-10)}`,
      trade_state: order.status,
      amount: {
        total: order.amountTotal,
        payer_total: order.amountTotal,
        currency: "CNY",
      },
    };
  }
}
