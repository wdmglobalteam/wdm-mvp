import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';
import EnrollmentCard from '@/components/dashboard/EnrollmentCard';
import type { PathWithHierarchy } from '@/types/supabase';
import { sessionService } from '@/lib/server/sessionService';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getNextLessonInModule } from '@/lib/data/enrollment';

export default async function DashboardPage() {
	const user = await sessionService.getCurrentUser();
	if (!user) redirect('/auth');

	const supabase = getSupabaseAdmin();

	const { data: profile } = await supabase
		.from('profiles')
		.select('registration_completed, payment_status')
		.eq('id', user.userId)
		.single();

	if (!profile?.registration_completed) redirect('/onboarding');
	if (profile?.payment_status !== 'paid') redirect('/paywall');

	const { data: enrollment } = await supabase
		.from('enrollments')
		.select('*')
		.eq('user_id', user.userId)
		.single();

	const { data: path } = await supabase
		.from('paths')
		.select(
			`
      id,
      name,
      slug,
      description,
      pillars (
        id,
        name,
        order_index,
        realms (
          id,
          name,
          order_index,
          modules (
            id,
            name,
            order_index,
            lessons (
              id,
              title,
              order_index,
              published
            )
          )
        )
      )
    `
		)
		.eq('slug', 'frontend-development')
		.eq('published', true)
		.single<PathWithHierarchy>();

	if (!path) {
		return (
			<div className="flex items-center justify-center min-h-screen text-red-600">
				<h1>Error Loading Learning Path</h1>
			</div>
		);
	}

	// Compute allowedLessonByModule
	const modulesList: { id: string }[] = [];
	for (const pillar of path.pillars || []) {
		for (const realm of pillar.realms || []) {
			for (const moduleItem of realm.modules || []) {
				modulesList.push({ id: moduleItem.id });
			}
		}
	}

	const allowedPairs = await Promise.all(
		modulesList.map(async (m) => {
			try {
				const next = await getNextLessonInModule(user.userId, m.id);
				return { moduleId: m.id, nextLessonId: next ?? null };
			} catch {
				return { moduleId: m.id, nextLessonId: null };
			}
		})
	);

	const allowedLessonByModule: Record<string, string | null> = {};
	allowedPairs.forEach((p) => (allowedLessonByModule[p.moduleId] = p.nextLessonId));

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
		<DashboardShell
			hierarchy={path}
			enrollment={enrollment}
			userId={user.userId}
			allowedLessonByModule={allowedLessonByModule}
		/>
	);
}
