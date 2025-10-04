'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PathWithHierarchy } from '@/types/supabase';

interface EnrollmentCardProps {
  hierarchy: PathWithHierarchy;
  userId: string;
}

/**
 * Client component that handles the enrollment action
 * Shows path preview and "Enroll" button
 */
export default function EnrollmentCard({ hierarchy, userId }: EnrollmentCardProps) {
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    setError(null);

    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pathId: hierarchy.id,
          userId 
        }),
      });

      if (!response.ok) {
        throw new Error('Enrollment failed');
      }

      // CRITICAL: router.refresh() tells Next.js to re-run the server component
      // This fetches fresh data and re-renders with the dashboard UI
      // No client-side navigation = no flash
      router.refresh();
    } catch (err) {
      setError('Failed to enroll. Please try again.');
      setIsEnrolling(false);
    }
  };

  // Count total modules and lessons for preview
  const totalPillars = hierarchy.pillars.length;
  const totalModules = hierarchy.pillars.reduce(
    (sum, pillar) => sum + pillar.realms.reduce((s, realm) => s + realm.modules.length, 0),
    0
  );
  const totalLessons = hierarchy.pillars.reduce(
    (sum, pillar) => sum + pillar.realms.reduce(
      (s, realm) => s + realm.modules.reduce((m, mod) => m + mod.lessons.length, 0),
      0
    ),
    0
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Welcome to WDM PathMastery</h1>
        <p className="text-gray-400 text-lg">Begin your mastery journey in web development</p>
      </div>

      {/* Main enrollment card */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-xl">
        {/* Journey header */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 uppercase tracking-wide mb-1">Journey</div>
          <div className="text-2xl font-semibold">Web Development</div>
        </div>

        {/* Path selection */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 uppercase tracking-wide mb-3">Select Your Path</div>
          
          {/* Active path - Frontend Development */}
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-950/20 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-green-400">{hierarchy.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{hierarchy.description}</p>
              </div>
              <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                Available
              </div>
            </div>
            
            {/* Path stats */}
            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="text-gray-500">Pillars:</span>
                <span className="ml-2 font-semibold">{totalPillars}</span>
              </div>
              <div>
                <span className="text-gray-500">Modules:</span>
                <span className="ml-2 font-semibold">{totalModules}</span>
              </div>
              <div>
                <span className="text-gray-500">Lessons:</span>
                <span className="ml-2 font-semibold">{totalLessons}</span>
              </div>
            </div>
          </div>

          {/* Other paths - Coming soon */}
          <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50 opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-300">Backend Development</h3>
                <p className="text-gray-500 text-sm mt-1">Server-side mastery path</p>
              </div>
              <div className="bg-gray-600 text-gray-300 text-xs px-3 py-1 rounded-full">
                Coming Soon
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum preview */}
        <div className="mb-8">
          <div className="text-sm text-gray-500 uppercase tracking-wide mb-3">What You&apos;ll Master</div>
          <div className="space-y-2">
            {hierarchy.pillars.slice(0, 3).map((pillar) => (
              <div key={pillar.id} className="flex items-center text-sm">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{pillar.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Enroll button */}
        <button
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors text-lg"
        >
          {isEnrolling ? 'Enrolling...' : `Enroll in ${hierarchy.name}`}
        </button>

        <p className="text-center text-gray-500 text-sm mt-4">
          Once enrolled, your path is locked. Mastery requires commitment.
        </p>
      </div>
    </div>
  );
}