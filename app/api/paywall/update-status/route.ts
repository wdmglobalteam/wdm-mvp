// --- filename: app/api/paywall/update-status/route.ts ---
/**
 * POST /api/paywall/update-status
 * Updates payment status (for dev/testing or webhook)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const user = await sessionService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!['paid', 'unpaid', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('profiles')
      .update({
        payment_status: status,
        registration_completed: status === 'paid',
      })
      .eq('id', user.userId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update payment status route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}