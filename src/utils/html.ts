import { default as sanitizeHtmlCommand } from 'sanitize-html';

export function sanitizeHtml(html: string): string {
  return sanitizeHtmlCommand(html, {
    allowedTags: false, // false === "no whitelist → allow all"
    allowedAttributes: false, // ditto for attributes
    allowVulnerableTags: true, // let script/style/iframe through *if* we keep them

    // Custom filter to allow specific scripts
    exclusiveFilter: function (frame) {
      if (frame.tag === 'script') {
        if (frame.attribs && frame.attribs.src) {
          const src = frame.attribs.src;
          if (src.includes('tailwindcss.com')) {
            return false; // Keep this script
          }
          // Block all other external scripts
          return true;
        }

        // For inline scripts, only allow those that contain tailwind.config
        if (frame.text && frame.text.includes('tailwind.config')) {
          return false;
        }

        // Block all other scripts
        return true;
      }

      // Allow all other tags
      return false;
    },
  });
}
