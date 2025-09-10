'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthBackground } from '@/components/AuthBackground';
import PasswordStrengthMeter, {
	validatePasswordComplexity,
} from '@/components/PasswordStrengthMeter';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const FULAFIA_SCHOOL_ID = 'db2c8a7d-841f-41a9-9c07-f3fd61d8a646';

export default function AuthPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [matric, setMatric] = useState('');
	const [whatsapp, setWhatsapp] = useState('');
	const [pwComplex, setPwComplex] = useState(() => validatePasswordComplexity('', 6));
	useEffect(() => {
		setPwComplex(validatePasswordComplexity(password, 6));
	}, [password]);

	const [matricValid, setMatricValid] = useState<boolean | null>(null);
	const [whatsappValid, setWhatsappValid] = useState<boolean | null>(null);

	const [matricUnique, setMatricUnique] = useState<boolean | null>(null);
	const [whatsappUnique, setWhatsappUnique] = useState<boolean | null>(null);

	const [loading, setLoading] = useState(false);
	const [mode, setMode] = useState<'signup' | 'signin'>('signup');
	const [message, setMessage] = useState('');

	// ============================
	// Helpers
	// ============================

	const normalizeWhatsapp = (value: string): string | null => {
		try {
			const parsed = parsePhoneNumberFromString(value, 'NG'); // assume NG by default
			if (parsed && parsed.isValid()) {
				return parsed.number; // always in E.164, e.g. 2349064354586
			}
		} catch {
			return null;
		}
		return null;
	};

	const validateMatric = (value: string): boolean => {
		const formatted = value.trim().toUpperCase();
		return /^\d{4}\/[A-Z]{2,}\/[A-Z]{2,}\/\d{3,}$/.test(formatted);
	};

	// ============================
	// Live Validation
	// ============================

	useEffect(() => {
		if (!matric) {
			setMatricValid(null);
			return;
		}
		setMatricValid(validateMatric(matric));
	}, [matric]);

	useEffect(() => {
		if (!whatsapp) {
			setWhatsappValid(null);
			return;
		}
		setWhatsappValid(normalizeWhatsapp(whatsapp) !== null);
	}, [whatsapp]);

	// ============================
	// Uniqueness Checks (debounced)
	// ============================

	useEffect(() => {
		if (!matricValid) {
			setMatricUnique(null);
			return;
		}
		const timeout = setTimeout(() => {
			const formatted = matric.trim().toUpperCase();
			supabase
				.from('profiles')
				.select('id')
				.eq('school_id', FULAFIA_SCHOOL_ID)
				.eq('matric_number', formatted)
				.then(({ data }) => {
					setMatricUnique(data?.length === 0);
				});
		}, 500); // debounce 500ms
		return () => clearTimeout(timeout);
	}, [matric, matricValid]);

	useEffect(() => {
		if (!whatsappValid) {
			setWhatsappUnique(null);
			return;
		}
		const timeout = setTimeout(() => {
			const normalized = normalizeWhatsapp(whatsapp);
			if (!normalized) return;
			supabase
				.from('profiles')
				.select('id')
				.eq('whatsapp_number', normalized)
				.then(({ data }) => {
					setWhatsappUnique(data?.length === 0);
				});
		}, 500);
		return () => clearTimeout(timeout);
	}, [whatsapp, whatsappValid]);

	useEffect(() => {
		const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
			if (!session?.user) return;
			const user = session.user;

			// Extract info from Google
			const displayName = user.user_metadata?.full_name || user.email?.split('@')[0];
			const avatarUrl = user.user_metadata?.avatar_url || null;

			// Ensure profile exists
			const { data: existingProfile } = await supabase
				.from('profiles')
				.select('id')
				.eq('id', user.id)
				.single();

			if (!existingProfile) {
				// Create new profile with matric & WhatsApp entered on form
				const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
				const formattedMatric = matric.trim().toUpperCase();

				await fetch('/api/profile', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({
						display_name: displayName,
						avatar_url: avatarUrl,
						timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
						school_id: FULAFIA_SCHOOL_ID,
						matric_number: formattedMatric,
						whatsapp_number: normalizedWhatsapp,
					}),
				});
			}
		});

		return () => listener.subscription.unsubscribe();
	}, [matric, whatsapp]);

	// ============================
	// Handle Auth
	// ============================

	const handleGoogleSignIn = async () => {
		setLoading(true);
		setMessage('');

		// Ensure matric & whatsapp are entered
		if (!matric || !whatsapp) {
			setMessage('Please enter both Matric Number and WhatsApp Number.');
			setLoading(false);
			return;
		}

		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: window.location.origin, // back to same page
			},
		});

		if (error) setMessage(error.message);
		setLoading(false);
	};

	const handleAuth = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');

		if (mode === 'signup') {
			const normalizedWhatsapp = normalizeWhatsapp(whatsapp);
			const formattedMatric = matric.trim().toUpperCase();

			if (!normalizedWhatsapp || !validateMatric(formattedMatric)) {
				setMessage('Invalid matric or WhatsApp format.');
				setLoading(false);
				return;
			}
			if (!matricUnique || !whatsappUnique) {
				setMessage('Matric or WhatsApp already registered.');
				setLoading(false);
				return;
			}

			const { data, error } = await supabase.auth.signUp({ email, password });
			if (error) {
				setMessage(error.message);
				setLoading(false);
				return;
			}

			if (data.user) {
				const { data: sessionData } = await supabase.auth.getSession();
				const token = sessionData?.session?.access_token;
				if (token) {
					await fetch('/api/profile', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							display_name: email.split('@')[0],
							timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
							school_id: FULAFIA_SCHOOL_ID,
							matric_number: formattedMatric,
							whatsapp_number: normalizedWhatsapp,
						}),
					});
				}
			}

			setMessage('Signup successful! Please check your email.');
		} else {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			if (error) {
				// Check if error is "password not set"
				if (error.message.includes('Invalid login credentials')) {
					setMessage(
						'No password set for this email. Please sign in with Google or reset your password.'
					);
				} else {
					setMessage(error.message);
				}
				setLoading(false);
				return;
			}
			setMessage('Signin successful!');
		}
		setLoading(false);
	};

	const allValid =
		email && pwComplex.valid && matricValid && whatsappValid && matricUnique && whatsappUnique;

	// ============================
	// Render
	// ============================

	return (
		<div className="relative min-h-screen flex items-center justify-center">
			<AuthBackground />

			<motion.div
				initial={{ opacity: 0, y: 25 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.7 }}
				className="relative z-10 w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-gray-900/70 border border-gray-800/80 shadow-[0_0_25px_rgba(0,255,159,0.2)]"
			>
				<h1 className="text-2xl font-semibold text-white mb-6 text-center">
					{mode === 'signup' ? 'Create Account' : 'Sign In'}
				</h1>

				<form onSubmit={handleAuth} className="space-y-4">
					<Input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="bg-gray-800/60 text-white border-gray-700"
					/>

					<Input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="bg-gray-800/60 text-white border-gray-700"
						isValid={pwComplex.valid ?? undefined}
						showValidation={!!password}
						message={
							password
								? pwComplex.valid
									? 'Strong password'
									: 'Min 6 chars + number + upper + lower + symbol'
								: ''
						}
					/>

					<PasswordStrengthMeter password={password} minLength={6} />

					{mode === 'signup' && (
						<>
							<Input
								type="text"
								placeholder="Matric Number (1234/AB/ABC/5678)"
								value={matric}
								onChange={(e) => setMatric(e.target.value)}
								isValid={matricValid ?? undefined}
								showValidation={!!matric}
								message={
									matricValid
										? matricUnique === false
											? 'Matric already registered'
											: 'Valid matric format'
										: matric
										? 'Format must be YYYY/XX/XXX/NNNN'
										: ''
								}
								className="bg-gray-800/60 text-white border-gray-700"
							/>

							<Input
								type="text"
								placeholder="WhatsApp Number (e.g. 09012345678)"
								value={whatsapp}
								onChange={(e) => setWhatsapp(e.target.value)}
								isValid={whatsappValid ?? undefined}
								showValidation={!!whatsapp}
								message={
									whatsappValid
										? whatsappUnique === false
											? 'Number already registered'
											: `Formatted: ${normalizeWhatsapp(whatsapp)}`
										: whatsapp
										? 'Invalid number'
										: ''
								}
								className="bg-gray-800/60 text-white border-gray-700"
							/>
						</>
					)}

					<Button
						onClick={handleGoogleSignIn}
						disabled={loading || !matricValid || !whatsappValid}
						className="cursor-pointer w-full flex items-center justify-center gap-2 bg-white text-black hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<FaGoogle /> Sign in / Sign up with Google
					</Button>

					{(!matric || !whatsapp) && (
						<p className="text-red-400 text-sm mt-1 animate-pulse">
							Please enter both Matric Number and WhatsApp Number
						</p>
					)}

					<Button
						type="submit"
						disabled={loading || (mode === 'signup' && !allValid)}
						className="cursor-pointer w-full bg-gradient-to-r from-[#00ff9f] to-[#39e6ff] text-black hover:shadow-lg hover:shadow-[#00ff9f]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Loading...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
					</Button>
				</form>

				<div className="mt-4 flex justify-between text-sm text-gray-400">
					<Link href="/forgot-password" className="hover:text-[#00ff9f]">
						Forgot password?
					</Link>
					<button
						onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
						className="cursor-pointer hover:text-[#39e6ff]"
					>
						{mode === 'signup' ? 'Sign in' : 'Create account'}
					</button>
				</div>

				{message && <p className="mt-4 text-center text-emerald-400 animate-pulse">{message}</p>}
			</motion.div>
		</div>
	);
}
