/**
 * Gmail cleaner (rules + AI):
 * - Scan Inbox by query
 * - Classify with lightweight rules first, then refine with OpenAI (JSON output)
 * - If final verdict == "spam" => move to Spam, then to Trash
 * - "promo" behavior is configurable (treat as spam or ignore/archive)
 *
 * No drafts, no replies. Uses GmailApp only (no Advanced Gmail Service).
 */


/** Entry (schedule with a time-driven trigger) */
function processInbox() {
  const threads = GmailApp.search(CONFIG.QUERY, 0, CONFIG.MAX_THREADS);
  if (CONFIG.LOG) logger_log(`processInbox`, `Threads found: ${threads.length}`);

  const openaiKey = PropertiesService.getScriptProperties().getProperty('sk-proj-zCb8brma8kxmtrrY7pexT3BlbkFJdlUthr7lQGOrJKHEQuel');
  const aiEnabled = CONFIG.USE_OPENAI && !!openaiKey;

  for (const thread of threads) {
    try {
      const msgs = thread.getMessages();
      const last = msgs[msgs.length - 1];
      if (!last.isInInbox() || last.isDraft()) continue;

      const from = extractEmail(last.getFrom());
      const subject = (last.getSubject() || '').trim();
      const hasListUnsub = detectListUnsubscribe(last);

      let bodyPlain = stripHtml(last.getBody()).trim();
      if (bodyPlain.length > CONFIG.MAX_BODY_CHARS) {
        bodyPlain = bodyPlain.slice(0, CONFIG.MAX_BODY_CHARS);
      }

      // 1) Rules first (cheap and deterministic)
      let rulesVerdict = ruleVerdict(from, subject, bodyPlain, hasListUnsub); // 'spam'|'promo'|'unknown'

      // 2) Optional AI refine (we only "upgrade" when confident)
      let aiVerdict = { label: 'unknown', confidence: 0.0 };
      if (aiEnabled) {
        aiVerdict = classifyWithAI(openaiKey, from, subject, bodyPlain);
      }

      // 3) Merge logic (final verdict)
      const final = decideFinalVerdict(rulesVerdict, aiVerdict);

      if (CONFIG.LOG) {
        Logger.log(JSON.stringify({
          threadId: thread.getId(),
          from, subject,
          rulesVerdict,
          aiVerdict,
          final
        }));
      }

      // 4) Act
      if (final === 'spam') {
        markSpamAndTrash(thread);
      } else if (final === 'promo') {
        handlePromo(thread);
      }

    } catch (e) {
      logger_error(`processInbox`, `Error processing thread: ${thread.getId()}: ${e}`);
    }
  }
}

/** Single run for manual testing */
function runOnce() {
  processInbox();
}

/** ========== Decision / Actions ========== */
/** Combine rules + AI into a final verdict */
function decideFinalVerdict(rulesVerdict, ai) {
  // If rules are sure it's spam -> spam
  if (rulesVerdict === 'spam') return 'spam';

  // If AI is confident it's spam -> spam
  if (ai.label === 'spam' && ai.confidence >= CONFIG.SPAM_CONFIDENCE) return 'spam';

  // PROMO handling:
  // rules saw promo -> promo
  if (rulesVerdict === 'promo') return 'promo';

  // AI confident promo -> promo (optional action per CONFIG.PROMO_ACTION)
  if (ai.label === 'promo' && ai.confidence >= CONFIG.PROMO_CONFIDENCE) return 'promo';

  return 'unknown';
}

/** Spam -> Spam folder then Trash */
function markSpamAndTrash(thread) {
  try { thread.moveToSpam(); } catch (e) { }
  try { thread.moveToTrash(); } catch (e) { }
}

/** Promo behavior per config */
function handlePromo(thread) {
  if (CONFIG.PROMO_ACTION === 'spam') {
    markSpamAndTrash(thread);
  } else if (CONFIG.PROMO_ACTION === 'archive') {
    thread.removeFromInbox();
    const lbl = getOrCreateLabel('Promo');
    thread.addLabel(lbl);
  } else {
    // ignore
  }
}

/** ========== Rules ========== */
/**
 * Rule-based quick verdict:
 * - 'spam' for hard spam cues (scam/adult/pharma)
 * - 'promo' for marketing markers (List-Unsubscribe / newsletter patterns)
 * - 'unknown' otherwise
 */
function ruleVerdict(from, subject, body, hasListUnsub) {
  const lower = s => (s || '').toLowerCase();
  const s = lower(subject), b = lower(body), f = lower(from);

  // Hard spam
  const hardSpam = [
    'crypto investment', 'quick money', 'viagra', 'cialis',
    'porn', 'adult', 'sex', 'xxx', 'casino', 'казино', 'ставк', 'биткоин'
  ];
  if (hardSpam.some(w => s.includes(w) || b.includes(w))) return 'spam';

  // List-Unsubscribe header is a strong promo/newsletter signal
  if (hasListUnsub) return 'promo';

  // Common newsletter phrases
  const promoPhrases = [
    'unsubscribe', 'manage preferences', 'view in browser',
    'скидк', 'распродаж', 'купи', 'купить', 'акци', 'подарок',
    'sale', 'special offer', 'limited offer', 'only today', 'только сегодня',
    'newsletter', 'digest', 'deal', 'coupon'
  ];
  if (promoPhrases.some(w => s.includes(w) || b.includes(w))) return 'promo';

  // Bulk-style senders
  const bulkHandles = ['no-reply', 'noreply', 'mailer', 'news', 'promo', 'marketing'];
  if (bulkHandles.some(h => f.includes(h + '@') || f.includes('@' + h))) return 'promo';

  return 'unknown';
}

/** Detect List-Unsubscribe by header or raw scan */
function detectListUnsubscribe(message) {
  try {
    const h = message.getHeader && message.getHeader('List-Unsubscribe');
    if (h && String(h).trim() !== '') return true;
  } catch (e) { }
  try {
    const raw = message.getRawContent();
    if (/^list-unsubscribe:/mi.test(raw)) return true;
  } catch (e) {
    logger_error(`detectListUnsubscribe`, `${e}`)
   }
  return false;
}

