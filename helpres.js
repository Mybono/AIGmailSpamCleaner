/** ========== Helpers ========== */
function extractEmail(fromHeader) {
  const m = fromHeader && fromHeader.match(/<([^>]+)>/);
  return m ? m[1].toLowerCase() : (fromHeader || '').toLowerCase();
}

function stripHtml(html) {
  return (html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\r/g, '')
    .replace(/On .*wrote:([\s\S]*)/i, '')
    .replace(/From:.*?Sent:(.*)/i, '');
}

function getOrCreateLabel(name) {
  const existing = GmailApp.getUserLabelByName(name);
  return existing || GmailApp.createLabel(name);
}

function safeJson(s) {
  try { return JSON.parse(s); }
  catch (e) {
    const m = s && s.match && s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (e2) {} }
    return null;
  }
}
