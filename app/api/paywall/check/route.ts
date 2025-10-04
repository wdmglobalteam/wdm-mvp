// --- filename: app/api/paywall/check/route.ts ---
/**
 * GET /api/paywall/check
 * Checks payment status
 */

import { NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const user = await sessionService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles')
      .select('payment_status')
      .eq('id', user.userId)
      .single();

    const paid = profile?.payment_status === 'paid';

    return NextResponse.json({ paid });
  } catch (error) {
    console.error('Paywall check route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}