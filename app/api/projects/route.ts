import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject, getCurrentUser, createChangeNotificationsForAll } from '@/lib/db';
import { sendPushToAllExcept } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await getAllProjects();

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
    const { title, pipedriveCode, status = 'planning', description, bottleneck } = body;

    // Validate title is provided
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
    }

    // Determine if pipedrive_code is required based on status
    const statusesRequiringCode = ['in_progress', 'bottleneck', 'completed'];
    const statusesWithoutCode = ['planning', 'demo'];
    const isCodeRequired = statusesRequiringCode.includes(status);

    // Validate pipedrive_code requirement
    if (isCodeRequired && !pipedriveCode?.trim()) {
      return NextResponse.json(
        { error: `Pipedrive code is required for status "${status}"` },
        { status: 400 }
      );
    }

    // Normalize pipedrive code if provided
    let normalizedCode = null;
    if (pipedriveCode?.trim()) {
      normalizedCode = '#' + String(pipedriveCode).replace(/^#+/, '').trim();
    }

    const project = await createProject(title.trim(), normalizedCode, user.id, status, description, bottleneck);

    // Notify all other users about new project (inbox + push)
    const authorName = user.display_name || user.email;
    const changeMsg = `${authorName} created project "${title}"`;
    await createChangeNotificationsForAll(user.id, project.id, user.id, changeMsg);
    sendPushToAllExcept(user.id, '🆕 New Project', changeMsg, { projectId: project.id }).catch(() => {});

    return NextResponse.json({ ok: true, project });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
