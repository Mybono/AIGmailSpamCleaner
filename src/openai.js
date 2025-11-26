/** ========== AI ========== */
/** Ask OpenAI to classify into spam/promo/ham with confidence (JSON only) */
function classifyWithAI(apiKey, from, subject, body) {
  try {
    const system = `You are an email filter. Classify the message into exactly one of:
    "spam" (fraud/scam/abuse), "promo" (marketing/newsletter/bulk), or "ham" (work-related).
    Return STRICT JSON only: {"label":"spam|promo|ham","confidence":0..1}. No extra text.`;

    const prompt = `Sender: ${from}
    Subject: ${subject}
    Body (truncated):
    ${body}`;

    const out = openaiChat(apiKey, system, prompt);
    const json = safeJson(out);
    if (json && json.label && typeof json.confidence === 'number') return json;
  } catch (e) {
    logger_error('classifyWithAI', `AI classify failed: ${e}`);
  }

  return { label: 'unknown', confidence: 0.0 };
}

/** Minimal OpenAI Chat Completions wrapper */
function openaiChat(apiKey, system, user) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const payload = {
    model: CONFIG.OPENAI_MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.0,
  };
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + apiKey },
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  });
  const data = JSON.parse(resp.getContentText());
  const msg = data?.choices?.[0]?.message?.content || '';

  return msg;
}
