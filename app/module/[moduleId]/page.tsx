import { redirect } from 'next/navigation';
import { sessionService } from '@/lib/server/sessionService';
import { getNextLessonInModule } from '@/lib/data/enrollment';

interface ModulePageProps {
	params: { moduleId: string };
}

/**
 * Module entry page
 * Redirects users to next available lesson in module
 */
export default async function ModulePage({ params }: ModulePageProps) {
	const { moduleId } = params;

	const currentUser = await sessionService.getCurrentUser();
	if (!currentUser) redirect('/auth');

	const nextLessonId = await getNextLessonInModule(currentUser.userId, moduleId);

	if (!nextLessonId) {
		return (
			<div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">Module Not Available</h1>
					<p className="text-gray-400 mb-4">This module has no published lessons yet.</p>
					<a href="/dashboard" className="text-green-500 hover:text-green-400 underline">
						Back to Dashboard
					</a>
				</div>
			</div>
		);
	}

	redirect(`/module/${moduleId}/lesson/${nextLessonId}`);
}
