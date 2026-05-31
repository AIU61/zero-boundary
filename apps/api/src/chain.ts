import { nanoid } from "nanoid";
import type { ChainReceipt } from "./domain.js";
import { sha256Json } from "./hash.js";

export interface ChainAdapter {
  notarize(input: Omit<ChainReceipt, "payloadHash" | "status" | "txId" | "createdAt" | "confirmedAt"> & { payload: unknown }): Promise<ChainReceipt>;
}

export class FiscoBcosNotaryAdapter implements ChainAdapter {
  async notarize(input: Omit<ChainReceipt, "payloadHash" | "status" | "txId" | "createdAt" | "confirmedAt"> & { payload: unknown }): Promise<ChainReceipt> {
    const now = new Date().toISOString();

    return {
      businessId: input.businessId,
      registry: input.registry,
      payloadHash: sha256Json(input.payload),
      status: "confirmed",
      txId: `fisco_mock_${nanoid(16)}`,
      createdAt: now,
      confirmedAt: now
    };
  }
}
