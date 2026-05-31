# 零界 App MVP

零界第一版围绕“咖啡夜行路线”验证线上线下闭环：用户领取路线任务，到线下门店扫码核销，获得权益钱包里的数字票根、隐藏菜单资格、等级成长和复购权益。

当前实现是可运行的 MVP 骨架：

- `apps/mobile`：Vue 3 + Vite 的移动端/H5 原型，页面结构贴近后续 `uni-app` 迁移。
- `apps/api`：Node + TypeScript API 服务，按 Spring Boot 迁移友好的领域边界组织。
- 联盟链采用 `ChainAdapter` 抽象，默认 `FiscoBcosNotaryAdapter` 为模拟确认实现，后续可替换 FISCO BCOS 或长安链 SDK。
- `contracts/fisco`：FISCO BCOS / Solidity 形态的任务、授权和权益凭证存证合约草案。
- `docs`：产品架构、数据边界和国内联盟链接入说明。
- `db`：PostgreSQL 表结构和咖啡夜行路线种子数据。

## Quick Start

```bash
npm install
npm run dev
```

默认地址：

- App: http://localhost:5173
- API: http://localhost:3100/api/health

如果 `5173` 被本机其他项目占用，Vite 会提示或切换到其他端口；也可以手动指定：

```bash
npm run dev -w apps/mobile -- --port 5180
```

也可以分别启动：

```bash
npm run dev -w apps/api
npm run dev -w apps/mobile
```

## Verification

```bash
npm run test -w apps/api
npm run build
```

## Online Deployment

The mobile UI is deployable as a static site. In production it first tries `VITE_API_BASE`; if no API is configured or the request fails, it falls back to built-in demo data so the online app still works.

Supported deployment targets added in this repo:

- Vercel: `vercel --prod`
- Netlify: connect the repo or run `netlify deploy --prod --dir apps/mobile/dist`
- GitHub Pages: push to `main`/`master`, then run the `Deploy mobile app to GitHub Pages` workflow

For a real backend deployment, set:

```bash
VITE_API_BASE=https://your-api.example.com
```

For Vercel, `api/index.ts` exposes the current Express API as a serverless entry. The production database and alliance-chain SDK should replace the in-memory store before public commercial launch.

## MVP Flow

1. 用户端打开“零界咖啡夜行路线”。
2. 点击“领取路线”，调用 `POST /api/tasks/{id}/claim`。
3. 点击“模拟扫码核销”，调用 `POST /api/checkins/qr/verify`。
4. API 校验任务、门店、二维码、防重复核销。
5. API 生成任务履约存证和权益凭证存证。
6. 权益钱包获得“第一条夜行路线数字票根”。
7. 用户可点击“授权偏好数据换取权益”，调用数据授权存证接口。

## API Surface

- OpenAPI 契约见 `docs/openapi.yaml`。
- `GET /api/home`：用户首页、任务、门店和治理摘要。
- `POST /api/tasks/:id/claim`：领取任务。
- `POST /api/checkins/qr/verify`：扫码核销。
- `POST /api/benefits/issue`：发放权益凭证。
- `POST /api/consents/grant`：授权数据用途、期限和回报。
- `POST /api/consents/revoke`：撤回授权。
- `GET /api/wallet`：查询权益钱包。
- `GET /api/chain/receipts/:businessId`：查询链上存证结果。
- `GET /api/governance/summary`：平台治理摘要。

## Compliance Defaults

- 零界能量只做 App 内积分，不上链、不提现、不转让、不兑换现金。
- 数字票根不可转让、不可提现，只绑定真实权益和有效期。
- 敏感个人信息、位置、订单、评价和画像保存在链下。
- 链上只保存业务凭证哈希、状态、时间戳和模拟交易 ID。
- 第一版不提供任何收益承诺、二级市场或类虚拟货币能力。

## Database

`db/schema.sql` 定义了生产迁移时需要的核心表：

- `checkins_one_verified_per_user_task` 防止同一用户同一任务重复核销。
- `benefits` 表通过 check 约束禁止 MVP 权益转让和提现。
- `chain_outbox` 用于真实联盟链不可用时的待上链补偿队列。

`db/seed.sql` 提供林砚、蓝岸商圈三家门店和“黑雨冷萃 - 夜行路线”的初始化数据。

## Next Engineering Steps

- 将内存数据仓库替换为 PostgreSQL，并把核销幂等约束落到数据库唯一索引。
- 将 `FiscoBcosNotaryAdapter` 接入真实 FISCO BCOS SDK，失败时写入待上链队列。
- 使用 `contracts/fisco` 的 registry 合约作为存证语义起点，部署前需按目标链版本做编译和安全审计。
- 按 `apps/api/src/domain.ts` 建立 Spring Boot 版本实体、服务和控制器。
- 将 `apps/mobile` 迁移到 `uni-app + Vue 3`，复用现有视图和 API 客户端。
