import { sanitizeString } from './inputSanitizer';

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

  const cleaned = sanitizeString(text, 500);

  if (!cleaned) {
    return { valid: false, sanitizedText: '', error: 'Message text cannot be empty or invalid.' };
  }

  return {
    valid: true,
    sanitizedText: cleaned,
  };
}
