// --- filename: app/paywall/success/page.tsx ---
import AuthBackground from "@/components/AuthBackground";
import CursorEffect from "@/components/CursorEffect";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { redirect } from "next/navigation";
import { sessionService } from "@/lib/server/sessionService";

type VerifyResult = {
  success?: boolean;
  status?: string | null;
  error?: string;
};

export const revalidate = 0;

interface Props {
  searchParams?: { reference?: string };
}

/**
 * Server-side success page:
 * - Accepts ?reference=...
 * - Calls internal verify endpoint (which updates DB) and then displays a polished summary
 * - If no reference and no session -> redirect to /auth
 */
export default async function PaywallSuccessPage({ searchParams }: Props) {
  const reference = searchParams?.reference;
  // Check session: if no session, redirect to auth (security)
  const userSession = await sessionService.getCurrentUser();
  if (!userSession) {
    redirect("/auth");
  }

  // If no reference, we still try to show status from DB
  let verifyResult: VerifyResult | null = null;
  if (reference) {
    // Call internal verify API (server -> server)
    const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/paywall/verify?reference=${encodeURIComponent(reference)}`;
    try {
      const res = await fetch(url, { method: "GET", cache: "no-store" });
      verifyResult = (await res.json()) as VerifyResult;
    } catch (err) {
      console.error("Server verify fetch failed:", err);
      verifyResult = { error: "Verification request failed" };
    }
  }

  // Always fetch current profile to display final status
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name, payment_status, email_verified, registration_completed")
    .eq("id", userSession.userId)
    .single();

  const paid = profile?.payment_status === "paid" || verifyResult?.success === true;

  return (
    <div className="min-h-screen relative">
      <AuthBackground />
      <CursorEffect />
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="bg-gradient-to-b from-[#071233] to-[#061029] rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              {paid ? (
                <>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-lg mb-6">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#042" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <h1 className="text-3xl font-extrabold mb-2">Payment Successful</h1>
                  <p className="text-gray-300 mb-4">Thanks — your payment has been verified and your account is now upgraded to lifetime access.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-[#071a2b]">
                      <div className="text-xs text-gray-400">Member</div>
                      <div className="text-lg font-semibold">{profile?.display_name ?? "Student"}</div>
                      <div className="text-xs text-gray-500">{profile?.email ?? "No email"}</div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#071a2b]">
                      <div className="text-xs text-gray-400">Payment reference</div>
                      <div className="text-sm font-medium">{reference ?? "—"}</div>
                      <div className="text-xs text-gray-500 mt-1">Status: <span className="font-semibold">{verifyResult?.status ?? (profile?.payment_status ?? "unknown")}</span></div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Link href="/dashboard" className="px-5 py-3 bg-emerald-500 rounded-lg font-semibold shadow">
                      Go to Dashboard
                    </Link>
                    <Link href="/" className="px-5 py-3 border border-gray-700 rounded-lg text-gray-200">
                      Explore more
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/30 mb-6">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                      <path d="M12 8v4l3 3" stroke="#ff6b6b" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <h1 className="text-3xl font-extrabold mb-2">Payment Pending / Failed</h1>
                  <p className="text-gray-300 mb-4">We couldn&apos;t verify your payment automatically. If you were charged, please contact support and provide the payment reference below.</p>

                  <div className="p-4 rounded-lg bg-[#071a2b]">
                    <div className="text-xs text-gray-400">Payment reference</div>
                    <div className="text-sm font-medium">{reference ?? "—"}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {verifyResult?.error ?? "No verification details available."}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <Link href="/paywall" className="px-5 py-3 bg-indigo-600 rounded-lg font-semibold shadow">
                      Retry Payment
                    </Link>
                    <a href="mailto:support@wdm.example" className="px-5 py-3 border border-gray-700 rounded-lg text-gray-200">
                      Contact Support
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className="w-full md:w-96 p-6 rounded-xl bg-[#061223]">
              <h4 className="text-sm text-gray-400 mb-4">Payment progress</h4>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full transition-all ${paid ? "bg-emerald-400" : "bg-rose-400"}`}
                  style={{ width: paid ? "100%" : "33%" }}
                />
              </div>

              <div className="text-xs text-gray-400">Status: <span className="font-medium text-gray-200">{paid ? "Paid" : (verifyResult?.status ?? profile?.payment_status ?? "unpaid")}</span></div>

              <div className="mt-6 text-xs text-gray-400">
                <div>Reference: <span className="text-gray-200">{reference ?? "—"}</span></div>
                <div className="mt-2">If your payment is confirmed but you are not seeing access, try refreshing your dashboard or contact support.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
