import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { InteractivityJson } from "@/types/lesson";

interface LessonPageProps {
  params: {
    moduleId: string;
    lessonId: string;
  };
}

// ✅ Strongly typed Lesson query
interface LessonWithModule {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  interactivity_json: InteractivityJson;
  module: {
    id: string;
    name: string;
    realm: {
      id: string;
      name: string;
      pillar: {
        id: string;
        name: string;
        path: {
          id: string;
          name: string;
        };
      };
    };
  };
}

// ✅ Strongly typed User Progress
interface UserProgress {
  mastery_percent: number;
  completed: boolean;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { moduleId, lessonId } = params;
  const supabase = createServerClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth'); // 👈 you said you want everything under /auth, not /auth/login
  }

  // Fetch lesson details
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      description,
      order_index,
      interactivity_json,
      module:modules (
        id,
        name,
        realm:realms (
          id,
          name,
          pillar:pillars (
            id,
            name,
            path:paths (
              id,
              name
            )
          )
        )
      )
    `)
    .eq('id', lessonId)
    .eq('module_id', moduleId)
    .eq('published', true)
    .single<LessonWithModule>(); // 👈 typed single()

  if (error || !lesson) {
    notFound();
  }

  // Fetch user progress for this lesson
  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('lesson_id', lessonId)
    .maybeSingle<UserProgress>(); // 👈 typed maybeSingle()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header with breadcrumb */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <a href="/dashboard" className="hover:text-green-400 transition-colors">
              Dashboard
            </a>
            <span>/</span>
            {/* 👇 Fixed: no [0], just .name */}
            <span className="text-white">{lesson.module?.name}</span>
            <span>/</span>
            <span className="text-green-400">Lesson {lesson.order_index + 1}</span>
          </nav>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
        </div>
      </header>

      {/* Main content area */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress indicator */}
        {progress && (
          <div className="mb-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Your Progress</span>
              <span className="font-semibold text-green-400">{progress.mastery_percent}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.mastery_percent}%` }}
              />
            </div>
            {progress.completed && (
              <div className="mt-2 text-sm text-green-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Completed!
              </div>
            )}
          </div>
        )}

        {/* Lesson description */}
        {lesson.description && (
          <div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">What You&apos;ll Learn</h2>
            <p className="text-gray-300">{lesson.description}</p>
          </div>
        )}

        {/* Interactive lesson content placeholder */}
        <div className="mb-8 p-8 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Interactive Lesson Content</h3>
          <p className="text-gray-400 mb-4">
            The micro-lesson will be rendered here from <code className="bg-gray-800 px-2 py-1 rounded text-sm">interactivity_json</code>
          </p>
          <p className="text-sm text-gray-500">
            Coming soon: drag-drop exercises, code validators, visual simulations
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors">
            Resume Lesson
          </button>
          <button className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 rounded-lg transition-colors">
            Mark Complete
          </button>
        </div>

        {/* Implementation notes (hidden in production) */}
        <details className="mt-8 p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-sm">
          <summary className="cursor-pointer font-semibold text-gray-400 hover:text-white">
            🔧 Developer Notes
          </summary>
          <div className="mt-3 space-y-2 text-gray-400">
            <p><strong>Next steps for full implementation:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Parse <code>interactivity_json</code> to determine lesson type</li>
              <li>Render appropriate interactive component (DragDropLesson, CodeValidator, etc.)</li>
              <li>Track user interactions and submit to <code>/api/progress</code></li>
              <li>Calculate mastery_percent and update <code>user_progress</code> table</li>
              <li>Show inline checkpoints after lesson completion</li>
              <li>Unlock next lesson when mastery ≥ 98%</li>
            </ul>
          </div>
        </details>
      </main>
    </div>
  );
}
