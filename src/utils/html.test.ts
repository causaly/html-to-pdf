import { sanitizeHtml, wrapHtmlWithCSP } from './html.ts';

describe('wrapHtmlWithCSP', () => {
  it('should wrap HTML fragments in complete document with CSP', () => {
    const html =
      '<div>Content</div><script src="https://cdn.tailwindcss.com"></script>';
    const result = wrapHtmlWithCSP(html);

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html>');
    expect(result).toContain('<head>');
    expect(result).toContain('<meta charset="UTF-8">');
    expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
    expect(result).toContain('<body>');
    expect(result).toContain('<div>Content</div>');
    expect(result).toContain(
      '<script src="https://cdn.tailwindcss.com"></script>'
    );
  });
});

describe('sanitizeHtml', () => {
  it('should allow Tailwind CDN script', () => {
    const html =
      '<div>Content</div><script src="https://cdn.tailwindcss.com"></script>';
    const result = wrapHtmlWithCSP(sanitizeHtml(html));

    expect(result).toContain(
      '<script src="https://cdn.tailwindcss.com"></script>'
    );
    expect(result).toContain('<div>Content</div>');
    expect(result).toContain(
      "script-src * 'unsafe-inline' 'unsafe-eval'"
    );
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
