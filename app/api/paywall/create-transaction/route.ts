// --- filename: app/api/paywall/create-transaction/route.ts ---
import { NextRequest, NextResponse } from "next/server";
import { sessionService } from "@/lib/server/sessionService";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL; // REQUIRED

if (!PAYSTACK_SECRET || !PAYSTACK_CALLBACK_URL) {
  // For dev, it's okay to throw at runtime so you know to set env vars.
  console.warn("Missing Paystack env vars: PAYSTACK_SECRET_KEY or PAYSTACK_CALLBACK_URL");
}

export async function POST(request: NextRequest) {
  try {
    const user = await sessionService.getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const amountNaira = Number(body.amountNaira) || 1000;
    const amountKobo = Math.round(amountNaira * 100);

    // fetch profile email
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.userId)
      .single();

    const email = profile?.email;
    if (!email) return NextResponse.json({ error: "User email missing" }, { status: 400 });

    const payload = {
      email,
      amount: amountKobo,
      callback_url: PAYSTACK_CALLBACK_URL,
      metadata: {
        user_id: user.userId,
        // you can add other metadata here
      },
    };

    const res = await fetch(PAYSTACK_INIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Paystack initialize failed", data);
      return NextResponse.json({ error: data.message || "Failed to initialize payment" }, { status: 500 });
    }

    // data.data.authorization_url, data.data.reference exist on success
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error("create-transaction error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
