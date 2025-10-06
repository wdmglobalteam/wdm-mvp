// --- filename: components/admin/JsonBuilder/DraggablesEditor.tsx ---

'use client';

import { useState } from 'react';
import type { Draggable } from '@/types/lesson';

interface DraggablesEditorProps {
	draggables: Draggable[];
	onChange: (draggables: Draggable[]) => void;
}

export default function DraggablesEditor({ draggables, onChange }: DraggablesEditorProps) {
	const [newId, setNewId] = useState('');
	const [newLabel, setNewLabel] = useState('');
	const [newPayload, setNewPayload] = useState('');

	const handleAdd = () => {
		if (!newId.trim() || !newLabel.trim() || !newPayload.trim()) return;

		onChange([
			...draggables,
			{
				id: newId,
				label: newLabel,
				payload: newPayload,
			},
		]);

		setNewId('');
		setNewLabel('');
		setNewPayload('');
	};

	const handleRemove = (id: string) => {
		onChange(draggables.filter((d) => d.id !== id));
	};

	const handleUpdate = (id: string, updates: Partial<Draggable>) => {
		onChange(draggables.map((d) => (d.id === id ? { ...d, ...updates } : d)));
	};

	return (
		<div className="space-y-4">
			{/* Existing draggables */}
			{draggables.map((draggable) => (
				<div key={draggable.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="font-mono text-sm">{draggable.id}</span>
						<button
							onClick={() => handleRemove(draggable.id)}
							className="text-red-400 hover:text-red-300 text-sm"
						>
							Remove
						</button>
					</div>

					<div className="space-y-3">
						<div>
							<label className="block text-xs text-gray-400 mb-1">Label (what user sees)</label>
							<input
								type="text"
								value={draggable.label}
								onChange={(e) => handleUpdate(draggable.id, { label: e.target.value })}
								className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
							/>
						</div>

						<div>
							<label className="block text-xs text-gray-400 mb-1">Payload (correct answer)</label>
							<input
								type="text"
								value={draggable.payload}
								onChange={(e) => handleUpdate(draggable.id, { payload: e.target.value })}
								className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
							/>
						</div>
					</div>
				</div>
			))}

			{/* Add new draggable */}
			<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
				<h4 className="text-sm font-semibold mb-3">Add Draggable</h4>

				<div className="space-y-3">
					<div>
						<label className="block text-xs text-gray-400 mb-1">ID</label>
						<input
							type="text"
							value={newId}
							onChange={(e) => setNewId(e.target.value)}
							placeholder="e.g., d1"
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						/>
					</div>

					<div>
						<label className="block text-xs text-gray-400 mb-1">Label</label>
						<input
							type="text"
							value={newLabel}
							onChange={(e) => setNewLabel(e.target.value)}
							placeholder="e.g., <html>"
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						/>
					</div>

					<div>
						<label className="block text-xs text-gray-400 mb-1">Payload</label>
						<input
							type="text"
							value={newPayload}
							onChange={(e) => setNewPayload(e.target.value)}
							placeholder="e.g., <html>"
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						/>
					</div>

					<button
						onClick={handleAdd}
						disabled={!newId.trim() || !newLabel.trim() || !newPayload.trim()}
						className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 py-2 rounded text-sm font-semibold"
					>
						Add Draggable
					</button>
				</div>
			</div>
		</div>
	);
}
