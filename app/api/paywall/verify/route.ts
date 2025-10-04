// --- filename: app/api/paywall/verify/route.ts ---
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_VERIFY_URL = (reference: string) => `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference");
    if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

    if (!PAYSTACK_SECRET) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    const res = await fetch(PAYSTACK_VERIFY_URL(reference), {
      method: "GET",
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Paystack verify error", data);
      return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }

    const status = data.data?.status; // 'success' expected
    const metadata = data.data?.metadata ?? {};
    const userId = metadata.user_id as string | undefined;

    if (status === "success" && userId) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase
        .from("profiles")
        .update({ payment_status: "paid", registration_completed: true })
        .eq("id", userId);

      if (error) {
        console.error("Failed to update profile after verify:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
      }

      // optionally redirect to dashboard (client flow) — we return json here
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, status: status || null });
  } catch (err) {
    console.error("verify route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
