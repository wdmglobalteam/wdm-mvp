// --- filename: app/api/onboarding/resume/route.ts ---
/**
 * GET /api/onboarding/resume
 * Gets current onboarding progress
 */

import { NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { onboardingService } from '@/lib/server/onboardingService';

export async function GET() {
  try {
    const user = await sessionService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const progress = await onboardingService.getProgress(user.userId);

    if (!progress) {
      return NextResponse.json(
        { error: 'Failed to load progress' },
        { status: 500 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Resume route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}