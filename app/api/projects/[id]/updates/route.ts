import { NextRequest, NextResponse } from 'next/server';
import { getProjectUpdates, createProjectUpdate, deleteProjectUpdate, getProjectById, getCurrentUser, createChangeNotificationsForAll } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(id);
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updates = await getProjectUpdates(projectId);
    return NextResponse.json(updates);
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
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { whatDone, whatWaiting, nextSteps } = body;

    const update = await createProjectUpdate(projectId, user.id, whatDone, whatWaiting, nextSteps);

    // Notify all other users about new update
    const authorName = user.display_name || user.email;
    const snippet = (whatDone || whatWaiting || nextSteps || '').substring(0, 60);
    await createChangeNotificationsForAll(user.id, projectId, user.id, `${authorName} posted an update in "${project.title}"${snippet ? ': ' + snippet : ''}`);

    return NextResponse.json({ ok: true, update });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { updateId, whatDone, whatWaiting, nextSteps } = body;

    if (!updateId) return NextResponse.json({ error: 'Update ID required' }, { status: 400 });

    const sql = (await import('@/lib/db')).getDB();
    const result = await sql`
      UPDATE project_updates
      SET what_done = ${whatDone || null}, what_waiting = ${whatWaiting || null}, next_steps = ${nextSteps || null}
      WHERE id = ${updateId}
      RETURNING *
    `;
    return NextResponse.json({ ok: true, update: result[0] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);
    if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { updateId } = body;

    if (!updateId) return NextResponse.json({ error: 'Update ID required' }, { status: 400 });

    await deleteProjectUpdate(updateId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
