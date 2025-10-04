// --- filename: app/paywall/success/page.tsx ---
import AuthBackground from '@/components/AuthBackground';
import CursorEffect from '@/components/CursorEffect';
import Link from 'next/link';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sessionService } from '@/lib/server/sessionService';

/**
 * Response structure from verify endpoint
 */
interface VerifyResult {
	success?: boolean;
	status?: string | null;
	reference?: string;
	amount?: number | null;
	currency?: string;
	error?: string;
	message?: string;
	warning?: string;
	details?: string;
	// NEW: include profile snapshot returned by verify endpoint (if available)
	profile?: {
		email?: string | null;
		display_name?: string | null;
		payment_status?: string | null;
	} | null;
}

/**
 * Profile data structure from Supabase
 */
interface ProfileData {
	email: string | null;
	display_name: string | null;
	payment_status: string | null;
	email_verified: boolean | null;
	registration_completed: boolean | null;
}

// Force dynamic rendering to ensure fresh data on every visit
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
	searchParams?: Promise<{ reference?: string }> | { reference?: string };
}

/**
 * Payment Success Page - Server-side rendered
 *
 * FLOW:
 * 1. Extract payment reference from URL
 * 2. Call verify endpoint (which updates DB synchronously and returns updated profile when possible)
 * 3. Prefer the profile returned from verify for immediate display (no reload required)
 * 4. If verify didn't return profile, fetch profile from DB as fallback
 */
