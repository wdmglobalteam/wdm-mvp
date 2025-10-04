import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';

/**
 * POST /api/enroll
 * Creates an enrollment record for the current user
 * No payment checks - assumes payment already handled
 */
export async function POST(request: Request) {
  try {
    const supabase = createRouteClient();
    
    // Step 1: Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 });
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { pathId } = body;

    if (!pathId) {
      return NextResponse.json(
        { error: 'pathId is required' },
        { status: 400 }
      );
    }

    // Step 3: Check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('path_id', pathId)
      .maybeSingle();

    if (existingEnrollment) {
      // Already enrolled - return success (idempotent)
      return NextResponse.json({ 
        success: true, 
        enrollmentId: existingEnrollment.id,
        message: 'Already enrolled'
      });
    }

    // Step 4: Create new enrollment
    const { data: newEnrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        path_id: pathId,
        status: 'active',
        progress_percent: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (enrollError) {
      console.error('Enrollment error:', enrollError);
      return NextResponse.json(
        { error: 'Failed to create enrollment' },
        { status: 500 }
      );
    }

    // Step 5: Return success
    return NextResponse.json({ 
      success: true, 
      enrollmentId: newEnrollment.id 
    });

  } catch (error) {
    console.error('Unexpected error in enrollment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}