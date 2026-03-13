import Koa from "koa";
import bodyParser from "koa-bodyparser";
import Router from "@koa/router";
import { errorHandler } from "./shared/middlewares/error-handler";
import { OrderRepository } from "./modules/payment/repositories/order-repository";
import { MockWechatGateway } from "./modules/mock-wechat/mock-wechat-gateway";
import { PaymentService } from "./modules/payment/services/payment-service";
import { PaymentController } from "./modules/payment/controllers/payment-controller";
import { MockWechatController } from "./modules/mock-wechat/controllers/mock-wechat-controller";
import { createPaymentRoutes } from "./modules/payment/routes/payment-routes";
import { createMockWechatRoutes } from "./modules/mock-wechat/routes/mock-wechat-routes";

const app = new Koa();
const rootRouter = new Router({ prefix: "/api" });

const orderRepository = new OrderRepository();
const mockWechatGateway = new MockWechatGateway(orderRepository);
const paymentService = new PaymentService(orderRepository, mockWechatGateway);

const paymentController = new PaymentController(paymentService);
const mockWechatController = new MockWechatController(mockWechatGateway);

rootRouter.use(createPaymentRoutes(paymentController).routes());
rootRouter.use(createMockWechatRoutes(mockWechatController).routes());

app.use(errorHandler);
app.use(bodyParser());
app.use(rootRouter.routes());
app.use(rootRouter.allowedMethods());

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  // Keep startup log concise for local debugging.
  console.log(`Server is running on http://localhost:${port}`);
});
