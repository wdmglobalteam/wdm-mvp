// --- filename: app/api/paywall/diagnose/route.ts ---
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Diagnostic endpoint to troubleshoot payment configuration
 * Access at: /api/paywall/diagnose
 *
 * This endpoint checks:
 * - Environment variables are set
 * - Database connectivity
 * - Recent payment records
 * - Webhook configuration hints
 */
export async function GET() {
	const supabase = getSupabaseAdmin();

	// ===== Check Environment Variables =====
	const environment = {
		hasPaystackSecret: !!process.env.PAYSTACK_SECRET_KEY,
		hasPaystackPublic: !!process.env.PAYSTACK_PUBLIC_KEY,
		hasCallbackUrl: !!process.env.PAYSTACK_CALLBACK_URL,
		hasBaseUrl: !!(process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL),
		// Show actual values (safe for local dev - remove in production)
		callbackUrl: process.env.PAYSTACK_CALLBACK_URL,
		baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL,
		nodeEnv: process.env.NODE_ENV,
	};

	// ===== Check Database Connection =====
	let dbConnected = false;
	let dbError = null;
	try {
		const { error } = await supabase.from('payments').select('id').limit(1);
		dbConnected = !error;
		dbError = error?.message ?? null;
	} catch (err) {
		dbError = String(err);
	}

	// ===== Check Recent Payments =====
	const { data: recentPayments, error: paymentsError } = await supabase
		.from('payments')
		.select('id, user_id, provider_payment_id, amount, status, created_at')
		.order('created_at', { ascending: false })
		.limit(10);

	// ===== Count Payments by Status =====
	const { data: statusCounts } = await supabase
		.from('payments')
		.select('status')
		.then((res) => {
			if (!res.data) return { data: [] };
			const counts: Record<string, number> = {};
			res.data.forEach((p: any) => {
				const status = p.status || 'null';
				counts[status] = (counts[status] || 0) + 1;
			});
			return { data: counts };
		});

	// ===== Check Profiles Payment Status =====
	const { data: paidProfiles, error: profilesError } = await supabase
		.from('profiles')
		.select('id')
		.eq('payment_status', 'paid')
		.then((res) => ({
			data: res.data?.length ?? 0,
			error: res.error,
		}));

	// ===== Configuration Warnings =====
	const warnings: string[] = [];
	if (!environment.hasPaystackSecret) {
		warnings.push('Missing PAYSTACK_SECRET_KEY - webhook validation will fail');
	}
	if (!environment.hasCallbackUrl) {
		warnings.push('Missing PAYSTACK_CALLBACK_URL - users may not be redirected correctly');
	}
	if (!environment.hasBaseUrl) {
		warnings.push('Missing NEXT_PUBLIC_BASE_URL/VERCEL_URL - verify endpoint may fail');
	}
	if (!dbConnected) {
		warnings.push('Database connection failed - check Supabase configuration');
	}
	if (paymentsError) {
		warnings.push(`Payments table query failed: ${paymentsError.message}`);
	}

	// ===== Webhook Configuration Hints =====
	const webhookConfig = {
		expectedUrl: environment.baseUrl
			? `${environment.baseUrl}/api/paywall/webhook`
			: 'Set NEXT_PUBLIC_BASE_URL first',
		requiredEvents: ['charge.success', 'transaction.success', 'invoice.payment_succeeded'],
		testInstructions:
			'Go to Paystack Dashboard → Settings → Webhooks → Add webhook URL and subscribe to events',
	};

	// ===== Success Criteria =====
	const successCriteria = {
		environmentConfigured:
			environment.hasPaystackSecret && environment.hasCallbackUrl && environment.hasBaseUrl,
		databaseAccessible: dbConnected,
		hasPayments: (recentPayments?.length ?? 0) > 0,
		hasSuccessfulPayments: (statusCounts as any)?.['success'] > 0,
		hasPaidUsers: paidProfiles > 0,
	};

	const allGreen = Object.values(successCriteria).every((v) => v === true);

	return NextResponse.json(
		{
			status: allGreen ? 'healthy' : 'needs_attention',
			timestamp: new Date().toISOString(),
			environment,
			database: {
				connected: dbConnected,
				error: dbError,
			},
			payments: {
				total: recentPayments?.length ?? 0,
				statusBreakdown: statusCounts ?? {},
				recent: recentPayments ?? [],
			},
			profiles: {
				paidCount: paidProfiles,
				error: profilesError?.message ?? null,
			},
			webhook: webhookConfig,
			warnings: warnings.length > 0 ? warnings : ['No warnings - configuration looks good!'],
			successCriteria,
			nextSteps: allGreen
				? ['Configuration complete! Test end-to-end payment flow.']
				: [
						...(!successCriteria.environmentConfigured
							? ['Configure missing environment variables']
							: []),
						...(!successCriteria.databaseAccessible ? ['Check Supabase connection'] : []),
						...(!successCriteria.hasPayments ? ['Make a test payment to create payment records'] : []),
						'Configure webhook URL in Paystack dashboard',
						'Test webhook delivery from Paystack',
						'Complete a test payment end-to-end',
					],
		},
		{
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-store, max-age=0',
			},
		}
	);
}
