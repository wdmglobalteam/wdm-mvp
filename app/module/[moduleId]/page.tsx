import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { getNextLessonInModule } from '@/lib/data/enrollment';

interface ModulePageProps {
  params: {
    moduleId: string;
  };
}

/**
 * Module entry point - immediately resolves and redirects to the next lesson
 * This ensures users always land on the correct lesson when clicking a module
 */
export default async function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = params;
  const supabase = createServerClient();
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  // Find the next lesson for this user in this module
  const nextLessonId = await getNextLessonInModule(session.user.id, moduleId);
  
  if (!nextLessonId) {
    // No lessons available - show error or redirect to dashboard
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Module Not Available</h1>
          <p className="text-gray-400 mb-4">This module has no published lessons yet.</p>
          <a 
            href="/dashboard" 
            className="text-green-500 hover:text-green-400 underline"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Redirect to the next lesson
  redirect(`/module/${moduleId}/lesson/${nextLessonId}`);
}