// --- filename: app/dashboard/page.tsx ---
import { redirect } from 'next/navigation';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import EnrollmentCard from '@/components/dashboard/EnrollmentCard';
import DashboardShell from '@/components/dashboard/DashboardShell';
import type { PathWithHierarchy } from '@/types/supabase';

export default async function DashboardPage() {
  // Step 1: Server-side authentication check
  const user = await sessionService.getCurrentUser();

  if (!user) {
    // User not logged in, redirect immediately
    redirect('/auth');
  }

  const supabase = getSupabaseAdmin();

  // Step 2: Check onboarding and payment status
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('registration_completed, payment_status')
    .eq('id', user.userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    redirect('/auth'); // fallback redirect
  }

  if (!profile?.registration_completed) {
    redirect('/onboarding');
  }

  if (profile?.payment_status !== 'paid') {
    redirect('/paywall');
  }

  // Step 3: Fetch enrollment status
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.userId)
    .single();

  // Step 4: Fetch learning hierarchy
  const { data: path } = await supabase
    .from('paths')
    .select(`
      id,
      name,
      slug,
      description,
      published,
      order_index,
      created_at,
      updated_at,
      created_by,
      updated_by,
      journey_id,
      pillars (
        id,
        name,
        description,
        order_index,
        realms (
          id,
          name,
          description,
          order_index,
          modules (
            id,
            name,
            description,
            order_index,
            lessons (
              id,
              title,
              description,
              order_index
            )
          )
        )
      )
    `)
    .eq('slug', 'frontend-development')
    .eq('published', true)
    .single<PathWithHierarchy>();

  if (!path) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Content</h1>
          <p className="mt-2 text-gray-600">
            Unable to load learning path. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Step 5: Render based on enrollment
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <EnrollmentCard hierarchy={path} userId={user.userId} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <DashboardShell hierarchy={path} enrollment={enrollment} userId={user.userId} />
    </div>
  );
}
