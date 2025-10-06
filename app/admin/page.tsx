// --- filename: app/admin/page.tsx ---

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { PathWithHierarchyAdmin } from '@/types/supabase-helpers';
import { sessionService } from '@/lib/server/sessionService';

export default async function AdminDashboard() {
	// Use server session instead of supabase auth
	const currentUser = await sessionService.getCurrentUser();
	if (!currentUser) {
		redirect('/auth'); // Fixed redirect path
	}

	const supabase = createServerClient();

	const { data: profileData, error } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', currentUser.userId)
		.single();

	console.log(profileData, error);

	// const profile = profileData as { role: string | null } | null;

	// if (profile?.role !== 'admin') {
	// 	redirect('/dashboard');
	// }

	// Fetch full hierarchy
	const { data: pathsData } = await supabase
		.from('paths')
		.select(
			`
      id, name, published, order_index,
      pillars (
        id, name, published, order_index,
        realms (
          id, name, published, order_index,
          modules (
            id, name, published, order_index,
            lessons (id, title, published, order_index)
          )
        )
      )
    `
		)
		.order('order_index');

	const paths = pathsData as PathWithHierarchyAdmin[] | null;

	return (
		<div className="min-h-screen bg-gray-950 text-white p-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<h1 className="text-3xl font-bold">WDM Admin Panel</h1>
					<Link href="/dashboard" className="text-green-400 hover:text-green-300">
						← Back to Dashboard
					</Link>
				</div>

				{/* Quick stats */}
				<div className="grid grid-cols-4 gap-4 mb-8">
					<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
						<div className="text-3xl font-bold text-green-500">
							{paths?.reduce(
								(sum, p) =>
									sum +
									p.pillars.reduce(
										(s, pi) =>
											s +
											pi.realms.reduce(
												(r, re) => r + re.modules.reduce((m, mo) => m + mo.lessons.length, 0),
												0
											),
										0
									),
								0
							) || 0}
						</div>
						<div className="text-gray-400 text-sm">Total Lessons</div>
					</div>
					<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
						<div className="text-3xl font-bold text-blue-500">
							{paths?.reduce(
								(sum, p) =>
									sum +
									p.pillars.reduce((s, pi) => s + pi.realms.reduce((r, re) => r + re.modules.length, 0), 0),
								0
							) || 0}
						</div>
						<div className="text-gray-400 text-sm">Total Modules</div>
					</div>
					<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
						<div className="text-3xl font-bold text-purple-500">
							{paths?.reduce((sum, p) => sum + p.pillars.length, 0) || 0}
						</div>
						<div className="text-gray-400 text-sm">Total Pillars</div>
					</div>
					<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
						<div className="text-3xl font-bold text-orange-500">{paths?.length || 0}</div>
						<div className="text-gray-400 text-sm">Total Paths</div>
					</div>
				</div>

				{/* Content tree */}
				<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Content Hierarchy</h2>

					{paths?.map((path) => (
						<details key={path.id} className="mb-4" open>
							<summary className="cursor-pointer hover:text-green-400 font-semibold flex items-center gap-2">
								<span
									className={`w-2 h-2 rounded-full ${path.published ? 'bg-green-500' : 'bg-gray-600'}`}
								/>
								{path.name}
								<span className="text-xs text-gray-500">({path.pillars.length} pillars)</span>
							</summary>

							<div className="ml-6 mt-2 space-y-2">
								{path.pillars.map((pillar) => (
									<details key={pillar.id} className="mb-2">
										<summary className="cursor-pointer hover:text-green-400 flex items-center gap-2">
											<span
												className={`w-2 h-2 rounded-full ${pillar.published ? 'bg-green-500' : 'bg-gray-600'}`}
											/>
											{pillar.name}
											<span className="text-xs text-gray-500">({pillar.realms.length} realms)</span>
										</summary>

										<div className="ml-6 mt-2 space-y-2">
											{pillar.realms.map((realm) => (
												<details key={realm.id} className="mb-2">
													<summary className="cursor-pointer hover:text-green-400 flex items-center gap-2">
														<span
															className={`w-2 h-2 rounded-full ${realm.published ? 'bg-green-500' : 'bg-gray-600'}`}
														/>
														{realm.name}
														<span className="text-xs text-gray-500">({realm.modules.length} modules)</span>
													</summary>

													<div className="ml-6 mt-2 space-y-2">
														{realm.modules.map((module) => (
															<details key={module.id} className="mb-2">
																<summary className="cursor-pointer hover:text-green-400 flex items-center gap-2">
																	<span
																		className={`w-2 h-2 rounded-full ${module.published ? 'bg-green-500' : 'bg-gray-600'}`}
																	/>
																	{module.name}
																	<span className="text-xs text-gray-500">({module.lessons.length} lessons)</span>
																</summary>

																<div className="ml-6 mt-2 space-y-1">
																	{module.lessons.map((lesson) => (
																		<div
																			key={lesson.id}
																			className="flex items-center justify-between py-1 px-2 hover:bg-gray-800 rounded"
																		>
																			<div className="flex items-center gap-2">
																				<span
																					className={`w-2 h-2 rounded-full ${lesson.published ? 'bg-green-500' : 'bg-gray-600'}`}
																				/>
																				<span className="text-sm">{lesson.title}</span>
																			</div>
																			<Link
																				href={`/admin/lesson/${lesson.id}/edit`}
																				className="text-xs text-blue-400 hover:text-blue-300"
																			>
																				Edit →
																			</Link>
																		</div>
																	))}

																	<Link
																		href={`/admin/lesson/new?moduleId=${module.id}`}
																		className="block text-xs text-green-400 hover:text-green-300 py-1 px-2"
																	>
																		+ Add Lesson
																	</Link>
																</div>
															</details>
														))}
													</div>
												</details>
											))}
										</div>
									</details>
								))}
							</div>
						</details>
					))}
				</div>
			</div>
		</div>
	);
}
