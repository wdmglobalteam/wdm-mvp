// --- filename: app/api/paywall/webhook/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';
import type { Json } from '@/types/supabase';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

type PaystackEvent = {
	event: string;
	data: Record<string, unknown>;
};

/**
 * Webhook handler for Paystack events
 * - Validates signature
 * - On success events, updates existing payment record status from 'pending' to 'success'
 * - Updates profile payment_status
 */
export async function POST(request: NextRequest) {
	try {
		if (!PAYSTACK_SECRET) {
			console.error('[WEBHOOK] Missing PAYSTACK_SECRET_KEY');
			return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
		}

		// Raw body + signature validation
		const raw = await request.text();
		const signature = request.headers.get('x-paystack-signature') ?? '';
		const computed = crypto.createHmac('sha512', PAYSTACK_SECRET).update(raw).digest('hex');

		if (!signature || computed !== signature) {
			console.warn('[WEBHOOK] Invalid signature');
			return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
		}

		const event = JSON.parse(raw) as PaystackEvent;
		const eventType = event?.event ?? 'unknown';
		const payload = (event?.data ?? {}) as Record<string, unknown>;

		console.log('[WEBHOOK] Event:', eventType);

		if (
			eventType === 'charge.success' ||
			eventType === 'transaction.success' ||
			eventType === 'invoice.payment_succeeded'
		) {
			const metadata = (payload.metadata ?? {}) as Record<string, unknown>;
			const rawUserId = metadata?.user_id ?? null;
			const reference = (payload.reference ?? payload.ref ?? null) as string | null;
			const rawAmount = payload.amount as number | string | undefined;
			const amountKobo =
				typeof rawAmount === 'number'
					? rawAmount
					: typeof rawAmount === 'string'
						? Number(rawAmount)
						: undefined;
			const status = (payload.status as string | undefined) ?? 'unknown';

			const userId =
				typeof rawUserId === 'string' ? rawUserId : rawUserId != null ? String(rawUserId) : 'unknown';
			const amountNaira =
				typeof amountKobo === 'number' && !Number.isNaN(amountKobo)
					? Math.round((amountKobo / 100) * 100) / 100
					: null;
			const canonicalStatus = status === 'success' ? 'success' : (status ?? 'unknown');

			const supabase = getSupabaseAdmin();

			// Update profile if we have a meaningful userId
			if (userId && userId !== 'unknown') {
				try {
					const { error: profileError } = await supabase
						.from('profiles')
						.update({ payment_status: 'paid', registration_completed: true })
						.eq('id', userId);

					if (profileError) {
						console.error('[WEBHOOK] Profile update failed:', profileError);
					} else {
						console.log('[WEBHOOK] ✅ Profile updated for', userId);
					}
				} catch (err) {
					console.error('[WEBHOOK] Unexpected profile update error:', err);
				}
			} else {
				console.warn('[WEBHOOK] Missing metadata.user_id — storing payment with user_id=unknown');
			}

			// Find and update existing payment record
			try {
				if (reference) {
					// Look for existing payment by provider_payment_id
					const { data: existingPayment, error: selectError } = await supabase
						.from('payments')
						.select('*')
						.eq('provider', 'paystack')
						.eq('provider_payment_id', reference)
						.limit(1)
						.single();

					// Build payment payload
					const paymentPayload = {
						user_id: userId,
						provider: 'paystack' as const,
						provider_payment_id: reference,
						amount: amountNaira,
						currency: (payload.currency as string) ?? 'NGN',
						status: canonicalStatus, // This updates from 'pending' to 'success'
						metadata: (payload as unknown as Json) ?? null,
					};

					if (!selectError && existingPayment) {
						// Update existing pending record to success
						const { error: updateErr } = await supabase
							.from('payments')
							.update(paymentPayload)
							.eq('id', existingPayment.id);

						if (updateErr) {
							console.error('[WEBHOOK] payments update failed:', updateErr);
						} else {
							console.log(
								'[WEBHOOK] ✅ Payment status updated from',
								existingPayment.status,
								'to',
								canonicalStatus,
								'for',
								reference
							);
						}
					} else {
						// No existing record - insert new one (shouldn't normally happen)
						console.warn(
							'[WEBHOOK] No existing payment found for reference:',
							reference,
							'- creating new record'
						);
						const { error: insertErr } = await supabase.from('payments').insert(paymentPayload);

						if (insertErr) {
							console.error('[WEBHOOK] payments insert failed:', insertErr);
						} else {
							console.log('[WEBHOOK] ✅ New payment inserted with status', canonicalStatus);
						}
					}
				} else {
					// No reference - insert with generated id
					console.warn('[WEBHOOK] Payment event missing reference - creating anonymous record');
					const { error: insertErr } = await supabase.from('payments').insert({
						user_id: userId,
						provider: 'paystack' as const,
						provider_payment_id: null,
						amount: amountNaira,
						currency: (payload.currency as string) ?? 'NGN',
						status: canonicalStatus,
						metadata: (payload as unknown as Json) ?? null,
					});

					if (insertErr) {
						console.error('[WEBHOOK] payments insert failed for anonymous payment:', insertErr);
					} else {
						console.log('[WEBHOOK] ✅ Anonymous payment inserted');
					}
				}
			} catch (err) {
				console.error('[WEBHOOK] payments operation unexpected error:', err);
			}
		} // end success handling

		// Acknowledge receipt
		return NextResponse.json({ received: true });
	} catch (err) {
		console.error('[WEBHOOK] Top-level error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
