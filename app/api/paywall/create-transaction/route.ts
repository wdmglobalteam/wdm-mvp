// --- filename: app/api/paywall/create-transaction/route.ts ---

import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import crypto from 'crypto';

const PAYSTACK_INIT_URL = 'https://api.paystack.co/transaction/initialize';
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL; // REQUIRED

if (!PAYSTACK_SECRET || !PAYSTACK_CALLBACK_URL) {
	console.warn('Missing Paystack env vars: PAYSTACK_SECRET_KEY or PAYSTACK_CALLBACK_URL');
}

type PaystackInitResponse = {
	status: boolean;
	message?: string;
	data?: {
		authorization_url?: string;
		reference?: string;
		access_code?: string;
	};
};

export async function POST(request: NextRequest) {
	try {
		const user = await sessionService.getCurrentUser();
		if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

		const body = await request.json();
		const amountNaira = Number(body.amountNaira) || 1000;
		const amountKobo = Math.round(amountNaira * 100);

		// fetch profile email
		const supabase = getSupabaseAdmin();
		const { data: profile } = await supabase
			.from('profiles')
			.select('email')
			.eq('id', user.userId)
			.single();

		const email = profile?.email;
		if (!email) return NextResponse.json({ error: 'User email missing' }, { status: 400 });

		const payload = {
			email,
			amount: amountKobo,
			callback_url: PAYSTACK_CALLBACK_URL,
			metadata: {
				user_id: user.userId,
			},
		};

		const res = await fetch(PAYSTACK_INIT_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		const data = (await res.json()) as PaystackInitResponse;

		if (!res.ok || !data || data.status === false) {
			console.error('Paystack initialize failed', data);
			return NextResponse.json(
				{ error: data?.message || 'Failed to initialize payment' },
				{ status: 500 }
			);
		}

		const reference = data.data?.reference;
		const authorization_url = data.data?.authorization_url;

		// Persist a pending payment record in payments table for audit/ledger
		try {
			// id must be provided according to your schema; generate a UUID
			const paymentId = crypto.randomUUID();

			const insertPayload = {
				id: paymentId,
				user_id: user.userId,
				provider: 'paystack',
				provider_payment_id: reference ?? null,
				amount: amountNaira, // store in naira (human-friendly); you can store in kobo if you prefer
				currency: 'NGN',
				status: 'pending',
				metadata: {
					init_response: data.data ?? null,
					requested_at: new Date().toISOString(),
				},
			};

			const { error: insertError } = await supabase.from('payments').insert(insertPayload);

			if (insertError) {
				// Log but don't block the flow (payment can still proceed)
				console.error('Failed to create payments row at init:', insertError);
			}
		} catch (err) {
			console.error('Error while inserting initial payment record:', err);
		}

		return NextResponse.json({
			authorization_url,
			reference,
		});
	} catch (err) {
		console.error('create-transaction error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
