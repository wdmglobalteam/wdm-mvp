// components/PaystackPlaceholder.tsx
"use client";
import React, { useState } from "react";
import { enqueueProfilePatch } from "@/lib/saveQueue";
import { Button } from "@/components/ui/button";

export default function PaystackPlaceholder({ amount = 1000 }: { amount?: number }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const start = async () => {
    setLoading(true);
    setMsg("Initializing secure checkout...");
    try {
      await enqueueProfilePatch({ payment_status: "pending" });
      setMsg("Processing payment...");
      await new Promise((res) => setTimeout(res, 1500));
      await enqueueProfilePatch({ payment_status: "paid", registration_completed: true });
      setMsg("Payment successful — thank you!");
      await new Promise((res) => setTimeout(res, 900));
      setMsg(null);
    } catch (err) {
      console.error(err);
      setMsg("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-3 text-sm text-gray-300">
        Demo: Paystack placeholder. When ready, we will wire an inline Paystack checkout + server verification webhooks.
      </div>
      <div className="flex gap-2">
        <Button onClick={start} disabled={loading}>
          {loading ? "Processing…" : `Pay ₦${amount}`}
        </Button>
        <Button variant="ghost" disabled>
          Pay with Card
        </Button>
      </div>
      {msg && <div role="status" aria-live="polite" className="mt-2 text-sm text-emerald-300">{msg}</div>}
    </div>
  );
}
