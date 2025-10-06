// --- filename: app/api/admin/lessons/route.ts ---

import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
type LessonUpdate = Database['public']['Tables']['lessons']['Update'];

async function checkAdminRole(
	supabase: ReturnType<typeof createRouteClient>,
	userId: string
): Promise<boolean> {
	const { data: profileData } = await supabase
		.from('profiles')
		.select('role')
		.eq('id', userId)
		.single();

	const profile = profileData as { role: string | null } | null;
	return profile?.role === 'admin';
}

export async function GET(request: Request) {
	try {
		const supabase = createRouteClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user || !(await checkAdminRole(supabase, user.id))) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const moduleId = searchParams.get('moduleId');

		let query = supabase
			.from('lessons')
			.select('*, module:modules(id, name)')
			.order('order_index', { ascending: true });

		if (moduleId) {
			query = query.eq('module_id', moduleId);
		}

		const { data, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ lessons: data });
	} catch (error) {
		console.error('Admin lessons GET error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		const supabase = createRouteClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user || !(await checkAdminRole(supabase, user.id))) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		const body = (await request.json()) as LessonInsert & { id?: string };

		const lessonData: LessonInsert = {
			module_id: body.module_id,
			title: body.title,
			description: body.description,
			order_index: body.order_index,
			published: body.published,
			required_mastery_percent: body.required_mastery_percent,
			interactivity_json: body.interactivity_json,
			grading_json: body.grading_json,
			json_schema_version: '1.0',
			created_by: user.id,
			updated_by: user.id,
			last_published_at: body.published ? new Date().toISOString() : null,
		};

		const { data: lesson, error } = await supabase
			.from('lessons')
			.insert(lessonData)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ lesson }, { status: 201 });
	} catch (error) {
		console.error('Admin lessons POST error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PATCH(request: Request) {
	try {
		const supabase = createRouteClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user || !(await checkAdminRole(supabase, user.id))) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		const body = (await request.json()) as LessonUpdate & { id: string };
		const { id, ...updateData } = body;

		const updatePayload: LessonUpdate = {
			...updateData,
			updated_by: user.id,
			last_published_at: updateData.published ? new Date().toISOString() : undefined,
		};

		const { data: lesson, error } = await supabase
			.from('lessons')
			.update(updatePayload)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ lesson });
	} catch (error) {
		console.error('Admin lessons PATCH error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		const supabase = createRouteClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user || !(await checkAdminRole(supabase, user.id))) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
		}

		const { error } = await supabase.from('lessons').delete().eq('id', id);

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Admin lessons DELETE error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
