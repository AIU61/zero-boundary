import cors from "cors";
import express from "express";
import { nanoid } from "nanoid";
import { z } from "zod";
import { FiscoBcosNotaryAdapter } from "./chain.js";
import type { ChainAdapter } from "./chain.js";
import type { Consent } from "./domain.js";
import { createSeedStore, createTicketBenefit, DEFAULT_USER_ID, VALID_QR_PAYLOAD, type DataStore } from "./store.js";

const verifySchema = z.object({
  userId: z.string().default(DEFAULT_USER_ID),
  taskId: z.string(),
  merchantId: z.string(),
  qrPayload: z.string(),
  deviceId: z.string().min(3)
});

const consentGrantSchema = z.object({
  userId: z.string().default(DEFAULT_USER_ID),
  merchantId: z.string(),
  purpose: z.string().min(4),
  rewardDescription: z.string().min(2),
  expiresAt: z.string().datetime()
});

export function createApp(store: DataStore = createSeedStore(), chain: ChainAdapter = new FiscoBcosNotaryAdapter()) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "lingjie-api", chain: "fisco-bcos-adapter" });
  });

  app.get("/api/home", (_req, res) => {
    res.json({
      user: store.wallets.find((wallet) => wallet.userId === DEFAULT_USER_ID),
      tasks: store.tasks,
      merchants: store.merchants,
      governance: buildGovernanceSummary(store)
    });
  });

  app.post("/api/tasks/:id/claim", (req, res) => {
    const userId = String(req.body?.userId ?? DEFAULT_USER_ID);
    const task = store.tasks.find((item) => item.id === req.params.id);

    if (!task) {
      return res.status(404).json({ error: "TASK_NOT_FOUND" });
    }

    if (task.status !== "available" && task.claimedBy !== userId) {
      return res.status(409).json({ error: "TASK_ALREADY_CLAIMED" });
    }

    task.status = "claimed";
    task.claimedBy = userId;
    task.claimedAt = task.claimedAt ?? new Date().toISOString();

    return res.json({ task });
  });

  app.post("/api/checkins/qr/verify", async (req, res) => {
    const parsed = verifySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "INVALID_CHECKIN_PAYLOAD", details: parsed.error.flatten() });
    }

    const input = parsed.data;
    const task = store.tasks.find((item) => item.id === input.taskId);
    const merchant = store.merchants.find((item) => item.id === input.merchantId);
    const wallet = store.wallets.find((item) => item.userId === input.userId);
    const duplicate = store.checkins.find((item) => item.userId === input.userId && item.taskId === input.taskId && item.status === "verified");
    const checkinId = `checkin_${nanoid(10)}`;

    if (!task || !merchant || !wallet) {
      return res.status(404).json({ error: "CHECKIN_CONTEXT_NOT_FOUND" });
    }

    const rejectionReason = getCheckinRejectionReason(input.qrPayload, task.requiredMerchantId, input.merchantId, duplicate !== undefined, task.expiresAt);
    if (rejectionReason) {
      const rejected = {
        id: checkinId,
        ...input,
        status: "rejected" as const,
        reason: rejectionReason,
        createdAt: new Date().toISOString()
      };
      store.checkins.push(rejected);
      return res.status(409).json({ checkin: rejected });
    }

    const businessId = `task_receipt_${checkinId}`;
    const receipt = await chain.notarize({
      businessId,
      registry: "TaskReceiptRegistry",
      payload: {
        userDidHash: wallet.didHash,
        merchantId: merchant.id,
        taskId: task.id,
        checkinId,
        status: "verified"
      }
    });
    store.chainReceipts.push(receipt);

    const verified = {
      id: checkinId,
      ...input,
      status: "verified" as const,
      createdAt: new Date().toISOString(),
      chainBusinessId: businessId
    };
    store.checkins.push(verified);

    task.status = "completed";
    task.completedAt = verified.createdAt;
    wallet.energy += task.rewardEnergy;
    wallet.contribution += 5;
    wallet.level = wallet.energy >= 40 ? "咖啡猎人 Lv.2" : wallet.level;

    const benefit = createTicketBenefit(input.userId, task.id, `benefit_${checkinId}`);
    wallet.benefits.push(benefit);
    store.chainReceipts.push(
      await chain.notarize({
        businessId: benefit.chainBusinessId!,
        registry: "BenefitCredentialRegistry",
        payload: {
          userDidHash: wallet.didHash,
          benefitId: benefit.id,
          taskId: task.id,
          transferable: false,
          cashable: false,
          status: benefit.status
        }
      })
    );

    return res.json({ checkin: verified, wallet, issuedBenefit: benefit });
  });

  app.post("/api/benefits/issue", async (req, res) => {
    const userId = String(req.body?.userId ?? DEFAULT_USER_ID);
    const taskId = String(req.body?.taskId ?? "manual");
    const wallet = store.wallets.find((item) => item.userId === userId);
    if (!wallet) {
      return res.status(404).json({ error: "WALLET_NOT_FOUND" });
    }

    const benefit = createTicketBenefit(userId, taskId, `benefit_manual_${nanoid(8)}`);
    wallet.benefits.push(benefit);
    const receipt = await chain.notarize({
      businessId: benefit.chainBusinessId!,
      registry: "BenefitCredentialRegistry",
      payload: { userDidHash: wallet.didHash, benefitId: benefit.id, taskId, status: benefit.status }
    });
    store.chainReceipts.push(receipt);

    res.json({ benefit, receipt });
  });

  app.post("/api/consents/grant", async (req, res) => {
    const parsed = consentGrantSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "INVALID_CONSENT_PAYLOAD", details: parsed.error.flatten() });
    }

    const wallet = store.wallets.find((item) => item.userId === parsed.data.userId);
    if (!wallet) {
      return res.status(404).json({ error: "WALLET_NOT_FOUND" });
    }

    const consent: Consent = {
      id: `consent_${nanoid(10)}`,
      ...parsed.data,
      status: "active",
      createdAt: new Date().toISOString(),
      chainBusinessId: `consent_${nanoid(10)}`
    };
    store.consents.push(consent);
    store.chainReceipts.push(
      await chain.notarize({
        businessId: consent.chainBusinessId,
        registry: "ConsentRegistry",
        payload: {
          userDidHash: wallet.didHash,
          merchantId: consent.merchantId,
          purpose: consent.purpose,
          expiresAt: consent.expiresAt,
          status: consent.status
        }
      })
    );

    res.json({ consent });
  });

  app.post("/api/consents/revoke", async (req, res) => {
    const consent = store.consents.find((item) => item.id === String(req.body?.consentId));
    if (!consent) {
      return res.status(404).json({ error: "CONSENT_NOT_FOUND" });
    }

    consent.status = "revoked";
    consent.revokedAt = new Date().toISOString();
    const wallet = store.wallets.find((item) => item.userId === consent.userId);
    store.chainReceipts.push(
      await chain.notarize({
        businessId: `${consent.chainBusinessId}_revoke`,
        registry: "ConsentRegistry",
        payload: {
          userDidHash: wallet?.didHash,
          consentId: consent.id,
          status: "revoked",
          revokedAt: consent.revokedAt
        }
      })
    );

    res.json({ consent });
  });

  app.get("/api/wallet", (req, res) => {
    const userId = String(req.query.userId ?? DEFAULT_USER_ID);
    const wallet = store.wallets.find((item) => item.userId === userId);

    if (!wallet) {
      return res.status(404).json({ error: "WALLET_NOT_FOUND" });
    }

    res.json({ wallet });
  });

  app.get("/api/chain/receipts/:businessId", (req, res) => {
    const receipt = store.chainReceipts.find((item) => item.businessId === req.params.businessId);
    if (!receipt) {
      return res.status(404).json({ error: "CHAIN_RECEIPT_NOT_FOUND" });
    }

    res.json({ receipt });
  });

  app.get("/api/governance/summary", (_req, res) => {
    res.json({ governance: buildGovernanceSummary(store), chainReceipts: store.chainReceipts });
  });

  return app;
}

