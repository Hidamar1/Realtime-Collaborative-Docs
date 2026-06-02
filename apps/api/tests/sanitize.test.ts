import { describe, expect, test } from 'vitest';
import { sanitizeCommentText, sanitizeRichTextHtml, sanitizeUrl } from '../src/security/sanitize';

describe('sanitizeCommentText', () => {
  test('escapes html in comment text', () => {
    expect(sanitizeCommentText('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
  });
});

describe('sanitizeUrl', () => {
  test('allows http and https urls', () => {
    expect(sanitizeUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(sanitizeUrl('http://example.com/a')).toBe('http://example.com/a');
  });

  test('rejects javascript urls', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe(null);
  });
});

describe('sanitizeRichTextHtml', () => {
  test('removes script tags and inline event handlers', () => {
    const html = '<p onclick="alert(1)">Hi<script>alert(1)</script></p>';
    expect(sanitizeRichTextHtml(html)).toBe('<p>Hi</p>');
  });
});
