// --- filename: components/lessons/LessonRenderer.tsx ---

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	DndContext,
	DragEndEvent,
	useSensor,
	useSensors,
	PointerSensor,
	KeyboardSensor,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { InteractivityJson, Draggable, Placeholder } from '@/types/lesson';
import type { Arrangement } from '@/types/grading';
import Celebration from './Celebration';

interface LessonRendererProps {
	lessonId: string;
	currentModuleId?: string; // passed from server page so we can build next lesson route
	interactivityJson: InteractivityJson;
}

function DraggableItem({ draggable, isPlaced }: { draggable: Draggable; isPlaced: boolean }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: draggable.id,
		disabled: isPlaced,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : isPlaced ? 0.3 : 1,
		cursor: isPlaced ? 'not-allowed' : 'grab',
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className="px-4 py-2 bg-gray-800 border border-gray-700 rounded hover:border-green-500 transition-colors"
		>
			<code className="text-sm font-mono">{draggable.label}</code>
		</div>
	);
}

function DroppablePlaceholder({
	placeholder,
	placedItem,
}: {
	placeholder: Placeholder;
	placedItem?: Draggable;
}) {
	const { setNodeRef, isOver } = useDroppable({ id: placeholder.id });
	const indentStyle = { paddingLeft: `${placeholder.indentLevel * 24}px` };

	return (
		<div
			ref={setNodeRef}
			style={indentStyle}
			className={`min-h-[48px] px-4 py-2 border-2 border-dashed rounded flex items-center font-mono text-sm ${
				isOver ? 'border-green-500 bg-green-950/20' : 'border-gray-700'
			} ${placedItem ? 'bg-gray-800 border-solid' : 'bg-gray-900/50'}`}
		>
			{placedItem ? (
				<code>{placedItem.label}</code>
			) : (
				<span className="text-gray-500">Drop here...</span>
			)}
		</div>
	);
}

