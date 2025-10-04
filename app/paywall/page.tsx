// --- filename: app/paywall/page.tsx ---
import AuthBackground from '@/components/AuthBackground';
import CursorEffect from '@/components/CursorEffect';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import PayButtonClient from '@/components/PayButtonWrapper';

interface UserProfile {
	userId: string;
	email?: string;
	display_name?: string;
	payment_status?: string;
	[key: string]: unknown;
}

export const revalidate = 0; // always fetch fresh session

export default async function PaywallPage(): Promise<React.JSX.Element> {
	const userSession = await sessionService.getCurrentUser();
	if (!userSession) redirect('/auth');

	const supabase = getSupabaseAdmin();
	const { data: profile } = await supabase
		.from('profiles')
		.select('email, display_name, payment_status')
		.eq('id', userSession.userId)
		.single();

	if (!profile) redirect('/auth');

	const user: UserProfile = {
		userId: userSession.userId,
		email: profile?.email ?? undefined,
		display_name: profile?.display_name ?? undefined,
		payment_status: profile?.payment_status ?? undefined,
	};

	const paid = (user.payment_status ?? 'unpaid') === 'paid';

	// If already paid, redirect to dashboard
	if (paid) {
		redirect('/dashboard');
	}

	return (
		<div className="min-h-screen relative">
			<AuthBackground />
			<CursorEffect />
			<header className="max-w-6xl mx-auto flex items-center justify-between p-6">
				<div className="flex items-center gap-6">
					<Link href="/" className="text-2xl font-extrabold tracking-tight">
						WDM
					</Link>
				</div>
			</header>

			<main className="max-w-6xl mx-auto p-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
					<section className="p-8 rounded-2xl bg-gradient-to-b from-[#071233] to-[#081229] shadow-xl">
						<div className="flex items-center justify-between mb-6">
							<h3 className="text-2xl font-bold">Secure your lifetime access</h3>
							<div className="text-sm text-gray-400">One-time payment</div>
						</div>

						<p className="text-sm text-gray-300 mb-6">
							Unlock all courses, mentorship channels, progress tracking and deeper access to WDM community
							features. Payment is handled by Paystack — secure and industry standard.
						</p>

						<div className="mb-6">
							<div className="text-xs text-gray-400 mb-1">Amount</div>
							<div className="text-3xl font-semibold">₦1,000</div>
						</div>

						<div className="mb-6">
							<div className="text-xs text-gray-400 mb-2">Account</div>
							<div className="flex items-center gap-3">
								<div className="text-sm text-gray-200">{user.display_name ?? 'Student'}</div>
								<div className="text-xs text-gray-500">· {user.email ?? 'no-email'}</div>
							</div>
						</div>

						<div className="mt-4">
							{/* Client component handles the checkout */}
							<PayButtonClient amountNaira={1000} email={user.email as string | undefined} />
						</div>

						<div className="mt-8 text-xs text-gray-500">
							By continuing you agree to WDM&apos;s terms and payment policies.
						</div>
					</section>

					<aside className="p-8 rounded-2xl bg-[#071233] shadow-lg">
						<h4 className="text-xl font-semibold mb-4">Included</h4>
						<ul className="space-y-3 text-gray-300 list-disc ml-5">
							<li>Lifetime access to all learning paths</li>
							<li>Mentorship & community channels</li>
							<li>Progress tracking and badges</li>
							<li>Exclusive challenge projects</li>
						</ul>

						<div className="mt-6">
							<h5 className="text-sm text-gray-400 mb-2">Support</h5>
							<div className="text-sm text-gray-300">
								If you encounter any issues with payment, contact{' '}
								<a className="underline" href="mailto:support@wdm.example">
									support@wdm.example
								</a>
								.
							</div>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}
