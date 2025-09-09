'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthBackground } from '@/components/AuthBackground';
import PasswordStrengthMeter, {
	validatePasswordComplexity,
} from '@/components/PasswordStrengthMeter';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
	const [password, setPassword] = useState('');
	const [complex, setComplex] = useState(() => validatePasswordComplexity('', 6));
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [expired, setExpired] = useState(false);
	const [resending, setResending] = useState(false);
	const router = useRouter();

	useEffect(() => {
		setComplex(validatePasswordComplexity(password, 6));
	}, [password]);

	const handleReset = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!complex.valid) {
			setMessage('Password does not meet complexity requirements.');
			return;
		}

		setLoading(true);
		try {
			const { error } = await supabase.auth.updateUser({ password });

			if (error) {
				if (error.message.toLowerCase().includes('jwt expired') || error.status === 401) {
					setMessage(
						'Your reset link has expired or is invalid. Please request a new password reset email.'
					);
					setExpired(true);
				} else {
					setMessage(`Error: ${error.message}`);
				}
			} else {
				setMessage('Password updated! Redirecting to login...');
				setExpired(false);
				// Auto-redirect after 3 seconds
				setTimeout(() => {
					router.push('/auth');
				}, 3000);
			}
		} catch {
			setMessage('Unexpected error. Please try again.');
		}
		setLoading(false);
	};

	const requestNewLink = async () => {
		setResending(true);
		try {
			const user = (await supabase.auth.getUser()).data?.user;
			if (!user?.email) {
				setMessage('No email found for your account. Try signing up again.');
				setResending(false);
				return;
			}
			const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
				redirectTo: `${window.location.origin}/reset-password`,
			});
			setMessage(error ? error.message : 'A new reset link has been sent to your email.');
		} catch {
			setMessage('Failed to send new reset link. Please try again.');
		}
		setResending(false);
	};

	return (
		<div className="relative min-h-screen flex items-center justify-center">
			<AuthBackground />

			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="relative z-10 w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-gray-900/70 border border-gray-800/80 shadow-[0_0_25px_rgba(0,255,159,0.2)]"
			>
				<h1 className="text-2xl font-semibold text-white mb-6 text-center">Reset Password</h1>

				<form onSubmit={handleReset} className="space-y-4">
					<Input
						type="password"
						placeholder="New password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						isValid={complex.valid ? true : undefined}
						showValidation={!!password}
						message={
							password
								? complex.valid
									? 'Strong password'
									: 'Min 6 chars, number, upper, lower & symbol'
								: ''
						}
						className="bg-gray-800/60 text-white border-gray-700"
					/>

					<PasswordStrengthMeter password={password} minLength={6} />

					<Button
						type="submit"
						disabled={loading || !complex.valid}
						className="w-full bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] text-black hover:shadow-lg hover:shadow-[#00ff9f]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
					>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{loading ? 'Updating...' : 'Update Password'}
					</Button>
				</form>

				{message && <p className="mt-4 text-center text-emerald-400 animate-pulse">{message}</p>}

				{expired && (
					<div className="mt-6 text-center">
						<Button
							onClick={requestNewLink}
							disabled={resending}
							variant="outline"
							className="cursor-pointer border-[#39e6ff]/50 text-[#39e6ff] hover:bg-[#39e6ff]/10 hover:border-[#39e6ff] flex items-center justify-center"
						>
							{resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{resending ? 'Sending...' : 'Request New Reset Link'}
						</Button>
					</div>
				)}
			</motion.div>
		</div>
	);
}
