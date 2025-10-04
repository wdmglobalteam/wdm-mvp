// --- filename: app/api/paywall/webhook/route.ts ---
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!PAYSTACK_SECRET) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const raw = await request.text(); // need raw body for signature
    const signature = request.headers.get("x-paystack-signature") ?? "";

    // compute HMAC SHA512 of raw body using secret key
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(raw).digest("hex");

    if (hash !== signature) {
      console.warn("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(raw);

    // Example success event: event.event === 'charge.success' or 'invoice.payment_succeeded'
    const eventType = event.event;
    const payload = event.data ?? {};

    if (eventType === "charge.success" || eventType === "invoice.payment_succeeded" || eventType === "transaction.success") {
      const metadata = payload.metadata ?? {};
      const userId = metadata.user_id as string | undefined;

      if (userId) {
        const supabase = getSupabaseAdmin();
        const { error } = await supabase
          .from("profiles")
          .update({ payment_status: "paid", registration_completed: true })
          .eq("id", userId);

        if (error) {
          console.error("Failed to update profile in webhook:", error);
          // Still respond 200 so Paystack doesn't retry excessively (optional: return 500 to signal failure)
          return NextResponse.json({ success: false });
        }
      }
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
