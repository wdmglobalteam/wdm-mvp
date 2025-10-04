// --- filename: app/reset-password/page.tsx ---
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import CursorEffect from "@/components/CursorEffect";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid reset link");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Password updated. You can now sign in.");
        setSuccess(true);
        setTimeout(() => router.push("/auth"), 2000);
      } else {
        setMessage(data.error || "Failed to reset password");
        setSuccess(false);
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      setSuccess(false);
      console.warn(err);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen relative">
        <AuthBackground />
        <CursorEffect />
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#06132a] rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Invalid Reset Link</h2>
            <p className="text-gray-300 mb-4">
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => router.push("/forgot-password")}
              className="w-full p-3 rounded bg-indigo-600 text-white"
            >
              Request new link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuthBackground />
      <CursorEffect />
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#06132a] rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Reset password</h2>

          {message && (
            <div
              className={`mb-3 text-sm ${
                success ? "text-green-400" : "text-rose-400"
              }`}
            >
              {message}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">
                  New password
                </label>
                <input
                  type="password"
                  className="w-full p-3 rounded bg-transparent border border-gray-700"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-400 mt-2">
                  At least 6 characters with mix of uppercase, lowercase,
                  numbers, and symbols
                </p>
              </div>
              <button
                disabled={loading}
                className="w-full p-3 rounded bg-green-600 text-white disabled:opacity-50"
              >
                {loading ? "Updating..." : "Set new password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
