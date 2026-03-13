请阅读processlog.md,按找proceesslog.md对processlog.md修改

# 前端架构设计方案（Vue 3 + TypeScript）

## 1. 架构目标与范围
- 目标：实现完整扫码收款体验，流程为“商家展示二维码 -> 顾客扫码进入手机页 -> 拉起支付确认 -> 展示支付结果”。
- 范围控制：只做项目需求内功能，不新增会员、优惠券、订单管理后台等无关模块。
- 交互约束：必须通过后端接口完成支付流程，不做纯前端模拟。

## 2. 目录结构设计

```text
src/
  views/
    cashier/            # 商家收款页：创建订单并展示二维码
    mobile-pay/         # 手机支付页：展示金额、确认支付、处理中
    pay-result/         # 支付结果页：成功/失败
  components/
    pay/
      QrDisplay.vue     # 二维码展示组件
      AmountCard.vue    # 金额信息组件
      WechatSheet.vue   # 微信支付风格确认面板
    common/
      LoadingState.vue  # 加载状态
      ErrorState.vue    # 错误提示与重试
  api/
    payment.ts          # 订单创建、JSAPI参数、订单查询
  store/
    payment.ts          # 当前订单、状态轮询、支付结果
  router/
    index.ts            # 收银页与手机页路由
  utils/
    request.ts          # HTTP请求封装与统一错误处理
    qrcode.ts           # 二维码内容生成/渲染工具
```

## 3. 页面结构（四层）
fetch https://weixin.qq.com/ 模仿设计风格
### 第一步：视图层
- 商家收款页：金额输入、商品描述输入、生成二维码按钮、二维码展示区。
- 手机支付页：金额与商户信息区、支付确认面板、支付中状态提示。
- 结果页：成功状态、失败状态、订单号与返回入口。

### 第二步：逻辑层（`<script setup>`）
- `useCreateOrder`：提交收款请求并渲染二维码。
- `useWechatPay`：请求后端JSAPI参数并触发支付确认交互。
- `useOrderStatusPolling`：轮询订单状态直到成功或失败。
- 生命周期要求：离开页面清理轮询任务，避免重复请求。

### 第三步：状态管理层（Pinia）
- `paymentStore` 状态：
  - `orderNo`、`amount`、`description`、`payStatus`、`pollingTimerId`。
- `paymentStore` 行为：
  - `createOrder`、`requestPrepayParams`、`startPolling`、`stopPolling`、`syncStatus`。
- 数据原则：订单状态以后端返回为准，本地只缓存当前会话数据。

### 第四步：API调用层
- `createOrder` -> `POST /api/pay/orders`
- `getOrderStatus` -> `GET /api/pay/orders/:orderNo`
- `getJsapiPrepay` -> `POST /api/pay/jsapi/prepay`
- `mockNotify` -> `POST /api/pay/notify/wechat`
- 约束：所有接口定义显式TypeScript类型，不使用 `any`。

## 4. 手机扫码流程
- 商家在收银页创建订单并显示二维码。
- 顾客扫码进入 `mobile-pay` 页面并带上 `orderNo`。
- 页面初始化请求订单详情与支付状态。
- 用户点击确认支付，前端请求JSAPI参数并展示支付确认面板。
- 进入支付处理中，轮询订单状态，成功后跳转结果页。

## 5. 微信支付Mock一致性要求
- 前端只消费后端返回数据，不在前端伪造微信响应结构。
- 后端返回字段必须和微信官方文档一致，前端按官方字段解析。
- 支付失败、超时、取消支付均需有对应UI状态。

## 6. 禁止事项落地
- 不随意增删功能：仅实现需求中定义的扫码收款闭环。
- TypeScript 禁止 `any`：
  - API返回、组件Props、Store状态全部使用明确类型。
- 不使用弃用API包：
  - 依赖选择以当前稳定版本为准，禁用废弃库。
- 未授权不调用API包：
  - 第三方依赖和SDK需在项目依赖白名单内。

## 7. 联调与验收清单
- 前后端联调：创建订单、获取JSAPI参数、回调通知、状态查询全链路可跑通。
- 流程验收：
  - 正常支付成功。
  - 支付处理中页面刷新后可恢复状态。
  - Mock失败场景可提示并重试。