/**
 * Universal User Input Sanitization & Validation Service
 * Standard pattern for all user-provided text across BoardGameTime platform.
 */

/**
 * Strip null bytes and non-printable ASCII control characters (\x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F)
 */
export function stripControlCharacters(input: string): string {
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Encode HTML special characters to prevent HTML/XSS injection
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * General string sanitizer (trims, strips control characters, HTML entity encodes, caps length)
 */
export function sanitizeString(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  let cleaned = input.trim();
  cleaned = stripControlCharacters(cleaned);
  cleaned = escapeHtml(cleaned);
  return cleaned.slice(0, maxLength);
}

/**
 * Username sanitizer (trims, strips control characters, HTML escapes, validates length)
 */
export function sanitizeUsername(username: unknown): { valid: boolean; sanitized: string; error?: string } {
  if (typeof username !== 'string') {
    return { valid: false, sanitized: '', error: 'Username must be a string.' };
  }

  let cleaned = username.trim();
  cleaned = stripControlCharacters(cleaned);
  cleaned = escapeHtml(cleaned);

  if (cleaned.length < 3 || cleaned.length > 30) {
    return { valid: false, sanitized: '', error: 'Username must be between 3 and 30 characters.' };
  }

  return { valid: true, sanitized: cleaned };
}

/**
 * Email sanitizer (trims, normalizes to lowercase, strips control characters, validates format)
 */
export function sanitizeEmail(email: unknown): { valid: boolean; sanitized: string; error?: string } {
  if (typeof email !== 'string') {
    return { valid: false, sanitized: '', error: 'Email must be a string.' };
  }

  let cleaned = email.trim().toLowerCase();
  cleaned = stripControlCharacters(cleaned);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned) || cleaned.length > 254) {
    return { valid: false, sanitized: '', error: 'Invalid email address format.' };
  }

  return { valid: true, sanitized: cleaned };
}

/**
 * Password sanitizer (strips dangerous null bytes & control chars while preserving password symbols)
 */
export function sanitizePassword(password: unknown): { valid: boolean; sanitized: string; error?: string } {
  if (typeof password !== 'string') {
    return { valid: false, sanitized: '', error: 'Password must be a string.' };
  }

  const cleaned = stripControlCharacters(password);

  if (cleaned.length < 8 || cleaned.length > 128) {
    return { valid: false, sanitized: '', error: 'Password must be between 8 and 128 characters.' };
  }

  return { valid: true, sanitized: cleaned };
}
