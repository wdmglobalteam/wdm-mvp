// --- filename: app/auth/page.tsx ---
"use client";

import React, { useState } from "react";
import AuthBackground from "@/components/AuthBackground";
import CursorEffect from "@/components/CursorEffect";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup, resendVerification } = useAuth();
  
  const [mode, setMode] = useState<"signIn" | "signUp">("signUp");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check for URL parameters
  React.useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    
    if (verified) {
      setMessage('✅ Email verified! You can now sign in.');
    }
    if (error) {
      setMessage(`❌ ${error}`);
    }
  }, [searchParams]);

  // Email validation
  const validateEmail = (value: string) => {
    if (!value) return false;
    const re =
      /^(?:[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+)*|"(?:\\[\s\S]|[^"\\])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[A-Za-z]{2,63}|(?:\[(?:[0-9]{1,3}\.){3}[0-9]{1,3}\]))$/;
    return re.test(value.trim());
  };

  const isEmailValid = React.useMemo(() => validateEmail(email), [email]);

  // Password validation
  const isPasswordValid = React.useMemo(() => {
    const minLength = 6;
    if (!password || password.length < minLength) return false;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(password);
    const categoriesMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
      Boolean
    ).length;
    return categoriesMet >= 3 && password.length >= minLength;
  }, [password]);

  const canCreateAccount =
    mode === "signUp" ? isEmailValid && isPasswordValid : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (mode === "signUp" && !canCreateAccount) {
      setEmailTouched(true);
      setMessage("Please provide a valid email and a stronger password.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signUp") {
        const result = await signup(email, password);
        
        if (!result.success) {
          if (result.error?.toLowerCase().includes("already registered")) {
            setMessage("⚠️ Email already registered. Try signing in instead.");
          } else {
            setMessage(`❌ Sign-up failed: ${result.error}`);
          }
        } else {
          setMessage(
            "✅ Account created! Please check your inbox/spam to verify your email before signing in."
          );
        }
      } else {
        const result = await login(email, password);
        
        if (!result.success) {
          if (result.error?.toLowerCase().includes("verify your email")) {
            setMessage(
              "⚠️ Please verify your email before signing in. Check your inbox/spam for our verification email."
            );
          } else if (result.error?.toLowerCase().includes("invalid")) {
            setMessage("❌ Invalid email or password.");
          } else {
            setMessage(`❌ ${result.error}`);
          }
        } else {
          // Success - redirect to dashboard
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      setMessage("Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setMessage("Google OAuth not yet configured. Please use email/password.");
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setMessage("Please enter your email address");
      return;
    }

    setLoading(true);
    const result = await resendVerification(email);
    setLoading(false);

    if (result.success) {
      setMessage("✅ Verification email sent! Check your inbox.");
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen relative">
      <AuthBackground />
      <CursorEffect highlight={true} />
      <div className="max-w-6xl mx-auto relative z-10 px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left hero */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
              WDM PathMastery
            </h1>
            <p className="text-lg text-gray-300 max-w-xl">
              Learn the in-demand skills with curated paths, bite-sized lessons,
              and a community that helps you stay accountable.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setMode("signUp")}
                className="px-5 py-3 bg-indigo-600 rounded-lg button-glow"
              >
                Create account
              </button>
              <button
                onClick={() => setMode("signIn")}
                className="px-5 py-3 border border-gray-600 rounded-lg"
              >
                Sign in
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-400">
              Trusted by learners across campuses.{" "}
              <span className="text-indigo-300">Lifetime access — ₦1,000.</span>
            </div>
          </motion.div>

          {/* Right card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#06132a] p-6 rounded-2xl shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">
                {mode === "signIn" ? "Welcome back" : "Create your account"}
              </div>
              <div className="text-sm text-gray-400">
                {mode === "signIn" ? "Sign in to continue" : "Join PathMastery"}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* EMAIL */}
                <div className="col-span-1 md:col-span-2 relative">
                  <label className="text-xs text-gray-300">Email</label>
                  <div className="mt-1 relative">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      type="email"
                      required
                      aria-invalid={emailTouched && !isEmailValid}
                      aria-describedby="email-help"
                      className={`cursor-text w-full p-3 rounded bg-transparent border ${
                        emailTouched && !isEmailValid
                          ? "border-rose-500"
                          : "border-gray-700"
                      } pr-12`}
                    />
                    {/* Animated indicator */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <motion.div
                        initial={false}
                        animate={
                          isEmailValid
                            ? { scale: [0.8, 1.06, 1], opacity: 1 }
                            : emailTouched
                            ? { x: [0, -4, 0], opacity: 1 }
                            : { opacity: 0.7 }
                        }
                        transition={
                          isEmailValid
                            ? { duration: 0.45, ease: "easeOut" }
                            : { duration: 0.25 }
                        }
                        className="flex items-center justify-center w-8 h-8 rounded-full"
                        aria-hidden
                      >
                        {isEmailValid ? (
                          <svg
                            className="w-5 h-5 text-green-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : emailTouched ? (
                          <svg
                            className="w-5 h-5 text-rose-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9L9 15M9 9l6 6" />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="0"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16v16H4z" />
                          </svg>
                        )}
                      </motion.div>
                    </div>
                  </div>
                  <div id="email-help" className="mt-2 text-xs">
                    {emailTouched && !isEmailValid ? (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-rose-400"
                      >
                        Please enter a valid email (e.g. yourname@example.com).
                      </motion.p>
                    ) : (
                      <p className="text-gray-500"></p>
                    )}
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="col-span-1">
                  <label className="text-xs text-gray-300">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    required
                    className={`cursor-text w-full p-3 rounded bg-transparent border ${
                      password && !isPasswordValid
                        ? "border-rose-500"
                        : "border-gray-700"
                    }`}
                  />
                  <div className="mt-2 text-xs flex items-center justify-between">
                    <div className="text-gray-400">
                      {isPasswordValid ? (
                        <span className="text-green-400">
                          Password meets requirements
                        </span>
                      ) : password ? (
                        <span className="text-rose-400">
                          Use at least 6 chars + mix of upper, lower,
                          numbers/symbols
                        </span>
                      ) : (
                        <span className="text-gray-500">
                          Create a strong password
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-sm text-gray-400 underline"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Password meter */}
                <div className="col-span-1 hidden md:block">
                  <PasswordStrengthMeter password={password} minLength={6} />
                </div>
                <div className="col-span-1 md:hidden">
                  <PasswordStrengthMeter password={password} minLength={6} />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={
                      loading || (mode === "signUp" && !canCreateAccount)
                    }
                    aria-disabled={
                      loading || (mode === "signUp" && !canCreateAccount)
                    }
                    className={`px-4 py-2 rounded-md ${
                      loading
                        ? "bg-indigo-400 cursor-wait"
                        : mode === "signUp" && !canCreateAccount
                        ? "bg-indigo-700/40 cursor-not-allowed ring-0 opacity-70"
                        : "bg-indigo-600 button-glow"
                    }`}
                  >
                    {mode === "signIn"
                      ? loading
                        ? "Signing in..."
                        : "Sign in"
                      : loading
                      ? "Creating..."
                      : "Create account"}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="px-3 py-2 border border-gray-700 rounded-md"
                  >
                    Sign in with Google
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  <button 
                    type="button" 
                    className="underline"
                    onClick={() => router.push('/forgot-password')}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>

            {message && (
              <div className="mt-3 text-sm text-rose-400 whitespace-pre-line">
                {message}
                {message.includes("verify your email") && (
                  <button
                    onClick={handleResendVerification}
                    className="ml-2 underline"
                    disabled={loading}
                  >
                    Resend email
                  </button>
                )}
              </div>
            )}

            <div className="mt-6 text-xs text-gray-400">
              By continuing you agree to our Terms. WDM uses secure
              authentication and never shares your info.
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Need help?</div>
              <div>
                <button
                  onClick={() =>
                    setMode(mode === "signIn" ? "signUp" : "signIn")
                  }
                  className="text-sm underline"
                >
                  {mode === "signIn"
                    ? "Create an account"
                    : "Have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}