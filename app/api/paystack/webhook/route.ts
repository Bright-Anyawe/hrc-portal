import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { confirmPayment } from "@/lib/payments";

export const runtime = "nodejs";

/**
 * Paystack webhook receiver. Paystack signs every request with an
 * HMAC-SHA512 of the raw body using the secret key. Only `charge.success`
 * events are acted on; everything else is acknowledged with 200.
 *
 * Configure this URL as a webhook at
 * https://dashboard.paystack.com/#/settings/developers
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { event?: string; data?: { reference?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (payload.event === "charge.success" && payload.data?.reference) {
    await confirmPayment({ reference: payload.data.reference });
  }

  return NextResponse.json({ received: true });
}