export default async function PaywallSuccessPage({ searchParams }: Props) {
	// ===== STEP 1: Extract reference from search params =====
	const params = searchParams instanceof Promise ? await searchParams : searchParams;
	const reference = params?.reference ?? undefined;

	// ===== STEP 2: Get user session (best-effort, don't force auth) =====
	const userSession = await sessionService.getCurrentUser();

	// ===== STEP 3: Call verify endpoint and AWAIT completion =====
	let verifyResult: VerifyResult | null = null;

	if (reference) {
		try {
			const baseUrl =
				process.env.NEXT_PUBLIC_BASE_URL ??
				(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

			const verifyUrl = `${baseUrl}/api/paywall/verify?reference=${encodeURIComponent(reference)}`;

			const verifyResponse = await fetch(verifyUrl, {
				method: 'GET',
				cache: 'no-store',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			});

			verifyResult = (await verifyResponse.json()) as VerifyResult;
		} catch (err) {
			console.error('[SUCCESS_PAGE] Verify endpoint fetch failed:', err);
			verifyResult = {
				success: false,
				error: 'verification_failed',
				message: 'Could not verify payment with Paystack',
			};
		}
	}

	// ===== STEP 4: Get profile info — prefer verifyResult.profile if present =====
	let profile: ProfileData | null = null;

	if (verifyResult?.profile) {
		// Use profile snapshot returned from verify endpoint to avoid read-after-write / replication lag
		profile = {
			email: verifyResult.profile.email ?? null,
			display_name: verifyResult.profile.display_name ?? null,
			payment_status: verifyResult.profile.payment_status ?? null,
			email_verified: null,
			registration_completed: verifyResult.profile.payment_status === 'paid' ? true : null,
		} as ProfileData;
	} else if (userSession) {
		// Fallback: fetch fresh profile from DB
		try {
			const supabase = getSupabaseAdmin();
			const { data, error } = await supabase
				.from('profiles')
				.select('email, display_name, payment_status, email_verified, registration_completed')
				.eq('id', userSession.userId)
				.single();

			if (!error && data) {
				profile = data as ProfileData;
			} else {
				profile = null;
			}
		} catch (err) {
			console.error('[SUCCESS_PAGE] Failed to fetch profile:', err);
			profile = null;
		}
	}

	// ===== Determine final values for UI =====
	const isPaid = verifyResult?.success === true || profile?.payment_status === 'paid';
	const displayName = profile?.display_name ?? 'Student';
	const displayEmail = profile?.email ?? 'No email available';
	const displayStatus = verifyResult?.status ?? profile?.payment_status ?? 'unknown';
	const displayReference = reference ?? verifyResult?.reference ?? '—';
	const displayAmount = verifyResult?.amount
		? `${verifyResult.currency ?? 'NGN'} ${verifyResult.amount.toLocaleString()}`
		: null;

	// Render UI (same styling / layout you had) — now uses profile snapshot if available so no reload is required
	return (
		<div className="min-h-screen relative">
			<AuthBackground />
			<CursorEffect />

			<main className="max-w-4xl mx-auto py-16 px-6">
				<div className="bg-gradient-to-b from-[#071233] to-[#061029] rounded-3xl p-8 shadow-2xl">
					<div className="flex flex-col md:flex-row items-start gap-8">
						{/* Left column */}
						<div className="flex-1">
							{isPaid ? (
								<>
									<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 shadow-lg mb-6">
										<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
											<path
												d="M20 6L9 17l-5-5"
												stroke="#042f1a"
												strokeWidth="2.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>

									<h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
										Payment Successful
									</h1>

									<p className="text-gray-300 text-lg mb-6 leading-relaxed">
										Your payment has been verified and processed successfully. Your account now has lifetime
										access to all premium features.
									</p>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
										<div className="p-5 rounded-xl bg-[#071a2b] border border-emerald-500/20">
											<div className="text-xs uppercase tracking-wider text-emerald-400 mb-2 font-semibold">
												Account Details
											</div>
											<div className="text-xl font-bold text-white mb-1">{displayName}</div>
											<div className="text-sm text-gray-400">{displayEmail}</div>
											<div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
												<div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
												<span className="text-xs font-medium text-emerald-400">Lifetime Access</span>
											</div>
										</div>

										<div className="p-5 rounded-xl bg-[#071a2b] border border-gray-700">
											<div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">
												Transaction Details
											</div>
											<div className="text-sm font-mono text-white mb-1 break-all">{displayReference}</div>
											<div className="text-xs text-gray-500 mt-3">
												Status: <span className="font-semibold text-emerald-400">{displayStatus}</span>
											</div>
											{displayAmount && (
												<div className="text-xs text-gray-500 mt-1">
													Amount: <span className="font-semibold text-white">{displayAmount}</span>
												</div>
											)}
										</div>
									</div>

									<div className="mt-8 flex flex-wrap gap-4">
										{userSession ? (
											<Link
												href="/dashboard"
												className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
											>
												Go to Dashboard →
											</Link>
										) : (
											<Link
												href="/auth"
												className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
											>
												Sign in to Access Dashboard →
											</Link>
										)}
										<Link
											href="/"
											className="px-6 py-3 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-200 hover:text-white transition-all duration-200 hover:bg-gray-800/50"
										>
											Return Home
										</Link>
									</div>
								</>
							) : (
								<>
									<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-500/10 border-2 border-rose-500/30 mb-6">
										<svg width="48" height="48" viewBox="0 0 24 24" fill="none">
											<circle cx="12" cy="12" r="10" stroke="#ff6b6b" strokeWidth="2" />
											<path d="M12 8v4M12 16h.01" stroke="#ff6b6b" strokeWidth="2.5" strokeLinecap="round" />
										</svg>
									</div>

									<h1 className="text-4xl font-extrabold mb-3 text-white">Payment Verification Pending</h1>

									<p className="text-gray-300 text-lg mb-6 leading-relaxed">
										We couldn't automatically verify your payment. If you were charged, please wait a few
										moments and refresh this page. If the issue persists, contact support with your payment
										reference below.
									</p>

									{verifyResult?.error && (
										<div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 mb-6">
											<div className="text-sm font-semibold text-rose-400 mb-1">
												{verifyResult.error === 'verification_failed'
													? 'Verification Failed'
													: verifyResult.error === 'missing_user_id'
														? 'Invalid Payment Metadata'
														: 'Error'}
											</div>
											<div className="text-xs text-gray-400">
												{verifyResult.message ?? verifyResult.details ?? 'No additional details available'}
											</div>
										</div>
									)}

									<div className="p-5 rounded-xl bg-[#071a2b] border border-gray-700 mb-6">
										<div className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">
											Payment Reference
										</div>
										<div className="text-sm font-mono text-white break-all mb-3">{displayReference}</div>
										{displayStatus && displayStatus !== 'unknown' && (
											<div className="text-xs text-gray-500">
												Status: <span className="font-semibold text-rose-400">{displayStatus}</span>
											</div>
										)}
										<div className="mt-4 text-xs text-gray-400 leading-relaxed">
											Please save this reference number. If you were charged, our support team can use this to
											locate your transaction.
										</div>
									</div>

									<div className="mt-8 flex flex-wrap gap-4">
										{/* Use link to reload server-side rendered page — avoids client event handlers in server component */}
										<Link
											href={
												reference
													? `/paywall/success?reference=${encodeURIComponent(reference)}`
													: '/paywall/success'
											}
											className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
										>
											Refresh Page
										</Link>

										<Link
											href="/paywall"
											className="px-6 py-3 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-200 hover:text-white transition-all duration-200 hover:bg-gray-800/50"
										>
											Retry Payment
										</Link>

										<a
											href="mailto:support@yourdomain.com"
											className="px-6 py-3 border border-gray-600 hover:border-gray-500 rounded-lg text-gray-200 hover:text-white transition-all duration-200 hover:bg-gray-800/50"
										>
											Contact Support
										</a>

										{!userSession && (
											<Link
												href="/auth"
												className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold shadow-lg transition-all duration-200"
											>
												Sign in / Create Account
											</Link>
										)}
									</div>
								</>
							)}
						</div>

						{/* Right column */}
						<div className="w-full md:w-80 p-6 rounded-xl bg-[#061223] border border-gray-800">
							<h4 className="text-sm uppercase tracking-wider text-gray-400 mb-4 font-semibold">
								Payment Status
							</h4>

							<div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
								<div
									className={`h-3 rounded-full transition-all duration-500 ${isPaid ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-rose-400 to-orange-400'}`}
									style={{ width: isPaid ? '100%' : '33%' }}
								/>
							</div>

							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<div className={`w-3 h-3 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-gray-600'}`} />
									<span className="text-sm text-gray-300">Payment initiated</span>
								</div>
								<div className="flex items-center gap-3">
									<div className={`w-3 h-3 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-rose-400'}`} />
									<span className="text-sm text-gray-300">
										{isPaid ? 'Verification complete' : 'Verification pending'}
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div className={`w-3 h-3 rounded-full ${isPaid ? 'bg-emerald-400' : 'bg-gray-600'}`} />
									<span className="text-sm text-gray-300">
										{isPaid ? 'Access granted' : 'Awaiting confirmation'}
									</span>
								</div>
							</div>

							<div className="mt-6 pt-6 border-t border-gray-700">
								<div className="text-xs text-gray-400 space-y-2">
									<div>
										<span className="text-gray-500">Reference:</span>{' '}
										<span className="text-gray-300 font-mono text-[10px] break-all">{displayReference}</span>
									</div>
									{displayAmount && (
										<div>
											<span className="text-gray-500">Amount:</span>{' '}
											<span className="text-gray-300 font-semibold">{displayAmount}</span>
										</div>
									)}
									<div className="mt-4 text-[11px] leading-relaxed">
										{isPaid
											? 'Your payment has been confirmed. You can now access all premium features.'
											: 'If you completed payment but are seeing this message, please refresh the page or wait a few moments for the payment to be confirmed.'}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-8 text-center text-sm text-gray-400">
					<p>
						Need help? Contact us at{' '}
						<a
							href="mailto:support@yourdomain.com"
							className="text-emerald-400 hover:text-emerald-300 underline"
						>
							support@yourdomain.com
						</a>
					</p>
				</div>
			</main>
		</div>
	);
}
