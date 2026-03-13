import Router from "@koa/router";
import { MockWechatController } from "../controllers/mock-wechat-controller";

export function createMockWechatRoutes(mockWechatController: MockWechatController): Router {
  const router = new Router();

  router.post(
    "/mock/wechat/v3/pay/partner/transactions/jsapi",
    mockWechatController.createPartnerTransactionJsapi,
  );
  router.get(
    "/mock/wechat/v3/pay/partner/transactions/out-trade-no/:outTradeNo",
    mockWechatController.queryByOutTradeNo,
  );

  return router;
}
