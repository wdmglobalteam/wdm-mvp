'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthBackground } from '@/components/AuthBackground';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');

	const handleForgot = async (e: React.FormEvent) => {
		e.preventDefault();
		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${window.location.origin}/reset-password`,
		});
		setMessage(error ? error.message : 'Password reset email sent!');
	};

	return (
		<div className="relative min-h-screen flex items-center justify-center">
			<AuthBackground />

			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="relative z-10 w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-gray-900/70 border border-gray-800/80 shadow-[0_0_25px_rgba(57,230,255,0.2)]"
			>
				<h1 className="text-2xl font-semibold text-white mb-6 text-center">Forgot Password</h1>
				<form onSubmit={handleForgot} className="space-y-4">
					<Input
						type="email"
						placeholder="Your email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="bg-gray-800/60 text-white border-gray-700 focus:border-[#39e6ff] focus:ring-[#39e6ff]"
					/>
					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-[#39e6ff] to-[#00ff9f] text-black hover:shadow-lg hover:shadow-[#39e6ff]/30 transition-all duration-300"
					>
						Send Reset Link
					</Button>
				</form>
				{message && <p className="mt-4 text-center text-emerald-400">{message}</p>}
			</motion.div>
		</div>
	);
}
