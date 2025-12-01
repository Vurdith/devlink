import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validatePostContent,
  validateUrl,
  validateRating,
  sanitizeText,
  sanitizeHtml,
} from '../validation';

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com').isValid).toBe(true);
    expect(validateEmail('user.name@domain.co.uk').isValid).toBe(true);
    expect(validateEmail('user+tag@example.com').isValid).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('').isValid).toBe(false);
    expect(validateEmail('invalid').isValid).toBe(false);
    expect(validateEmail('no@domain').isValid).toBe(false);
    expect(validateEmail('@nodomain.com').isValid).toBe(false);
  });

  it('should reject overly long emails', () => {
    const longEmail = 'a'.repeat(250) + '@example.com';
    expect(validateEmail(longEmail).isValid).toBe(false);
  });
});

describe('validateUsername', () => {
  it('should accept valid usernames', () => {
    expect(validateUsername('user123').isValid).toBe(true);
    expect(validateUsername('cool_dev').isValid).toBe(true);
    expect(validateUsername('User_Name123').isValid).toBe(true);
  });

  it('should reject invalid usernames', () => {
    expect(validateUsername('').isValid).toBe(false);
    expect(validateUsername('ab').isValid).toBe(false); // too short
    expect(validateUsername('user@name').isValid).toBe(false); // invalid char
    expect(validateUsername('_username').isValid).toBe(false); // starts with _
    expect(validateUsername('username_').isValid).toBe(false); // ends with _
  });

  it('should reject overly long usernames', () => {
    const longUsername = 'a'.repeat(31);
    expect(validateUsername(longUsername).isValid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should accept strong passwords', () => {
    expect(validatePassword('Password1').isValid).toBe(true);
    expect(validatePassword('SecureP@ss123').isValid).toBe(true);
    expect(validatePassword('MyStr0ngPass').isValid).toBe(true);
  });

  it('should reject weak passwords', () => {
    expect(validatePassword('').isValid).toBe(false);
    expect(validatePassword('short').isValid).toBe(false); // too short
    expect(validatePassword('nouppercase1').isValid).toBe(false); // no uppercase
    expect(validatePassword('NOLOWERCASE1').isValid).toBe(false); // no lowercase
    expect(validatePassword('NoNumbers').isValid).toBe(false); // no numbers
  });

  it('should reject overly long passwords', () => {
    const longPassword = 'Aa1' + 'a'.repeat(130);
    expect(validatePassword(longPassword).isValid).toBe(false);
  });
});

describe('validatePostContent', () => {
  it('should accept valid post content', () => {
    expect(validatePostContent('Hello world!').isValid).toBe(true);
    expect(validatePostContent('This is a post with #hashtag and @mention').isValid).toBe(true);
  });

  it('should reject empty content', () => {
    expect(validatePostContent('').isValid).toBe(false);
    expect(validatePostContent('   ').isValid).toBe(false);
  });

  it('should reject overly long content', () => {
    const longContent = 'a'.repeat(10001);
    expect(validatePostContent(longContent).isValid).toBe(false);
  });
});

describe('validateUrl', () => {
  it('should accept valid URLs', () => {
    expect(validateUrl('https://example.com').isValid).toBe(true);
    expect(validateUrl('http://localhost:3000').isValid).toBe(true);
    expect(validateUrl('https://sub.domain.com/path?query=1').isValid).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(validateUrl('').isValid).toBe(false);
    expect(validateUrl('not-a-url').isValid).toBe(false);
    expect(validateUrl('ftp://example.com').isValid).toBe(false); // wrong protocol
    expect(validateUrl('javascript:alert(1)').isValid).toBe(false);
  });
});

describe('validateRating', () => {
  it('should accept valid ratings', () => {
    expect(validateRating(1).isValid).toBe(true);
    expect(validateRating(3).isValid).toBe(true);
    expect(validateRating(5).isValid).toBe(true);
  });

  it('should reject invalid ratings', () => {
    expect(validateRating(0).isValid).toBe(false);
    expect(validateRating(6).isValid).toBe(false);
    expect(validateRating(-1).isValid).toBe(false);
    expect(validateRating(NaN).isValid).toBe(false);
  });
});

describe('sanitizeText', () => {
  it('should remove dangerous content', () => {
    expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<script>');
    expect(sanitizeText('javascript:alert(1)')).not.toContain('javascript:');
    expect(sanitizeText('onclick=alert(1)')).not.toContain('onclick=');
  });

  it('should trim and limit length', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
    expect(sanitizeText('a'.repeat(15000)).length).toBeLessThanOrEqual(10000);
  });
});

describe('sanitizeHtml', () => {
  it('should escape HTML entities', () => {
    expect(sanitizeHtml('<div>')).toBe('&lt;div&gt;');
    expect(sanitizeHtml('"test"')).toBe('&quot;test&quot;');
    expect(sanitizeHtml("'test'")).toBe('&#x27;test&#x27;');
  });
});

