// --- filename: app/forgot-password/page.tsx ---
'use client';

import React, { useState } from 'react';
import AuthBackground from '@/components/AuthBackground';
import CursorEffect from '@/components/CursorEffect';
import { useRouter } from 'next/navigation';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Check your email for reset link.');
        setSuccess(true);
      } else {
        setMessage(data.error || 'Failed to send reset email');
        setSuccess(false);
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
      setSuccess(false);
      console.warn(err)
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      <AuthBackground />
      <CursorEffect />
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#06132a] rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Forgot password</h2>
          
          {message && (
            <div className={`mb-3 text-sm ${success ? 'text-green-400' : 'text-rose-400'}`}>
              {message}
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Email</label>
                <input
                  type="email"
                  className="w-full p-3 rounded bg-transparent border border-gray-700"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                disabled={loading}
                className="w-full p-3 rounded bg-indigo-600 text-white disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => router.push('/auth')}
              className="w-full p-3 rounded border border-gray-700 text-white"
            >
              Back to sign in
            </button>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push('/auth')}
              className="text-sm text-gray-400 underline"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}