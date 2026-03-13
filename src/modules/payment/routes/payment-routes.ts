import Router from "@koa/router";
import { PaymentController } from "../controllers/payment-controller";

export function createPaymentRoutes(paymentController: PaymentController): Router {
  const router = new Router();

  router.post("/pay/orders", paymentController.createOrder);
  router.get("/pay/orders/:orderNo", paymentController.queryOrderStatus);
  router.post("/pay/jsapi/prepay", paymentController.buildJsapiPrepay);
  router.post("/pay/notify/wechat", paymentController.handleWechatNotify);

  return router;
}
