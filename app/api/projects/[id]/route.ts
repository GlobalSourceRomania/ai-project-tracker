import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject, getCurrentUser, createChangeNotificationsForAll } from '@/lib/db';
import { sendPushToAllExcept } from '@/lib/push';

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

    // Handle pipedrive_code update
    let pipedriveCode = body.pipedriveCode !== undefined ? body.pipedriveCode : project.pipedrive_code;

    // Determine if pipedrive_code is required based on status
    const statusesRequiringCode = ['in_progress', 'bottleneck', 'completed'];
    const isCodeRequired = statusesRequiringCode.includes(status);

    // Validate pipedrive_code requirement
    if (isCodeRequired && !pipedriveCode?.trim()) {
      return NextResponse.json(
        { error: `Pipedrive code is required for status "${status}"` },
        { status: 400 }
      );
    }

    // Normalize pipedrive code if provided
    if (pipedriveCode?.trim()) {
      pipedriveCode = '#' + String(pipedriveCode).replace(/^#+/, '').trim();
    } else {
      pipedriveCode = null;
    }

    // Update project with pipedrive code
    const { getDB } = await import('@/lib/db');
    const sql = getDB();
    const result = await sql`
      UPDATE projects
      SET title = ${title.trim()},
          status = ${status},
          description = ${description},
          bottleneck = ${bottleneck},
          pipedrive_code = ${pipedriveCode},
          updated_at = NOW()
      WHERE id = ${projectId}
      RETURNING *
    `;

    const updated = result[0];

    // Create inbox "change" notifications for all other users + push
    const authorName = user.display_name || user.email;
    const changedField = body.status !== undefined && body.status !== project.status ? `status → ${body.status}` :
      body.pipedriveCode !== undefined && body.pipedriveCode !== project.pipedrive_code ? 'pipedrive code' :
      body.description !== undefined && body.description !== project.description ? 'description' :
      body.bottleneck !== undefined && body.bottleneck !== project.bottleneck ? 'bottleneck' : 'project';
    const changeMsg = `${authorName} updated ${changedField} in "${title}"`;
    await createChangeNotificationsForAll(user.id, projectId, user.id, changeMsg);
    sendPushToAllExcept(user.id, '✏️ Project Updated', changeMsg, { projectId }).catch(() => {});

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
