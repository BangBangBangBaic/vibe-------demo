### processlog规范
    - 每次修改生成新的processlog，都要概况并且标注文件名
    ```e.g
        #### 完成产品prd文档的markdown文档计划编写
            {
                文件位置 ： ...//,
                概况内容 ： ...
            }
    ```

#### 完成后端plan文档编写
    {
        文件位置 ： backend/plan.md,
        概况内容 ： 基于项目需求与角色约束，输出后端分层架构、核心三表设计、RESTful路由流程、MySQL与Redis策略及微信支付Mock方案。
    }

#### 完成后端plan文档二次修订
    {
        文件位置 ： backend/plan.md,
        概况内容 ： 依据最新项目需求收敛为二维码收款主流程，移除需求外模块，补充禁止事项落地（禁any、禁弃用API、禁未授权依赖、禁随意增删功能）。
    }

#### 完成后端TypeScript+Koa四层架构实现
    {
        文件位置 ： backend/src/app.ts,
        概况内容 ： 按plan文档落地路由层、控制器层、服务层、网关/仓储层，统一挂载/api并完成支付主链路4个接口与错误处理中间件。
    }
    {
        文件位置 ： backend/src/modules/payment/*,
        概况内容 ： 实现创建订单、JSAPI参数生成、微信通知幂等处理、订单状态查询与pay:order:{orderNo}短缓存。
    }
    {
        文件位置 ： backend/src/modules/mock-wechat/*,
        概况内容 ： 实现微信V3结构Mock下单与订单查询接口，覆盖订单不存在、金额不匹配、系统繁忙等失败场景，并保留真实网关替换点。
    }
    {
        文件位置 ： backend/package.json, backend/tsconfig.json,
        概况内容 ： 初始化TypeScript工程并开启strict/noImplicitAny，补充dev/build/start脚本与基础忽略配置。
    }
