import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createSeedStore, VALID_QR_PAYLOAD } from "../src/store.js";

describe("lingjie mvp api", () => {
  it("claims and verifies the coffee night route, then issues a non-transferable benefit", async () => {
    const store = createSeedStore();
    const app = createApp(store);

    const claim = await request(app).post("/api/tasks/task-night-route-001/claim").send({ userId: "user-linyan" });
    expect(claim.status).toBe(200);
    expect(claim.body.task.status).toBe("claimed");

    const verify = await request(app).post("/api/checkins/qr/verify").send({
      userId: "user-linyan",
      taskId: "task-night-route-001",
      merchantId: "merchant-black-rain",
      qrPayload: VALID_QR_PAYLOAD,
      deviceId: "ios-demo-device"
    });

    expect(verify.status).toBe(200);
    expect(verify.body.checkin.status).toBe("verified");
    expect(verify.body.wallet.energy).toBe(55);
    expect(verify.body.issuedBenefit.transferable).toBe(false);
    expect(verify.body.issuedBenefit.cashable).toBe(false);
    expect(store.chainReceipts).toHaveLength(2);
  });

  it("rejects duplicate checkins", async () => {
    const store = createSeedStore();
    const app = createApp(store);
    const payload = {
      userId: "user-linyan",
      taskId: "task-night-route-001",
      merchantId: "merchant-black-rain",
      qrPayload: VALID_QR_PAYLOAD,
      deviceId: "ios-demo-device"
    };

    await request(app).post("/api/tasks/task-night-route-001/claim").send({ userId: "user-linyan" });
    await request(app).post("/api/checkins/qr/verify").send(payload);
    const duplicate = await request(app).post("/api/checkins/qr/verify").send(payload);

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.checkin.reason).toBe("DUPLICATE_CHECKIN");
  });

  it("records and revokes data consent with chain receipts", async () => {
    const store = createSeedStore();
    const app = createApp(store);

    const grant = await request(app).post("/api/consents/grant").send({
      userId: "user-linyan",
      merchantId: "merchant-black-rain",
      purpose: "用于复购提醒和口味偏好分析",
      rewardDescription: "获得隐藏菜单优先体验资格",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    expect(grant.status).toBe(200);
    expect(grant.body.consent.status).toBe("active");

    const revoke = await request(app).post("/api/consents/revoke").send({ consentId: grant.body.consent.id });

    expect(revoke.status).toBe(200);
    expect(revoke.body.consent.status).toBe("revoked");
    expect(store.chainReceipts.map((item) => item.registry)).toContain("ConsentRegistry");
  });
});
