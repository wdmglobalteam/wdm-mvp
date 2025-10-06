'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PathWithHierarchy, Enrollment } from '@/types/supabase';

/**
 * DashboardShellProps
 * Props for rendering the full user dashboard with learning hierarchy.
 */
interface DashboardShellProps {
	hierarchy: PathWithHierarchy;
	enrollment: Enrollment;
	userId: string;
	/** Map of moduleId -> next allowed lessonId */
	allowedLessonByModule?: Record<string, string | null>;
}

/**
 * DashboardShell
 * Renders pillars, realms, modules with locked/unlocked states.
 * Provides Continue Learning shortcut.
 */
export default function DashboardShell({
	hierarchy,
	enrollment,
	userId,
	allowedLessonByModule = {},
}: DashboardShellProps) {
	const router = useRouter();
	const [selectedPillarId, setSelectedPillarId] = useState<string | null>(
		hierarchy.pillars[0]?.id ?? null
	);
	const [selectedRealmId, setSelectedRealmId] = useState<string | null>(null);

	/** Navigate to next available lesson across all modules */
	const handleContinueLearning = () => {
		for (const pillar of hierarchy.pillars) {
			for (const realm of pillar.realms) {
				for (const moduleItem of realm.modules) {
					const nextLessonId = allowedLessonByModule[moduleItem.id];
					if (nextLessonId) {
						router.push(`/module/${moduleItem.id}/lesson/${nextLessonId}`);
						return;
					}
				}
			}
		}
		router.push('/dashboard');
	};

	/** Handle module click with lock check */
	const handleModuleClick = (moduleId: string) => {
		const nextLessonId = allowedLessonByModule[moduleId];
		if (!nextLessonId) return; // locked
		router.push(`/module/${moduleId}/lesson/${nextLessonId}`);
	};

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Sidebar */}
			<aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
				<div className="p-6 border-b border-gray-800">
					<h2 className="text-xl font-bold">WDM</h2>
					<p className="text-sm text-gray-400 mt-1">PathMastery</p>
				</div>
				<nav className="flex-1 p-4 space-y-2">
					<a href="#" className="block px-4 py-2 rounded bg-gray-800 text-white">
						Dashboard
					</a>
					<a href="#" className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800">
						Profile
					</a>
					<a href="#" className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800">
						Settings
					</a>
					<a href="#" className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800">
						Help
					</a>
				</nav>
				<div className="p-4 border-t border-gray-800">
					<div className="text-xs text-gray-500">Logged in as</div>
					<div className="text-sm font-medium truncate">{userId.slice(0, 8)}...</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-y-auto">
				<div className="container mx-auto px-6 py-8 max-w-6xl">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold mb-2">{hierarchy.name}</h1>
						<p className="text-gray-400">{hierarchy.description}</p>
					</div>

					{/* Progress overview */}
					<div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
						<div className="flex items-center justify-between mb-4">
							<div>
								<div className="text-sm text-gray-500">Overall Progress</div>
								<div className="text-2xl font-bold">{enrollment.progress_percent}%</div>
							</div>
							<button
								onClick={handleContinueLearning}
								className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
							>
								Continue Learning →
							</button>
						</div>
						<div className="w-full bg-gray-800 rounded-full h-3">
							<div
								className="bg-green-600 h-3 rounded-full transition-all duration-300"
								style={{ width: `${enrollment.progress_percent}%` }}
							/>
						</div>
					</div>

					{/* Pillars list */}
					<div className="space-y-6">
						<h2 className="text-xl font-semibold">Learning Path</h2>
						{hierarchy.pillars.map((pillar) => {
							const isPillarSelected = selectedPillarId === pillar.id;
							return (
								<div
									key={pillar.id}
									className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
								>
									{/* Pillar header */}
									<button
										onClick={() => setSelectedPillarId(isPillarSelected ? null : pillar.id)}
										className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center text-green-500 font-semibold">
												{pillar.order_index}
											</div>
											<div className="text-left">
												<div className="font-semibold">{pillar.name}</div>
												<div className="text-sm text-gray-400">{pillar.realms.length} realms</div>
											</div>
										</div>
										<svg
											className={`w-5 h-5 transition-transform ${isPillarSelected ? 'rotate-180' : ''}`}
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
									</button>

									{/* Realms */}
									{isPillarSelected && (
										<div className="border-t border-gray-800 p-6 space-y-4">
											{pillar.realms.map((realm) => {
												const isRealmSelected = selectedRealmId === realm.id;
												return (
													<div key={realm.id} className="bg-gray-800 rounded-lg overflow-hidden">
														{/* Realm header */}
														<button
															onClick={() => setSelectedRealmId(isRealmSelected ? null : realm.id)}
															className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
														>
															<div className="text-left">
																<div className="font-medium">{realm.name}</div>
																<div className="text-xs text-gray-400">{realm.modules.length} modules</div>
															</div>
															<svg
																className={`w-4 h-4 transition-transform ${isRealmSelected ? 'rotate-180' : ''}`}
																fill="currentColor"
																viewBox="0 0 20 20"
															>
																<path
																	fillRule="evenodd"
																	d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
																	clipRule="evenodd"
																/>
															</svg>
														</button>

														{/* Modules */}
														{isRealmSelected && (
															<div className="border-t border-gray-700 p-4 space-y-2">
																{realm.modules.map((module) => {
																	const nextLessonId = allowedLessonByModule[module.id];
																	const isModuleLocked = !nextLessonId;
																	return (
																		<button
																			key={module.id}
																			disabled={isModuleLocked}
																			onClick={() => handleModuleClick(module.id)}
																			className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
																				isModuleLocked
																					? 'bg-gray-700 cursor-not-allowed'
																					: 'bg-gray-700 hover:bg-gray-600'
																			}`}
																		>
																			<div className="flex items-center justify-between">
																				<div>
																					<div className="font-medium">{module.name}</div>
																					<div className="text-xs text-gray-400 mt-1">
																						{module.lessons.length} lessons
																					</div>
																				</div>
																				{!isModuleLocked && (
																					<svg
																						className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors"
																						fill="none"
																						stroke="currentColor"
																						viewBox="0 0 24 24"
																					>
																						<path
																							strokeLinecap="round"
																							strokeLinejoin="round"
																							strokeWidth={2}
																							d="M9 5l7 7-7 7"
																						/>
																					</svg>
																				)}
																			</div>
																		</button>
																	);
																})}
															</div>
														)}
													</div>
												);
											})}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</main>
		</div>
	);
}
