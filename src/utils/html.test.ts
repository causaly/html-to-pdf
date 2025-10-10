import { sanitizeHtml, wrapHtmlWithCSP } from './html.ts';

const TEST_CSP_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://cdn.tailwindcss.com https://fonts.gstatic.com; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'";

describe('wrapHtmlWithCSP', () => {
  it('should wrap HTML fragments in complete document with CSP meta tag', () => {
    const html = '<div>Content</div>';
    const result = wrapHtmlWithCSP(html, TEST_CSP_POLICY);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<meta charset="UTF-8">');
    expect(result).toContain('<body>');
    expect(result).toContain('<div>Content</div>');
  });

  it('should include the exact CSP policy provided', () => {
    const html = '<div>Content</div>';
    const result = wrapHtmlWithCSP(html, TEST_CSP_POLICY);

    // Verify the exact CSP meta tag with the provided policy
    expect(result).toContain(
      `<meta http-equiv="Content-Security-Policy" content="${TEST_CSP_POLICY}">`
    );
  });

  it('should apply different CSP policies correctly', () => {
    const html = '<div>Test</div>';
    const strictPolicy = "default-src 'none'; script-src 'self'";
    const result = wrapHtmlWithCSP(html, strictPolicy);

    expect(result).toContain(
      `<meta http-equiv="Content-Security-Policy" content="${strictPolicy}">`
    );
    expect(result).not.toContain(TEST_CSP_POLICY);
  });

  it('should handle CSP policy with special characters', () => {
    const html = '<div>Test</div>';
    const policyWithHash =
      "script-src 'self' 'sha256-xyz123' https://example.com";
    const result = wrapHtmlWithCSP(html, policyWithHash);

    expect(result).toContain(
      `<meta http-equiv="Content-Security-Policy" content="${policyWithHash}">`
    );
  });
});

describe('sanitizeHtml', () => {
  it('should allow Tailwind CDN script', () => {
    const html =
      '<div>Content</div><script src="https://cdn.tailwindcss.com"></script>';
    const result = sanitizeHtml(html);

    expect(result).toContain(
      '<script src="https://cdn.tailwindcss.com"></script>'
    );
    expect(result).toContain('<div>Content</div>');
  });

  it('should allow tailwind.config inline script', () => {
    const tailwindConfig = `
          <div>Content</div>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'custom-blue': '#1e40af'
                  }
                }
              }
            }
          </script>
        `;
    const result = sanitizeHtml(tailwindConfig);

    expect(result).toContain('<script>');
    expect(result).toContain('tailwind.config');
    expect(result).toContain('custom-blue');
    expect(result).toContain('<div>Content</div>');
  });

  it('should allow both Tailwind CDN and config scripts together', () => {
    const html = `
          <div>Content</div>
          <script src="https://cdn.tailwindcss.com"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    'brand-blue': '#1e40af'
                  }
                }
              }
            }
          </script>
        `;
    const result = sanitizeHtml(html);

    expect(result).toContain(
      '<script src="https://cdn.tailwindcss.com"></script>'
    );
    expect(result).toContain('tailwind.config');
    expect(result).toContain('brand-blue');
    expect(result).toContain('<div>Content</div>');
  });

  it('should not contain head or body tags', () => {
    const html = '<div>Content</div>';
    const result = sanitizeHtml(html);

    expect(result).not.toContain('<head>');
    expect(result).not.toContain('<body>');
  });
});
