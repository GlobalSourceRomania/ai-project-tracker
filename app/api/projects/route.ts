import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, getProjectsByUserId, createProject, deleteProject, getCurrentUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let projects;
    if (user.role === 'viewer') {
      projects = await getProjectsByUserId(user.id);
    } else {
      projects = await getAllProjects();
    }

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { title, pipedriveCode, status } = body;

    if (!title || !pipedriveCode) {
      return NextResponse.json({ error: 'Title and pipedrive code required' }, { status: 400 });
    }

    const project = await createProject(title, pipedriveCode, user.id, status || 'planning');
    return NextResponse.json({ ok: true, project });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
