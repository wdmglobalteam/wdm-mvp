// --- filename: app/api/onboarding/save-step/route.ts ---
/**
 * POST /api/onboarding/save-step
 * Saves onboarding step data
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { onboardingService } from '@/lib/server/onboardingService';

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
    const { step, data } = body;

    if (typeof step !== 'number' || !data) {
      return NextResponse.json(
        { error: 'Invalid request. Step and data are required.' },
        { status: 400 }
      );
    }

    const result = await onboardingService.saveStep({
      userId: user.userId,
      step,
      data,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save step route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}