// --- filename: app/admin/lesson/[lessonId]/edit/page.tsx ---

import { createServerClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import LessonEditorClient from './LessonEditorClient';
import type { Database } from '@/types/supabase';
import { sessionService } from '@/lib/server/sessionService';

type LessonRow = Database['public']['Tables']['lessons']['Row'];

export default async function LessonEditPage({ params }: { params: { lessonId: string } }) {
	// Use server session instead of supabase auth
	const currentUser = await sessionService.getCurrentUser();
	if (!currentUser) {
		redirect('/auth'); // Fixed redirect path
	}

	const supabase = createServerClient();

	const { data: profileData } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', currentUser.userId)
		.single();

	const profile = profileData as { role: string | null } | null;

	if (profile?.role !== 'admin') {
		redirect('/dashboard');
	}

	// Fetch lesson
	const { data: lessonData, error } = await supabase
		.from('lessons')
		.select('*, module:modules(id, name)')
		.eq('id', params.lessonId)
		.single();

	if (error || !lessonData) {
		notFound();
	}

	const lesson = lessonData as LessonRow & {
		module: {
			id: string;
			name: string;
		} | null;
	};

	return <LessonEditorClient lesson={lesson} />;
}
