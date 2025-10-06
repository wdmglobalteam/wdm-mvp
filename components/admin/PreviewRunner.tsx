// --- filename: components/admin/PreviewRunner.tsx ---

'use client';

import { useState } from 'react';
import LessonRenderer from '@/components/lessons/LessonRenderer';
import type { InteractivityJson } from '@/types/lesson';
import type { GradingJson } from '@/types/grading';

interface PreviewRunnerProps {
	interactivityJson: InteractivityJson;
	gradingJson: GradingJson;
}

export default function PreviewRunner({ interactivityJson }: PreviewRunnerProps) {
	const [testMode, setTestMode] = useState(false);

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h3 className="text-lg font-semibold">Preview</h3>
				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={testMode}
							onChange={(e) => setTestMode(e.target.checked)}
							className="w-4 h-4"
						/>
						Test scoring (calls preview API)
					</label>
				</div>
			</div>

			<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
				<div className="bg-gray-950 rounded-lg p-4">
					{/* Render the actual lesson component */}
					<LessonRenderer lessonId="preview" interactivityJson={interactivityJson} />
				</div>
			</div>

			<div className="mt-6 p-4 bg-blue-950/30 border border-blue-700 rounded-lg text-sm text-blue-200">
				<strong>Preview Mode:</strong> This shows exactly what students will see. In preview mode,
				scoring is simulated and doesn&apos;t affect real progress.
			</div>
		</div>
	);
}
