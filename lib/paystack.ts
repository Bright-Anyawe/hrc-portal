import "server-only";
import { createHmac } from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Currency invoices are billed in. Paystack charges in the currency's smallest
// unit (pesewas for GHS, kobo for NGN, cents for USD/ZAR/KES).
// Invoice totals are stored as pesewas (cents), so they map 1:1 for "GHS".
export const PAYSTACK_CURRENCY = process.env.PAYSTACK_CURRENCY ?? "GHS";

export class PaystackError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly paystackMessage?: string
  ) {
    super(message);
    this.name = "PaystackError";
  }
}

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new PaystackError(
      "Paystack is not configured. Set PAYSTACK_SECRET_KEY in your environment."
    );
  }
  return key;
}

function paystackHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getSecretKey()}`,
    "Content-Type": "application/json",
  };
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: paystackHeaders(),
    cache: "no-store",
  });

  const raw = await res.text();
  let payload: { status?: boolean; message?: string; data?: T } | null;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = null;
  }

  if (!res.ok || !payload?.status) {
    throw new PaystackError(
      `Paystack request failed (${res.status}).`,
      res.status,
      payload?.message
    );
  }

  return payload.data as T;
}

export type PaystackInitializeData = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransaction = {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  channel: string | null;
  status: string;
  paid_at: string | null;
  metadata: Record<string, unknown> | null;
  customer?: { email?: string; first_name?: string; last_name?: string } | null;
};

export async function initializeTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeData> {
  return paystackFetch<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      reference: input.reference,
      callback_url: input.callbackUrl,
      currency: PAYSTACK_CURRENCY,
      metadata: input.metadata,
    }),
  });
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackTransaction> {
  return paystackFetch<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  const hash = createHmac("sha512", getSecretKey())
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}