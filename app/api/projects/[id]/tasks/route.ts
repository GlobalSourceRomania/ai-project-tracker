import { NextRequest, NextResponse } from 'next/server';
import { getProjectTasks, createProjectTask, toggleProjectTask, deleteProjectTask, getProjectById, getCurrentUser, createChangeNotificationsForAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const projectId = parseInt(id);
    const project = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const tasks = await getProjectTasks(projectId);
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const projectId = parseInt(id);
    const project = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const body = await request.json();
    const { title } = body;
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const task = await createProjectTask(projectId, title.trim());

    // Notify all other users about new task
    const authorName = user.display_name || user.email;
    await createChangeNotificationsForAll(user.id, projectId, user.id, `${authorName} added task "${title.trim()}" in "${project.title}"`);

    return NextResponse.json({ ok: true, task });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await params;
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { taskId, isDone } = body;
    if (taskId === undefined) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    const task = await toggleProjectTask(taskId, isDone);
    return NextResponse.json({ ok: true, task });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await params;
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { taskId } = body;
    if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

    await deleteProjectTask(taskId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
