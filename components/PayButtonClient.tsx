// --- filename: components/PayButtonClient.tsx ---
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CreateTransactionResponse = {
  authorization_url?: string;
  reference?: string;
  error?: string;
};

interface Props {
  amountNaira: number;
  email?: string;
}

/**
 * PayButtonClient
 * - Initializes a transaction on the server (POST /api/paywall/create-transaction)
 * - Tries to open Paystack inline if available
 * - Falls back to redirecting to authorization_url when inline isn't possible
 *
 * Requirements:
 * - NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY must be set for inline mode
 */

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: {
        key: string;
        email?: string;
        amount: number;
        ref: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => void;
    };
  }
}


const PAYSTACK_SCRIPT_SRC = "https://js.paystack.co/v1/inline.js";

export default function PayButtonClient({ amountNaira, email }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const publicKey = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string | undefined) : undefined;

  // lazy load Paystack script for inline checkout
  const loadPaystackScript = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined") return;
    if (window.PaystackPop) return;
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PAYSTACK_SCRIPT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paystack script"));
      document.head.appendChild(script);
    });
  }, []);

  const openInline = useCallback(
    async (reference: string) => {
      if (!publicKey) {
        setMessage("Missing Paystack public key for inline checkout; redirecting instead.");
        return null;
      }

      try {
        await loadPaystackScript();
      } catch (err) {
        console.warn(err)
        setMessage("Unable to load checkout; redirecting...");
        return null;
      }

      if (!window.PaystackPop || typeof window.PaystackPop.setup !== "function") {
        setMessage("Inline checkout not available; redirecting...");
        return null;
      }

      // Setup Paystack inline
      try {
        // Paystack setup expects 'key' (publicKey), email, amount(in kobo), ref (reference), and callback functions
        const amountKobo = Math.round(amountNaira * 100);

        window.PaystackPop.setup({
          key: publicKey,
          email: email ?? undefined,
          amount: amountKobo,
          ref: reference,
          // metadata can be left out because we provided metadata during initialize
          onClose: () => {
            setMessage("Checkout closed. No payment was made.");
          },
          callback: async (response: { reference?: string }) => {
            const ref = response?.reference ?? reference;
            if (!ref) {
              setMessage("Payment completed, but no reference returned — please contact support.");
              return;
            }

            // Verify on server then navigate to success page
            setMessage("Verifying payment...");
            try {
              const verifyRes = await fetch(`/api/paywall/verify?reference=${encodeURIComponent(ref)}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                // go to success page with reference
                router.push(`/paywall/success?reference=${encodeURIComponent(ref)}`);
              } else {
                setMessage(verifyData.error ?? "Payment verification failed.");
                router.push(`/paywall/success?reference=${encodeURIComponent(ref)}`);
              }
            } catch (err) {
              console.error("Verification fetch error:", err);
              setMessage("Verification request failed; please contact support.");
              router.push(`/paywall/success?reference=${encodeURIComponent(ref)}`);
            }
          },
        });
      } catch (err) {
        console.error("Paystack inline error:", err);
        setMessage("Inline checkout failed — redirecting to hosted checkout...");
        return null;
      }
    },
    [amountNaira, email, loadPaystackScript, publicKey, router]
  );

  const handlePay = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/paywall/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountNaira }),
        cache: "no-store",
      });

      const data: CreateTransactionResponse = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Failed to initialize payment");
        setLoading(false);
        return;
      }

      const { authorization_url, reference } = data;

      // Prefer inline if we have public key and a reference
      if (publicKey && reference) {
        // open inline (if load / inline fails, fallback to redirect)
        try {
          await openInline(reference);
          // openInline returns undefined/null; if it didn't trigger inline we fallback to redirect
          // But on success inline will navigate page via callback
          if (!window.PaystackPop || !reference) {
            // fallback
            if (authorization_url) {
              window.location.href = authorization_url;
              return;
            }
            setMessage("Unable to start checkout. Try again later.");
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Inline checkout failed, redirecting:", err);
          if (authorization_url) {
            window.location.href = authorization_url;
            return;
          }
          setMessage("Unable to start checkout. Try again later.");
          setLoading(false);
          return;
        } finally {
          setLoading(false);
        }
        // Inline flow will handle verification & redirect in callback; do not change location here
        return;
      }

      // Fallback: redirect user to authorization_url (hosted page)
      if (authorization_url) {
        window.location.href = authorization_url;
        return;
      }

      setMessage("No checkout URL returned by server.");
    } catch (err) {
      console.error("create-transaction client error:", err);
      setMessage("Network error while starting checkout");
    } finally {
      setLoading(false);
    }
  }, [amountNaira, openInline, publicKey]);

  const visualButton = useMemo(() => {
    return (
      <button
        aria-label={`Pay ₦${amountNaira}`}
        onClick={handlePay}
        disabled={loading}
        className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 transition-all text-black font-semibold shadow-md disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90">
          <path d="M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 3v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {loading ? "Processing..." : `Pay ₦${amountNaira}`}
      </button>
    );
  }, [amountNaira, handlePay, loading]);

  return (
    <div>
      {visualButton}
      {message && (
        <div className={`mt-3 text-sm ${message.startsWith("✅") ? "text-green-400" : "text-rose-400"}`}>
          {message}
        </div>
      )}
    </div>
  );
}
