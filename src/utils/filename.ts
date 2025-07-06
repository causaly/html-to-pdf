export function generateFilename(date: Date) {
  const datetime = date
    .toISOString()
    .replaceAll(':', '')
    .replaceAll('-', '')
    .replace('T', '_')
    .slice(0, 15);
  return `document_${datetime}.pdf`;
}
