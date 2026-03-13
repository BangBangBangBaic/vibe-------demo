请阅读processlog.md,按找proceesslog.md对processlog.md修改

# 后端架构设计方案（TypeScript + Koa）

## 1. 架构目标与范围
- 目标：仅实现小卖铺二维码收款的完整后端链路，覆盖“创建收款单 -> 生成扫码信息 -> 获取JSAPI参数 -> Mock支付回调 -> 查询支付结果”。
- 范围控制：严格按项目需求实现，不引入权限中心、运营后台、会员体系等额外功能。
- 分层方式：路由层 -> 控制器层 -> 服务层 -> 网关/仓储层。

## 2. 功能边界（防止增删功能）
- 必做功能：
  - 创建收款订单。
  - 生成可扫码链接（或二维码内容字符串）。
  - 提供 JSAPI 拉起参数。
  - 接收并处理微信支付通知（Mock）。
  - 查询订单支付状态。
- 不做功能：
  - 不新增与收款无关业务模块。
  - 不删除上述任何一条主链路功能。

## 3. 后端模块划分
- `modules/payment`：订单创建、状态流转、查询。
- `modules/wechat-jsapi`：按微信支付V3服务商模型组装请求参数和响应结构。
- `modules/mock-wechat`：对不可直连接口返回官方结构一致的Mock数据。
- `shared`：配置、日志、错误处理、中间件、类型定义。

## 4. 接口设计（RESTful）
- `POST /api/pay/orders`
  - 作用：创建收款订单，返回 `orderNo`、金额、扫码地址。
- `GET /api/pay/orders/:orderNo`
  - 作用：查询订单状态（`NOTPAY`/`SUCCESS`/`CLOSED`）。
- `POST /api/pay/jsapi/prepay`
  - 作用：根据订单生成JSAPI拉起参数（Mock结构遵循官方字段）。
- `POST /api/pay/notify/wechat`
  - 作用：接收微信支付通知并更新订单状态（Mock回调）。
- `POST /api/mock/wechat/v3/pay/partner/transactions/jsapi`
  - 作用：模拟统一下单返回 `prepay_id` 等字段。
- `GET /api/mock/wechat/v3/pay/partner/transactions/out-trade-no/:outTradeNo`
  - 作用：模拟订单查询接口返回交易状态。

## 5. 四层流程设计

### 第一步：路由层
- 仅暴露支付相关路由。
- 统一挂载 `/api` 前缀，路由文件只做路径与HTTP方法映射。

### 第二步：控制器层
- 校验输入参数：
  - 创建订单：`description`、`amount.total`、`payer.openid`。
  - JSAPI参数：`orderNo`。
  - 通知回调：`id`、`event_type`、`resource`。
- 返回统一响应结构：`code`、`message`、`data`。
- 不在控制器写复杂业务逻辑。

### 第三步：服务层
- `createOrder`：生成业务订单号并保存初始状态。
- `buildJsapiParams`：调用微信网关（Mock）获取 `prepay_id` 并组装前端拉起参数。
- `handleWechatNotify`：幂等更新支付状态，避免重复通知导致脏数据。
- `queryOrderStatus`：优先读缓存，未命中回源存储并回填缓存。

### 第四步：网关/仓储层
- `WechatGateway`：定义统一接口，当前实现为 `MockWechatGateway`。
- `OrderRepository`：封装订单读写，不向上层暴露存储细节。
- 缓存建议：订单状态短缓存，键示例 `pay:order:{orderNo}`。

## 6. 微信支付 Mock 约束
- Mock 请求与响应字段名、嵌套结构、枚举值与微信官方文档保持一致。
- Mock 失败场景覆盖：
  - 订单不存在。
  - 金额不匹配。
  - 系统繁忙。
- 保留真实网关替换点，后续仅替换网关实现，不改控制器与服务层。

## 7. 类型与依赖约束（禁止事项落地）
- TypeScript 禁止 `any`：
  - 接口入参、出参、DTO、实体、网关响应全部显式类型化。
  - 开启 `noImplicitAny`、`strict`。
- API包约束：
  - 仅使用项目批准且未弃用的依赖。
  - 新增依赖需先登记评估再引入。
- 功能约束：
  - 不允许在计划外新增/删减业务流程节点。

## 8. 联调流程
- 步骤1：前端调用 `POST /api/pay/orders` 创建订单并拿到二维码内容。
- 步骤2：手机扫码进入支付页，前端调用 `POST /api/pay/jsapi/prepay`。
- 步骤3：后端返回JSAPI参数，前端展示付款确认页。
- 步骤4：后端接收 `POST /api/pay/notify/wechat`（Mock）并更新订单。
- 步骤5：前端轮询 `GET /api/pay/orders/:orderNo` 直到成功。