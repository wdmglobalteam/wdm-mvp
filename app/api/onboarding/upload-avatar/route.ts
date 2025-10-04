// --- filename: app/api/onboarding/upload-avatar/route.ts ---
/**
 * POST /api/onboarding/upload-avatar
 * Uploads avatar to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { randomBytes } from 'crypto';

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
    const { base64, filename, contentType } = body;

    if (!base64 || !filename || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64, 'base64');

    // Validate file size (5MB max)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Generate unique filename
    const ext = filename.split('.').pop();
    const uniqueFilename = `${user.userId}/${randomBytes(16).toString('hex')}.${ext}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(uniqueFilename, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(uploadData.path);

    const avatarUrl = urlData.publicUrl;

    // Update profile
    await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.userId);

    return NextResponse.json({
      success: true,
      url: avatarUrl,
    });
  } catch (error) {
    console.error('Upload avatar route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}