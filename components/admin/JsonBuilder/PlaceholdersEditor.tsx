// --- filename: components/admin/JsonBuilder/PlaceholdersEditor.tsx ---

'use client';

import { useState } from 'react';
import type { Placeholder } from '@/types/lesson';

interface PlaceholdersEditorProps {
	placeholders: Placeholder[];
	onChange: (placeholders: Placeholder[]) => void;
}

export default function PlaceholdersEditor({ placeholders, onChange }: PlaceholdersEditorProps) {
	const [newId, setNewId] = useState('');
	const [newIndent, setNewIndent] = useState(0);

	const handleAdd = () => {
		if (!newId.trim()) return;

		onChange([
			...placeholders,
			{
				id: newId,
				slotIndex: placeholders.length,
				indentLevel: newIndent,
			},
		]);

		setNewId('');
		setNewIndent(0);
	};

	const handleRemove = (id: string) => {
		onChange(placeholders.filter((p) => p.id !== id));
	};

	const handleUpdate = (id: string, updates: Partial<Placeholder>) => {
		onChange(placeholders.map((p) => (p.id === id ? { ...p, ...updates } : p)));
	};

	return (
		<div className="space-y-4">
			{/* Existing placeholders */}
			{placeholders.map((placeholder) => (
				<div key={placeholder.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="font-mono text-sm">{placeholder.id}</span>
						<button
							onClick={() => handleRemove(placeholder.id)}
							className="text-red-400 hover:text-red-300 text-sm"
						>
							Remove
						</button>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs text-gray-400 mb-1">Slot Index</label>
							<input
								type="number"
								value={placeholder.slotIndex}
								onChange={(e) => handleUpdate(placeholder.id, { slotIndex: parseInt(e.target.value) })}
								className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
							/>
						</div>

						<div>
							<label className="block text-xs text-gray-400 mb-1">Indent Level</label>
							<input
								type="number"
								value={placeholder.indentLevel}
								onChange={(e) => handleUpdate(placeholder.id, { indentLevel: parseInt(e.target.value) })}
								className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm"
								min={0}
								max={10}
							/>
						</div>
					</div>
				</div>
			))}

			{/* Add new placeholder */}
			<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
				<h4 className="text-sm font-semibold mb-3">Add Placeholder</h4>

				<div className="space-y-3">
					<div>
						<label className="block text-xs text-gray-400 mb-1">ID</label>
						<input
							type="text"
							value={newId}
							onChange={(e) => setNewId(e.target.value)}
							placeholder="e.g., ph1"
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						/>
					</div>

					<div>
						<label className="block text-xs text-gray-400 mb-1">Indent Level</label>
						<input
							type="number"
							value={newIndent}
							onChange={(e) => setNewIndent(parseInt(e.target.value))}
							min={0}
							max={10}
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						/>
					</div>

					<button
						onClick={handleAdd}
						disabled={!newId.trim()}
						className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 py-2 rounded text-sm font-semibold"
					>
						Add Placeholder
					</button>
				</div>
			</div>
		</div>
	);
}
