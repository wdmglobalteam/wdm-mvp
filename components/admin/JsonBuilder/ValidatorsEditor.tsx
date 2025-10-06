// --- filename: components/admin/JsonBuilder/ValidatorsEditor.tsx ---

'use client';

import { useState } from 'react';
import type { Validator } from '@/types/grading';

interface ValidatorsEditorProps {
	validators: Validator[];
	placeholders: Array<{ id: string }>;
	onChange: (validators: Validator[]) => void;
}

export default function ValidatorsEditor({
	validators,
	placeholders,
	onChange,
}: ValidatorsEditorProps) {
	const [newTarget, setNewTarget] = useState('');
	const [newType, setNewType] = useState<'equals' | 'contains' | 'regex'>('equals');
	const [newExpected, setNewExpected] = useState('');
	const [newWeight, setNewWeight] = useState(0.5);

	const totalWeight = validators.reduce((sum, v) => sum + v.weight, 0);

	const handleAdd = () => {
		if (!newTarget || !newExpected) return;

		onChange([
			...validators,
			{
				id: `v${validators.length + 1}`,
				type: newType,
				target: newTarget,
				expected: newExpected.split(',').map((s) => s.trim()),
				weight: newWeight,
			},
		]);

		setNewTarget('');
		setNewExpected('');
		setNewWeight(0.5);
	};

	const handleRemove = (id: string) => {
		onChange(validators.filter((v) => v.id !== id));
	};

	const handleUpdate = (id: string, updates: Partial<Validator>) => {
		onChange(validators.map((v) => (v.id === id ? { ...v, ...updates } : v)));
	};

	return (
		<div className="space-y-4">
			{/* Weight warning */}
			<div
				className={`p-3 rounded-lg border ${
					Math.abs(totalWeight - 1.0) < 0.01
						? 'bg-green-950/30 border-green-700 text-green-300'
						: 'bg-yellow-950/30 border-yellow-700 text-yellow-300'
				}`}
			>
				Total Weight: {totalWeight.toFixed(2)}{' '}
				{Math.abs(totalWeight - 1.0) < 0.01 ? '✓' : '⚠ Should be 1.0'}
			</div>

			{/* Existing validators */}
			{validators.map((validator) => (
				<div key={validator.id} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
					<div className="flex items-center justify-between mb-3">
						<span className="font-mono text-sm">{validator.id}</span>
						<button
							onClick={() => handleRemove(validator.id)}
							className="text-red-400 hover:text-red-300 text-sm"
						>
							Remove
						</button>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-xs text-gray-400 mb-1">Target Placeholder</label>
							<select
								value={validator.target}
								onChange={(e) => handleUpdate(validator.id, { target: e.target.value })}
								className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
							>
								{placeholders.map((p) => (
									<option key={p.id} value={p.id}>
										{p.id}
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="block text-xs text-gray-400 mb-1">Type</label>
							<select
								value={validator.type}
								onChange={(e) => handleUpdate(validator.id, { type: e.target.value as Validator['type'] })}
								className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
							>
								<option value="equals">Equals</option>
								<option value="contains">Contains</option>
								<option value="regex">Regex</option>
							</select>
						</div>

						<div>
							<label className="block text-xs text-gray-400 mb-1">Expected (comma-separated)</label>
							<input
								type="text"
								value={validator.expected.join(', ')}
								onChange={(e) =>
									handleUpdate(validator.id, {
										expected: e.target.value.split(',').map((s) => s.trim()),
									})
								}
								className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
							/>
						</div>

						<div>
							<label className="block text-xs text-gray-400 mb-1">Weight</label>
							<input
								type="number"
								value={validator.weight}
								onChange={(e) => handleUpdate(validator.id, { weight: parseFloat(e.target.value) })}
								step={0.1}
								min={0}
								max={1}
								className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
							/>
						</div>
					</div>
				</div>
			))}

			{/* Add new validator */}
			<div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
				<h4 className="text-sm font-semibold mb-3">Add Validator</h4>

				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="block text-xs text-gray-400 mb-1">Target Placeholder</label>
						<select
							value={newTarget}
							onChange={(e) => setNewTarget(e.target.value)}
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						>
							<option value="">Select...</option>
							{placeholders.map((p) => (
								<option key={p.id} value={p.id}>
									{p.id}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-xs text-gray-400 mb-1">Type</label>
						<select
							value={newType}
							onChange={(e) => setNewType(e.target.value as Validator['type'])}
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						>
							<option value="equals">Equals</option>
							<option value="contains">Contains</option>
							<option value="regex">Regex</option>
						</select>
					</div>

					<div>
						<label className="block text-xs text-gray-400 mb-1">Expected Values (comma-separated)</label>
						<input
							type="text"
							value={newExpected}
							onChange={(e) => setNewExpected(e.target.value)}
							placeholder="e.g., <html>, html"
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						/>
					</div>

					<div>
						<label className="block text-xs text-gray-400 mb-1">Weight</label>
						<input
							type="number"
							value={newWeight}
							onChange={(e) => setNewWeight(parseFloat(e.target.value))}
							step={0.1}
							min={0}
							max={1}
							className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
						/>
					</div>
				</div>

				<button
					onClick={handleAdd}
					disabled={!newTarget || !newExpected}
					className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 py-2 rounded text-sm font-semibold"
				>
					Add Validator
				</button>
			</div>
		</div>
	);
}
