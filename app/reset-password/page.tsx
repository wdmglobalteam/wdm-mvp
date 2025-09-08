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

export default function ResetPasswordPage() {
	const [password, setPassword] = useState('');
	const [complex, setComplex] = useState(() => validatePasswordComplexity('', 6));
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');

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
		const { error } = await supabase.auth.updateUser({ password });
		setMessage(error ? error.message : 'Password updated! You can log in now.');
		setLoading(false);
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
						className="w-full bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] text-black hover:shadow-lg hover:shadow-[#00ff9f]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Updating...' : 'Update Password'}
					</Button>
				</form>

				{message && <p className="mt-4 text-center text-emerald-400 animate-pulse">{message}</p>}
			</motion.div>
		</div>
	);
}
