// --- filename: app/api/paywall/verify/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import type { Json } from '@/types/supabase';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_VERIFY_URL = (reference: string) =>
	`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;

/**
 * Verification endpoint for Paystack transactions.
 * - Calls Paystack verify API
 * - Updates existing payment record status from 'pending' to 'success'
 * - Updates profile.payment_status to "paid" when appropriate
 * - Returns verification result plus updated profile (if available) so pages can render instantly
 */
export async function GET(request: NextRequest) {
	try {
		const url = new URL(request.url);
		const reference = url.searchParams.get('reference');

		if (!reference) {
			return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
		}

		if (!PAYSTACK_SECRET) {
			console.error('[VERIFY] Missing PAYSTACK_SECRET_KEY');
			return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
		}

		console.log('[VERIFY] Verifying transaction:', reference);

		// Call Paystack API
		const res = await fetch(PAYSTACK_VERIFY_URL(reference), {
			method: 'GET',
			headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
		});

		const data = await res.json();

		if (!res.ok) {
			console.error('[VERIFY] Paystack API error:', data);
			return NextResponse.json({ error: 'Verification failed', raw: data }, { status: 500 });
		}

		const status = (data.data?.status as string | undefined) ?? 'unknown';
		const metadata = (data.data?.metadata ?? {}) as Record<string, unknown>;
		const userId = metadata.user_id as string | undefined;

		console.log('[VERIFY] Status:', status, 'UserId:', userId);

		const supabase = getSupabaseAdmin();

		// Build canonical payment status
		const canonicalStatus = status === 'success' ? 'success' : (status ?? 'unknown');

		// Find existing payment record by provider_payment_id (created during initialization)
		const { data: existingPayment, error: selectErr } = await supabase
			.from('payments')
			.select('*')
			.eq('provider', 'paystack')
			.eq('provider_payment_id', reference)
			.limit(1)
			.single();

		// Prepare payment update payload
		const paymentPayload = {
			user_id: userId ?? 'unknown',
			provider: 'paystack' as const,
			provider_payment_id: reference,
			amount: data.data?.amount ? Number(data.data.amount) / 100 : null,
			currency: (data.data?.currency as string) ?? 'NGN',
			status: 'success', // This updates from 'pending' to 'success'
			metadata: (data.data ?? null) as Json,
		};

		try {
			if (!selectErr && existingPayment) {
				// Update the existing pending record to success
				const { error: updateErr } = await supabase
					.from('payments')
					.update(paymentPayload)
					.eq('id', existingPayment.id);

				if (updateErr) {
					console.error('[VERIFY] payments update failed:', updateErr);
				} else {
					console.log(
						'[VERIFY] ✅ Payment status updated from',
						existingPayment.status,
						'to',
						canonicalStatus != 'success' ? 'success' : canonicalStatus,
						'for',
						reference
					);
				}
			} else {
				// No existing record found - insert new one (shouldn't normally happen if create-transaction worked)
				console.warn(
					'[VERIFY] No existing payment found for reference:',
					reference,
					'- creating new record'
				);
				const { error: insertErr } = await supabase.from('payments').insert({ ...paymentPayload });

				if (insertErr) {
					console.error('[VERIFY] payments insert failed:', insertErr);
				} else {
					console.log('[VERIFY] ✅ New payment inserted with status', canonicalStatus);
				}
			}
		} catch (err) {
			console.error('[VERIFY] payments operation unexpected error:', err);
		}

		// Update profile if successful and userId exists
		let returnedProfile = null;
		if (userId && canonicalStatus === 'success') {
			try {
				const { error: profileError } = await supabase
					.from('profiles')
					.update({ payment_status: 'paid', registration_completed: true })
					.eq('id', userId);

				if (profileError) {
					console.error('[VERIFY] Profile update failed:', profileError);
				} else {
					console.log('[VERIFY] ✅ Profile updated to paid for user:', userId);
				}

				// Fetch the fresh profile to include in response (so client can render immediately)
				const { data: profileData, error: fetchProfileError } = await supabase
					.from('profiles')
					.select('email, display_name, payment_status, email_verified, registration_completed')
					.eq('id', userId)
					.single();

				if (!fetchProfileError && profileData) {
					returnedProfile = profileData;
				} else {
					if (fetchProfileError) console.error('[VERIFY] Could not refetch profile:', fetchProfileError);
				}
			} catch (err) {
				console.error('[VERIFY] Unexpected error updating/fetching profile:', err);
			}
		}

		// Return structured result (including profile when available)
		return NextResponse.json({
			success: status === 'success',
			status,
			reference,
			amount: paymentPayload.amount,
			currency: paymentPayload.currency,
			profile: returnedProfile,
		});
	} catch (err) {
		console.error('[VERIFY] Top-level error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
