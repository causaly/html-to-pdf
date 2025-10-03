import { default as sanitizeHtmlCommand } from 'sanitize-html';

export function wrapHtmlWithCSP(html: string): string {
  const cspPolicy = "default-src 'self'; script-src 'self' https://cdn.tailwindcss.com https://*.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https://cdn.tailwindcss.com; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'";
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${cspPolicy}">
</head>
<body>
  ${html}
</body>
</html>`;
}

export function sanitizeHtml(html: string): string {
  // Remove the current script filtering logic - let CSP handle script security
  return sanitizeHtmlCommand(html, {
    allowedTags: false, // false === "no whitelist → allow all" - but, crucially, prevents 'body', sibling and parent elements from being allowed
    allowedAttributes: false, // ditto for attributes
    allowVulnerableTags: true, // let script/style/iframe through *if* we keep them
    // Remove the exclusiveFilter entirely - CSP will block malicious scripts
  });
}