export default function LessonRenderer({
	lessonId,
	currentModuleId,
	interactivityJson,
}: LessonRendererProps) {
	const router = useRouter();
	const [arrangement, setArrangement] = useState<Arrangement>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [result, setResult] = useState<{
		passed: boolean;
		mastery_percent: number;
		attempts: number;
		nextTarget?: { type: string; id: string; moduleId?: string };
	} | null>(null);
	const [showCelebration, setShowCelebration] = useState(false);
	const [showTips, setShowTips] = useState(false);
	const [hasChanged, setHasChanged] = useState(false);

	const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
	const placedDraggableIds = new Set(arrangement.map((a) => a.draggableId));

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		const draggableId = String(active.id);
		const placeholderId = String(over.id);

		// Ensure single placement per draggable
		const newArrangement = arrangement.filter((a) => a.draggableId !== draggableId);

		const draggable = interactivityJson.draggables.find((d) => d.id === draggableId);
		if (draggable) {
			newArrangement.push({
				placeholderId,
				draggableId,
				payload: draggable.payload,
			});
		}

		setArrangement(newArrangement);
		setHasChanged(true);
	};

	const handleCheck = async () => {
		setIsChecking(true);
		try {
			const res = await fetch('/api/lesson/check', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId, arrangement }),
			});

			const data = await res.json();

			if (!res.ok) throw new Error(data.error || 'Check failed');

			// server returns mastery_percent, passed, attempts, nextTarget (optional)
			setResult(data);
			if (data.passed) {
				// show celebration then enable continue button
				setShowCelebration(true);
			} else {
				if (data.attempts >= 2) setShowTips(true);
			}
		} catch (err) {
			console.error('Check error', err);
			alert('Failed to check answers — try again.');
		} finally {
			setIsChecking(false);
		}
	};

	// navigate to next lesson (called from UI or Celebration)
	const handleNext = () => {
		if (!result?.nextTarget) {
			router.push('/dashboard');
			return;
		}

		const nt = result.nextTarget;

		// If server gave us a lesson id but not module, prefer server-provided moduleId, otherwise use currentModuleId
		if (nt.type === 'lesson') {
			const moduleToUse = nt.moduleId ?? currentModuleId;
			if (!moduleToUse) {
				// fallback
				router.push('/dashboard');
				return;
			}
			router.push(`/module/${moduleToUse}/lesson/${nt.id}`);
			return;
		}

		// other types (module / realm / pillar) fallback to dashboard for now
		router.push('/dashboard');
	};

	const handleTryAgain = () => {
		setResult(null);
		setShowCelebration(false);
	};

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-lg">
				<h2 className="text-2xl font-bold mb-3">{interactivityJson.title}</h2>
				<div
					className="text-gray-300 prose prose-invert"
					dangerouslySetInnerHTML={{ __html: interactivityJson.explanation }}
				/>
			</div>

			<DndContext sensors={sensors} onDragEnd={handleDragEnd}>
				<div className="mb-8 p-6 bg-gray-950 border border-gray-800 rounded-lg font-mono text-sm">
					<div className="space-y-2">
						{interactivityJson.placeholders
							.slice()
							.sort((a, b) => a.slotIndex - b.slotIndex)
							.map((placeholder) => {
								const placedItem = arrangement.find((a) => a.placeholderId === placeholder.id);
								const draggable = placedItem
									? interactivityJson.draggables.find((d) => d.id === placedItem.draggableId)
									: undefined;

								return (
									<DroppablePlaceholder
										key={placeholder.id}
										placeholder={placeholder}
										placedItem={draggable}
									/>
								);
							})}
					</div>
				</div>

				<div className="mb-8">
					<h3 className="text-lg font-semibold mb-3">Drag items from here:</h3>
					<div className="grid grid-cols-3 gap-3">
						{interactivityJson.draggables.map((draggable) => (
							<DraggableItem
								key={draggable.id}
								draggable={draggable}
								isPlaced={placedDraggableIds.has(draggable.id)}
							/>
						))}
					</div>
				</div>
			</DndContext>

			{showTips && interactivityJson.tips.length > 0 && (
				<div className="mb-8 p-4 bg-blue-950/50 border border-blue-800 rounded-lg">
					<button onClick={() => setShowTips(!showTips)} className="text-blue-400 font-semibold mb-2">
						💡 Show Hints
					</button>
					<ul className="list-disc list-inside space-y-1 text-gray-300">
						{interactivityJson.tips.map((tip, i) => (
							<li key={i}>{tip}</li>
						))}
					</ul>
				</div>
			)}

			{result && !showCelebration && (
				<div
					className={`mb-8 p-6 rounded-lg border-2 ${
						result.passed ? 'bg-green-950/50 border-green-700' : 'bg-red-950/50 border-red-700'
					}`}
				>
					<h3 className="text-xl font-bold mb-2">{result.passed ? '✓ Passed!' : '✗ Not quite...'}</h3>
					<p className="text-lg">Score: {result.mastery_percent}%</p>
					<p className="text-sm text-gray-400">Attempts: {result.attempts}</p>
				</div>
			)}

			<div className="flex gap-4">
				{!result && (
					<button
						onClick={handleCheck}
						disabled={!hasChanged || isChecking || arrangement.length === 0}
						className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors"
					>
						{isChecking ? 'Checking...' : 'Check Answers'}
					</button>
				)}

				{result && !result.passed && (
					<button
						onClick={handleTryAgain}
						className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg transition-colors"
					>
						Try Again
					</button>
				)}

				{result && result.passed && !showCelebration && (
					<button
						onClick={handleNext}
						className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-lg transition-colors"
					>
						Continue →
					</button>
				)}
			</div>

			{showCelebration && result?.passed && (
				<Celebration
					variant="success"
					onComplete={() => setShowCelebration(false)}
					onNext={handleNext}
				/>
			)}
		</div>
	);
}
