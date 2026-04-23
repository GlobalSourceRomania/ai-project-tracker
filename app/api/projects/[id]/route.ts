import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject, getCurrentUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const title = body.title !== undefined ? body.title : project.title;
    const status = body.status !== undefined ? body.status : project.status;
    const description = body.description !== undefined ? body.description : project.description ?? null;
    const bottleneck = body.bottleneck !== undefined ? body.bottleneck : project.bottleneck ?? null;

    const updated = await updateProject(projectId, title, status, description, bottleneck);

    // Send push notification asynchronously (don't block response)
    fetch(`${request.nextUrl.protocol}//${request.nextUrl.host}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') || '' },
      body: JSON.stringify({
        projectId,
        action: 'updated',
        projectName: title,
        changedBy: user.display_name || user.email,
      }),
    }).catch(() => {});

    return NextResponse.json({ ok: true, ...updated });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await deleteProject(projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
