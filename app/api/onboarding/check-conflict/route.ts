// --- filename: app/api/onboarding/check-conflict/route.ts ---
/**
 * POST /api/onboarding/check-conflict
 * Checks for duplicate matric or whatsapp
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
    const { matricNumber, whatsappNumber } = body;

    const result = await onboardingService.checkConflict({
      matricNumber,
      whatsappNumber,
      userId: user.userId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Check conflict route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}