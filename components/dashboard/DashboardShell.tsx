'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PathWithHierarchy, Enrollment } from '@/types/supabase';

interface DashboardShellProps {
  hierarchy: PathWithHierarchy;
  enrollment: Enrollment;
  userId: string;
}

/**
 * Main dashboard component for enrolled users
 * Handles in-page navigation between pillars/realms/modules
 * All data is passed from server - no fetching needed
 */
export default function DashboardShell({ hierarchy, enrollment, userId }: DashboardShellProps) {
  const router = useRouter();
  
  // Local state for which pillar/realm is currently viewed
  const [selectedPillarId, setSelectedPillarId] = useState<string | null>(
    hierarchy.pillars[0]?.id ?? null
  );
  const [selectedRealmId, setSelectedRealmId] = useState<string | null>(null);

  const selectedPillar = hierarchy.pillars.find(p => p.id === selectedPillarId);
  const selectedRealm = selectedPillar?.realms.find(r => r.id === selectedRealmId);

  const handleContinueLearning = () => {
    // Find the first incomplete module/lesson
    // For MVP, we'll just navigate to the first module of the first realm
    const firstPillar = hierarchy.pillars[0];
    const firstRealm = firstPillar?.realms[0];
    const firstModule = firstRealm?.modules[0];
    
    if (firstModule) {
      router.push(`/module/${firstModule.id}`);
    }
  };

  const handleModuleClick = (moduleId: string) => {
    router.push(`/module/${moduleId}`);
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
            
            {/* Progress bar */}
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
            
            {hierarchy.pillars.map((pillar) => (
              <div key={pillar.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                {/* Pillar header */}
                <button
                  onClick={() => setSelectedPillarId(
                    selectedPillarId === pillar.id ? null : pillar.id
                  )}
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
                    className={`w-5 h-5 transition-transform ${selectedPillarId === pillar.id ? 'rotate-180' : ''}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Realms (shown when pillar is expanded) */}
                {selectedPillarId === pillar.id && (
                  <div className="border-t border-gray-800 p-6 space-y-4">
                    {pillar.realms.map((realm) => (
                      <div key={realm.id} className="bg-gray-800 rounded-lg overflow-hidden">
                        {/* Realm header */}
                        <button
                          onClick={() => setSelectedRealmId(
                            selectedRealmId === realm.id ? null : realm.id
                          )}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition-colors"
                        >
                          <div className="text-left">
                            <div className="font-medium">{realm.name}</div>
                            <div className="text-xs text-gray-400">{realm.modules.length} modules</div>
                          </div>
                          <svg 
                            className={`w-4 h-4 transition-transform ${selectedRealmId === realm.id ? 'rotate-180' : ''}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>

                        {/* Modules (shown when realm is expanded) */}
                        {selectedRealmId === realm.id && (
                          <div className="border-t border-gray-700 p-4 space-y-2">
                            {realm.modules.map((module) => (
                              <button
                                key={module.id}
                                onClick={() => handleModuleClick(module.id)}
                                className="w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium group-hover:text-green-400 transition-colors">
                                      {module.name}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {module.lessons.length} lessons
                                    </div>
                                  </div>
                                  <svg 
                                    className="w-4 h-4 text-gray-400 group-hover:text-green-400 transition-colors" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}