function getCheckinRejectionReason(qrPayload: string, requiredMerchantId: string, merchantId: string, duplicate: boolean, expiresAt: string) {
  if (duplicate) return "DUPLICATE_CHECKIN";
  if (merchantId !== requiredMerchantId) return "WRONG_MERCHANT";
  if (qrPayload !== VALID_QR_PAYLOAD) return "INVALID_QR_PAYLOAD";
  if (Date.now() > Date.parse(expiresAt)) return "TASK_EXPIRED";
  return undefined;
}

function buildGovernanceSummary(store: DataStore) {
  const approvedMerchants = store.merchants.filter((item) => item.complianceStatus === "approved").length;
  const pendingMerchants = store.merchants.filter((item) => item.complianceStatus === "pending").length;
  const verifiedCheckins = store.checkins.filter((item) => item.status === "verified").length;
  const rejectedCheckins = store.checkins.filter((item) => item.status === "rejected").length;
  const completedTasks = store.tasks.filter((item) => item.status === "completed").length;

  return {
    approvedMerchants,
    pendingMerchants,
    taskCompletionRate: store.tasks.length === 0 ? 0 : completedTasks / store.tasks.length,
    verifiedCheckins,
    rejectedCheckins,
    pendingChainReceipts: store.chainReceipts.filter((item) => item.status === "pending").length
  };
}
