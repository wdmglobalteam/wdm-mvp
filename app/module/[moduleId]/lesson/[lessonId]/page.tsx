import { redirect, notFound } from 'next/navigation';
import { sessionService } from '@/lib/server/sessionService';
import { createServerClient } from '@/lib/supabase/server';
import { InteractivityJsonSchema, type InteractivityJson } from '@/types/lesson';
import { getNextLessonInModule } from '@/lib/data/enrollment';
import LessonRendererClient from '@/components/lessons/LessonRenderer';

interface LessonPageProps {
	params: { moduleId: string; lessonId: string };
}

/**
 * Server component page
 * Fetches lesson, user progress, and enforces sequential unlocking
 */
export default async function LessonPage({ params }: LessonPageProps) {
	const { moduleId, lessonId } = params;

	const currentUser = await sessionService.getCurrentUser();
	if (!currentUser) redirect('/auth');

	const allowedLessonId = await getNextLessonInModule(currentUser.userId, moduleId);
	if (allowedLessonId && allowedLessonId !== lessonId) {
		redirect(`/module/${moduleId}/lesson/${allowedLessonId}`);
	}

	const supabase = createServerClient();
	const { data: lessonData } = await supabase
		.from('lessons')
		.select(
			`
      id,
      title,
      description,
      order_index,
      interactivity_json,
      module:modules (id, name)
    `
		)
		.eq('id', lessonId)
		.eq('module_id', moduleId)
		.eq('published', true)
		.single();

	if (!lessonData) notFound();

	const lesson = lessonData as {
		id: string;
		title: string;
		description: string | null;
		order_index: number;
		interactivity_json: unknown;
		module?: { id: string; name: string } | null;
	};

	// Validate interactivity JSON
	let interactivityJson: InteractivityJson | null = null;
	if (lesson.interactivity_json) {
		const parsed = InteractivityJsonSchema.safeParse(lesson.interactivity_json);
		if (parsed.success) interactivityJson = parsed.data;
		else console.warn('Invalid interactivity_json', lesson.id, parsed.error);
	}

	// Load user progress
	const { data: progressData } = await supabase
		.from('user_progress')
		.select('mastery_percent, status, attempts, last_attempt_at, metadata')
		.eq('user_id', currentUser.userId)
		.eq('target_type', 'lesson')
		.eq('target_id', lessonId)
		.maybeSingle();

	const progress = progressData
		? {
				mastery_percent: progressData.mastery_percent ?? 0,
				status: progressData.status,
				attempts: progressData.attempts ?? 0,
				last_attempt_at: progressData.last_attempt_at,
				metadata: progressData.metadata as Record<string, unknown> | null,
			}
		: null;

	// Render client interactive component
	return (
		<div className="min-h-screen bg-gray-950 text-white">
			<header className="border-b border-gray-800 bg-gray-900">
				<div className="container mx-auto px-6 py-4">
					<nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
						<a href="/dashboard" className="hover:text-green-400 transition-colors">
							Dashboard
						</a>
						<span>/</span>
						<span className="text-white">{lesson.module?.name ?? 'Module'}</span>
						<span>/</span>
						<span className="text-green-400">Lesson {lesson.order_index + 1}</span>
					</nav>
					<h1 className="text-2xl font-bold">{lesson.title}</h1>
				</div>
			</header>

			<main className="container mx-auto px-6 py-8 max-w-5xl">
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
						{progress.status === 'completed' && (
							<div className="mt-2 text-sm text-green-400 flex items-center gap-2">
								<strong>Completed</strong>
							</div>
						)}
					</div>
				)}

				{lesson.description && (
					<div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-lg">
						<h2 className="text-lg font-semibold mb-2">What you&apos;ll learn</h2>
						<p className="text-gray-300">{lesson.description}</p>
					</div>
				)}

				{!interactivityJson ? (
					<div className="mb-8 p-8 bg-yellow-950 border border-yellow-800 rounded-lg">
						<h3 className="text-xl font-semibold text-yellow-300 mb-2">Lesson content unavailable</h3>
						<p className="text-gray-300 mb-2">
							The lesson&apos;s <code>interactivity_json</code> is missing or invalid.
						</p>
						<details className="text-sm text-gray-400 bg-gray-900/10 p-3 rounded">
							<summary className="cursor-pointer">Developer details (click to expand)</summary>
							<pre className="mt-2 overflow-auto text-xs">
								{JSON.stringify(lesson.interactivity_json ?? '(empty)', null, 2)}
							</pre>
						</details>
						<div className="mt-4">
							<a href="/dashboard" className="underline text-green-400">
								Return to dashboard
							</a>
						</div>
					</div>
				) : (
					<LessonRendererClient
						lessonId={lesson.id}
						currentModuleId={moduleId}
						interactivityJson={interactivityJson}
					/>
				)}
			</main>
		</div>
	);
}
