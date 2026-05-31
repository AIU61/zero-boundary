# 国内联盟链接入方案

## Default Chain

MVP 默认以 FISCO BCOS 为首选联盟链，因为它适合 EVM/Solidity 合约形态，便于快速实现任务、授权和权益凭证存证。

若面向国企、政务、文旅或大型城市级项目，可通过 `ChainAdapter` 切换到长安链。业务接口不直接依赖具体链 SDK。

## Adapter Contract

后端只依赖统一接口：

```ts
interface ChainAdapter {
  notarize(input: {
    businessId: string;
    registry: "TaskReceiptRegistry" | "ConsentRegistry" | "BenefitCredentialRegistry";
    payload: unknown;
  }): Promise<ChainReceipt>;
}
```

真实链适配器需要完成：

- 对 payload 做稳定 JSON 规范化和 SHA-256 摘要。
- 调用对应合约写入 `businessId`、`payloadHash`、`status`、`timestamp`。
- 保存链交易 ID、区块高度、确认状态和错误原因。
- 链不可用时写入待上链队列，恢复后补写。

## Production Hardening

- `businessId` 必须唯一，防止重复核销和重复权益发放。
- 所有个人敏感数据必须在链下加密保存，链上只放哈希。
- 合约事件必须能被治理端订阅，用于审计、仲裁和对账。
- 若使用长安链，保留同样的 registry 语义，不改变 App/API 入参。
