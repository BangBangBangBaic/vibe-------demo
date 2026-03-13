import type { Context } from "koa";
import { AppError } from "../../../shared/errors/app-error";
import { success } from "../../../shared/utils/response";
import type {
  BuildJsapiRequest,
  CreateOrderRequest,
  NotifyRequest,
} from "../types";
import { PaymentService } from "../services/payment-service";

export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  public createOrder = (ctx: Context): void => {
    const body = ctx.request.body as Partial<CreateOrderRequest>;
    this.validateCreateOrderBody(body);

    const result = this.paymentService.createOrder(body as CreateOrderRequest);
    ctx.body = success(result, "Order created");
  };

  public buildJsapiPrepay = async (ctx: Context): Promise<void> => {
    const body = ctx.request.body as Partial<BuildJsapiRequest>;
    if (!body.orderNo || body.orderNo.trim().length === 0) {
      throw new AppError("orderNo is required", 400);
    }

    const result = await this.paymentService.buildJsapiParams({ orderNo: body.orderNo });
    ctx.body = success(result, "JSAPI params generated");
  };

  public handleWechatNotify = (ctx: Context): void => {
    const body = ctx.request.body as Partial<NotifyRequest>;
    this.validateNotifyBody(body);
    this.paymentService.handleWechatNotify(body as NotifyRequest);
    ctx.body = success({ acknowledged: true }, "Notify handled");
  };

  public queryOrderStatus = (ctx: Context): void => {
    const orderNo = ctx.params.orderNo;
    if (!orderNo || orderNo.trim().length === 0) {
      throw new AppError("orderNo is required", 400);
    }

    const result = this.paymentService.queryOrderStatus(orderNo);
    ctx.body = success(result);
  };

  private validateCreateOrderBody(body: Partial<CreateOrderRequest>): void {
    if (!body.description || body.description.trim().length === 0) {
      throw new AppError("description is required", 400);
    }

    if (!body.amount || typeof body.amount.total !== "number" || body.amount.total <= 0) {
      throw new AppError("amount.total must be a positive number", 400);
    }

    if (!body.payer || !body.payer.openid || body.payer.openid.trim().length === 0) {
      throw new AppError("payer.openid is required", 400);
    }
  }

  private validateNotifyBody(body: Partial<NotifyRequest>): void {
    if (!body.id || body.id.trim().length === 0) {
      throw new AppError("id is required", 400);
    }

    if (!body.event_type) {
      throw new AppError("event_type is required", 400);
    }

    if (!body.resource) {
      throw new AppError("resource is required", 400);
    }

    if (!body.resource.out_trade_no || !body.resource.transaction_id || !body.resource.amount) {
      throw new AppError("resource fields are incomplete", 400);
    }

    if (typeof body.resource.amount.total !== "number" || body.resource.amount.total <= 0) {
      throw new AppError("resource.amount.total must be a positive number", 400);
    }
  }
}
