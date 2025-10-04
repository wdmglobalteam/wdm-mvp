// --- filename: app/api/onboarding/complete/route.ts ---
/**
 * POST /api/onboarding/complete
 * Marks onboarding as completed
 */

import { NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { onboardingService } from '@/lib/server/onboardingService';

export async function POST() {
  try {
    const user = await sessionService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await onboardingService.completeOnboarding(user.userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Complete onboarding route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}