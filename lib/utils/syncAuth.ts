import crypto from "crypto";

function stableStringify(obj: any): string {
  if (obj === null || obj === undefined) return "";

  if (Array.isArray(obj)) {
    return JSON.stringify(obj.map(stableStringify));
  }

  if (typeof obj !== "object") {
    return JSON.stringify(obj);
  }

  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = obj[key];
        return acc;
      }, {})
  );
}

/**
 * IMPORTANT:
 * We ALWAYS sign full payload (not only events)
 */
export function generateSignature(payload: any, timestamp: string) {
  const secret = process.env.SYNC_API_KEY;

  const baseString = stableStringify(payload) + "|" + timestamp;

  return crypto
    .createHmac("sha256", secret!)
    .update(baseString)
    .digest("hex");
}

export function verifySignature(payload: any, timestamp: string, signature: string) {
  const expected = generateSignature(payload, timestamp);
  return expected === signature;
}

export function validateSyncRequest(req: any) {
  const apiKey = req.headers["x-api-key"];
  const timestamp = req.headers["x-timestamp"] as string;
  const signature = req.headers["x-signature"] as string;

  if (!apiKey || apiKey !== process.env.SYNC_API_KEY) {
    return { ok: false, message: "Invalid API key" };
  }

  if (!timestamp || !signature) {
    return { ok: false, message: "Missing signature headers" };
  }

  const now = Date.now();
  if (Math.abs(now - Number(timestamp)) > 5 * 60 * 1000) {
    return { ok: false, message: "Request expired" };
  }

  if (!req.body) {
    return { ok: false, message: "Missing body" };
  }

  /**
   * CRITICAL FIX:
   * We sign FULL BODY, not only events
   */
  const valid = verifySignature(req.body, timestamp, signature);

  if (!valid) {
    return { ok: false, message: "Invalid signature" };
  }
  return { ok: true };
}