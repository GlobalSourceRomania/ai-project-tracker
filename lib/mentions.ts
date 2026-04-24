// Extract @mentions from text (e.g., "Hey @john.doe check this")
export function extractMentions(text: string): string[] {
  const regex = /@([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+)/g;
  const matches = text.matchAll(regex);
  const emails = Array.from(matches, m => m[1]);
  return [...new Set(emails)]; // Remove duplicates
}

// Check if mentions exist in text
export function hasMentions(text: string | null | undefined): boolean {
  if (!text) return false;
  return /@[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+/.test(text);
}

// Create notification for mentioned user
export async function createMentionNotification(
  mentionedEmail: string,
  authorId: number,
  projectId: number,
  projectName: string,
  field: 'description' | 'bottleneck' | 'update',
  excerpt: string
) {
  try {
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mentionedEmail,
        authorId,
        projectId,
        type: 'mention',
        field,
        excerpt,
        projectName,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
