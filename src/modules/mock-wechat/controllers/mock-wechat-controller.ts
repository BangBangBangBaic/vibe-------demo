import type { Context } from "koa";
import { AppError } from "../../../shared/errors/app-error";
import { success } from "../../../shared/utils/response";
import type { WechatCreateJsapiRequest } from "../../wechat-jsapi/gateways/wechat-gateway";
import { MockWechatGateway } from "../mock-wechat-gateway";

export class MockWechatController {
  constructor(private readonly mockWechatGateway: MockWechatGateway) {}

  public createPartnerTransactionJsapi = async (ctx: Context): Promise<void> => {
    const body = ctx.request.body as Partial<WechatCreateJsapiRequest>;
    this.validateCreateBody(body);

    const result = await this.mockWechatGateway.createPartnerTransactionJsapi(
      body as WechatCreateJsapiRequest,
    );

    ctx.body = success(result);
  };

  public queryByOutTradeNo = async (ctx: Context): Promise<void> => {
    const outTradeNo = ctx.params.outTradeNo;
    if (!outTradeNo || outTradeNo.trim().length === 0) {
      throw new AppError("outTradeNo is required", 400);
    }

    const result = await this.mockWechatGateway.queryByOutTradeNo(outTradeNo);
    ctx.body = success(result);
  };

  private validateCreateBody(body: Partial<WechatCreateJsapiRequest>): void {
    if (!body.out_trade_no) {
      throw new AppError("out_trade_no is required", 400);
    }

    if (!body.description) {
      throw new AppError("description is required", 400);
    }

    if (!body.amount || typeof body.amount.total !== "number") {
      throw new AppError("amount.total is required", 400);
    }

    if (!body.payer || !body.payer.sp_openid) {
      throw new AppError("payer.sp_openid is required", 400);
    }
  }
}
