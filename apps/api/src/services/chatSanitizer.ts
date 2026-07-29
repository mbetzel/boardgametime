/**
 * Sanitizes and validates chat message text input.
 * Protects against SQL injection (via Prisma parameterized queries),
 * XSS / HTML script injections, control character injections, and log tampering.
 */
export function sanitizeChatMessageInput(text: unknown): {
  valid: boolean;
  sanitizedText: string;
  error?: string;
} {
  if (typeof text !== 'string') {
    return { valid: false, sanitizedText: '', error: 'Message text must be a string.' };
  }

  // Trim whitespace
  let cleaned = text.trim();

  if (!cleaned) {
    return { valid: false, sanitizedText: '', error: 'Message text cannot be empty.' };
  }

  // Enforce max length constraint (500 characters max)
  if (cleaned.length > 500) {
    cleaned = cleaned.slice(0, 500);
  }

  // Strip null bytes and non-printable control characters (\x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F)
  // Keeps normal whitespace, newlines (\n), and carriage returns (\r)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Defense-in-depth HTML entity encoding for < and > to prevent raw script injections if rendered anywhere unescaped
  cleaned = cleaned
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (!cleaned.trim()) {
    return { valid: false, sanitizedText: '', error: 'Message text contains only invalid characters.' };
  }

  return {
    valid: true,
    sanitizedText: cleaned,
  };
}
