function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w\-]+/g, '_').slice(0, 48) || 'modelo';
}

export { escapeXml, sanitizeFilename };
