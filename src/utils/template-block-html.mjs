export function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function buildTemplateBlockHtml(content) {
  const lines = String(content).replace(/\n$/, '').split('\n');
  const body = lines
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return '<div class="template-spacer" aria-hidden="true"></div>';
      }

      if (trimmed.startsWith('【') && trimmed.endsWith('】')) {
        return `<p class="template-section-title">${escapeHtml(trimmed)}</p>`;
      }

      return `<p class="template-line">${escapeHtml(line)}</p>`;
    })
    .join('');

  return `<div class="template-block" role="note" aria-label="コピー用テンプレート"><p class="template-label">コピー用テンプレート</p><div class="template-body">${body}</div></div>`;
}
