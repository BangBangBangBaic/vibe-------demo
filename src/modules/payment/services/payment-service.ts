import { createHash, randomUUID } from "crypto";
import type { OrderStatus } from "../../../shared/types/api";
import { AppError } from "../../../shared/errors/app-error";
import { paymentConfig } from "../../../shared/config/payment";
import { generateOrderNo } from "../../../shared/utils/order-no";
import { TtlCache } from "../../../shared/utils/ttl-cache";
import type {
  BuildJsapiRequest,
  CreateOrderRequest,
  CreateOrderResult,
  JsapiPayParams,
  NotifyRequest,
  OrderEntity,
} from "../types";
import { OrderRepository } from "../repositories/order-repository";
import type { WechatGateway } from "../../wechat-jsapi/gateways/wechat-gateway";

const ORDER_STATUS_CACHE_TTL_MS = 30_000;

export class PaymentService {
  private readonly statusCache = new TtlCache<OrderStatus>();

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly wechatGateway: WechatGateway,
  ) {}

  public createOrder(request: CreateOrderRequest): CreateOrderResult {
    const orderNo = generateOrderNo();
    const now = new Date().toISOString();

    const order: OrderEntity = {
      orderNo,
      description: request.description,
      amountTotal: request.amount.total,
      openid: request.payer.openid,
      status: "NOTPAY",
      createdAt: now,
      updatedAt: now,
    };

    this.orderRepository.save(order);
    this.statusCache.set(this.getStatusCacheKey(orderNo), "NOTPAY", ORDER_STATUS_CACHE_TTL_MS);

    return {
      orderNo,
      amount: {
        total: request.amount.total,
      },
      qrCodeContent: `weixin://wxpay/bizpayurl?pr=${orderNo}`,
    };
  }

  public async buildJsapiParams(request: BuildJsapiRequest): Promise<JsapiPayParams> {
    const order = this.orderRepository.findByOrderNo(request.orderNo);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status !== "NOTPAY") {
      throw new AppError("Order is not in payable status", 409);
    }

    const transaction = await this.wechatGateway.createPartnerTransactionJsapi({
      out_trade_no: order.orderNo,
      description: order.description,
      amount: {
        total: order.amountTotal,
        currency: "CNY",
      },
      payer: {
        sp_openid: order.openid,
      },
    });

    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = randomUUID().replace(/-/g, "").slice(0, 32);
    const packageValue = `prepay_id=${transaction.prepay_id}`;
    const signRaw = `${paymentConfig.appId}\n${timeStamp}\n${nonceStr}\n${packageValue}\n`;
    const paySign = createHash("sha256").update(signRaw).digest("hex");

    return {
      appId: paymentConfig.appId,
      timeStamp,
      nonceStr,
      package: packageValue,
      signType: "RSA",
      paySign,
    };
  }

  public handleWechatNotify(request: NotifyRequest): void {
    const order = this.orderRepository.findByOrderNo(request.resource.out_trade_no);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === "SUCCESS") {
      return;
    }

    if (order.amountTotal !== request.resource.amount.total) {
      throw new AppError("Amount mismatch", 400);
    }

    order.status = request.resource.trade_state;
    order.transactionId = request.resource.transaction_id;
    order.updatedAt = new Date().toISOString();
    this.orderRepository.update(order);

    this.statusCache.set(
      this.getStatusCacheKey(order.orderNo),
      order.status,
      ORDER_STATUS_CACHE_TTL_MS,
    );
  }

  public queryOrderStatus(orderNo: string): { orderNo: string; status: OrderStatus } {
    const cacheKey = this.getStatusCacheKey(orderNo);
    const cachedStatus = this.statusCache.get(cacheKey);
    if (cachedStatus) {
      return {
        orderNo,
        status: cachedStatus,
      };
    }

    const order = this.orderRepository.findByOrderNo(orderNo);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    this.statusCache.set(cacheKey, order.status, ORDER_STATUS_CACHE_TTL_MS);
    return {
      orderNo,
      status: order.status,
    };
  }

  private getStatusCacheKey(orderNo: string): string {
    return `pay:order:${orderNo}`;
  }
}
