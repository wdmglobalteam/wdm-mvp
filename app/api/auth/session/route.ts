// --- filename: app/api/auth/session/route.ts ---
/**
 * GET /api/auth/session
 * Returns current user session
 */

import { NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    const user = await sessionService.getCurrentUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Fetch user profile
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.userId)
      .single();

    return NextResponse.json({
      user: {
        id: user.userId,
        ...profile,
      },
    });
  } catch (error) {
    console.error('Session route error:', error);
    return NextResponse.json({ user: null });
  }
}