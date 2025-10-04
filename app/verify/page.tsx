"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthBackground from "@/components/AuthBackground";
import CursorEffect from "@/components/CursorEffect";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token missing.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus("success");
          setMessage("Your email has been successfully verified! 🎉 You can now sign in.");

          // 🔑 Auto-redirect after 2.5s
          setTimeout(() => {
            window.location.href = "/auth?verified=true";
          }, 2500);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (err) {
        console.warn(err);
        setStatus("error");
        setMessage("Unexpected error occurred.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <AuthBackground />
      <CursorEffect highlight />

      <div className="relative z-10 max-w-lg w-full text-center p-8 bg-[#06132a] rounded-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-300 text-lg">Verifying your email...</p>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 mx-auto rounded-full bg-green-500 flex items-center justify-center"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Email Verified</h2>
              <p className="text-gray-300">{message}</p>
              <p className="text-sm text-gray-500 italic mt-2">
                Redirecting you to sign in...
              </p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 mx-auto rounded-full bg-red-500 flex items-center justify-center"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
              <p className="text-gray-300">{message}</p>
              <a
                href="/auth"
                className="inline-block mt-4 px-6 py-3 bg-gray-700 text-white rounded-lg shadow-lg hover:bg-gray-600 transition"
              >
                Back to Auth
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
