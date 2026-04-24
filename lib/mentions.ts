// Extract @mentions from text (e.g., "Hey @john.doe@example.com check this")
// Matches @<email> where email contains exactly one @ sign
export function extractMentions(text: string): string[] {
  if (!text) return [];
  // Matches @something@domain.tld — the full email after @
  const regex = /@([^\s@]+@[^\s@]+\.[^\s@]+)/g;
  const matches = text.matchAll(regex);
  const emails = Array.from(matches, m => m[1].replace(/[.,;!?]+$/, '')); // strip trailing punctuation
  return [...new Set(emails)]; // Remove duplicates
}

// Check if mentions exist in text
export function hasMentions(text: string | null | undefined): boolean {
  if (!text) return false;
  return extractMentions(text).length > 0;
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
    console.log(`[MENTION-CLIENT] Creating notification for ${mentionedEmail}`);
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
    if (!res.ok) {
      const error = await res.text();
      console.error(`[MENTION-CLIENT] Failed to create notification: ${res.status} - ${error}`);
      return false;
    }
    console.log(`[MENTION-CLIENT] Notification created successfully`);
    return true;
  } catch (err) {
    console.error(`[MENTION-CLIENT] Error creating notification:`, err);
    return false;
  }
}
