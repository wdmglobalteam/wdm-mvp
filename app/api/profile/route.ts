// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
	const authHeader = req.headers.get('authorization') || '';
	const token = authHeader.replace('Bearer ', '');
	if (!token) return NextResponse.json({ error: 'missing token' }, { status: 401 });

	// Verify token & get user
	const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
	if (userErr || !userData.user)
		return NextResponse.json({ error: 'invalid token' }, { status: 401 });

	const user = userData.user;
	const body = await req.json();
	const { display_name, full_name, avatar_url, timezone, locale } = body;

	const { data, error } = await supabaseAdmin
		.from('profiles')
		.upsert(
			{
				id: user.id,
				display_name: display_name ?? user.user_metadata?.display_name,
				full_name: full_name ?? user.user_metadata?.full_name,
				avatar_url: avatar_url ?? user.user_metadata?.avatar_url,
				timezone,
				locale,
			},
			{ onConflict: 'id' }
		)
		.select()
		.single();

	if (error) return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ ok: true, profile: data });
}
