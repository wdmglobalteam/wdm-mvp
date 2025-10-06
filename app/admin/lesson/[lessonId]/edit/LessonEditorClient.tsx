// --- filename: app/admin/lesson/[lessonId]/edit/LessonEditorClient.tsx ---

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlaceholdersEditor from '@/components/admin/JsonBuilder/PlaceholdersEditor';
import DraggablesEditor from '@/components/admin/JsonBuilder/DraggablesEditor';
import ValidatorsEditor from '@/components/admin/JsonBuilder/ValidatorsEditor';
import PreviewRunner from '@/components/admin/PreviewRunner';
import type { InteractivityJson } from '@/types/lesson';
import type { GradingJson } from '@/types/grading';
import type { Database } from '@/types/supabase';

type LessonRow = Database['public']['Tables']['lessons']['Row'];

interface LessonEditorClientProps {
	lesson: LessonRow & {
		module?: {
			id: string;
			name: string;
		} | null;
	};
}

export default function LessonEditorClient({ lesson }: LessonEditorClientProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<'metadata' | 'interactivity' | 'grading' | 'preview'>(
		'metadata'
	);

	const [title, setTitle] = useState(lesson.title || '');
	const [description, setDescription] = useState(lesson.description || '');
	const [published, setPublished] = useState(lesson.published || false);
	const [interactivityJson, setInteractivityJson] = useState<InteractivityJson>(
		(lesson.interactivity_json as InteractivityJson) || {
			type: 'drag_drop',
			title: '',
			explanation: '',
			placeholders: [],
			draggables: [],
			uiHints: { maxColumns: 3, keyboardSupport: true, placeholderSize: 'medium' },
			tips: [],
		}
	);
	const [gradingJson, setGradingJson] = useState<GradingJson>(
		(lesson.grading_json as unknown as GradingJson) || {
			validators: [],
			scoring_rules: { normalizeWeights: true, precision: 2, pass_threshold: 98 },
			grading_json_version: '1.0',
		}
	);

	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const handleSave = async () => {
		setIsSaving(true);
		setSaveError(null);

		try {
			const response = await fetch('/api/admin/lessons', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: lesson.id,
					title,
					description,
					interactivity_json: interactivityJson,
					grading_json: gradingJson,
					published,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Save failed');
			}

			router.push('/admin');
			router.refresh();
		} catch (error) {
			setSaveError(error instanceof Error ? error.message : 'Unknown error');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-950 text-white">
			<div className="border-b border-gray-800 bg-gray-900">
				<div className="container mx-auto px-6 py-4 flex items-center justify-between">
					<h1 className="text-2xl font-bold">Edit Lesson</h1>
					<div className="flex items-center gap-4">
						<button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-white">
							Cancel
						</button>
						<button
							onClick={handleSave}
							disabled={isSaving}
							className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
						>
							{isSaving ? 'Saving...' : 'Save'}
						</button>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="border-b border-gray-800 bg-gray-900">
				<div className="container mx-auto px-6">
					<div className="flex gap-6">
						{['metadata', 'interactivity', 'grading', 'preview'].map((tab) => (
							<button
								key={tab}
								onClick={() => setActiveTab(tab as typeof activeTab)}
								className={`py-4 px-6 border-b-2 font-semibold transition-colors ${
									activeTab === tab
										? 'border-green-500 text-white'
										: 'border-transparent text-gray-400 hover:text-white'
								}`}
							>
								{tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Tab content */}
			<div className="container mx-auto px-6 py-8">
				{saveError && (
					<div className="mb-6 p-4 bg-red-950/50 border border-red-700 rounded-lg text-red-200">
						Error: {saveError}
					</div>
				)}

				{activeTab === 'metadata' && (
					<div className="max-w-2xl space-y-6">
						<div>
							<label className="block text-sm font-medium mb-2">Title</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
								placeholder="e.g., Understanding HTML Tags"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Description</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
								placeholder="Lesson description..."
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">Explanation (HTML/Markdown)</label>
							<textarea
								value={interactivityJson.explanation}
								onChange={(e) =>
									setInteractivityJson({
										...interactivityJson,
										explanation: e.target.value,
									})
								}
								rows={6}
								className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none font-mono text-sm"
								placeholder="<p>Drag the correct HTML tags...</p>"
							/>
						</div>

						<div>
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={published}
									onChange={(e) => setPublished(e.target.checked)}
									className="w-5 h-5"
								/>
								<span className="font-medium">Published (visible to students)</span>
							</label>
						</div>
					</div>
				)}

				{activeTab === 'interactivity' && (
					<div className="grid grid-cols-2 gap-8">
						<div>
							<h3 className="text-lg font-semibold mb-4">Placeholders (Drop Zones)</h3>
							<PlaceholdersEditor
								placeholders={interactivityJson.placeholders}
								onChange={(placeholders) =>
									setInteractivityJson({
										...interactivityJson,
										placeholders,
									})
								}
							/>
						</div>

						<div>
							<h3 className="text-lg font-semibold mb-4">Draggables (Items)</h3>
							<DraggablesEditor
								draggables={interactivityJson.draggables}
								onChange={(draggables) =>
									setInteractivityJson({
										...interactivityJson,
										draggables,
									})
								}
							/>
						</div>
					</div>
				)}

				{activeTab === 'grading' && (
					<div>
						<h3 className="text-lg font-semibold mb-4">Grading Rules</h3>
						<ValidatorsEditor
							validators={gradingJson.validators}
							placeholders={interactivityJson.placeholders}
							onChange={(validators) =>
								setGradingJson({
									...gradingJson,
									validators,
								})
							}
						/>
					</div>
				)}

				{activeTab === 'preview' && (
					<PreviewRunner interactivityJson={interactivityJson} gradingJson={gradingJson} />
				)}
			</div>
		</div>
	);
}
