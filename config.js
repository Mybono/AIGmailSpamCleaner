const CONFIG = {
  // Search scope
  QUERY: 'in:inbox newer_than:30d',     // includes Promotions tab
  MAX_THREADS: 120,                     // per run

  // AI config (set OPENAI_API_KEY in Script Properties)
  USE_OPENAI: true,
  OPENAI_MODEL: 'gpt-4o-mini',
  SPAM_CONFIDENCE: 0.75,                // AI confidence to trust "spam"
  PROMO_CONFIDENCE: 0.80,               // AI confidence to trust "promo"

  // What to do with PROMO:
  //   "spam"   -> treat like spam (Spam + Trash)
  //   "archive"-> remove from Inbox + add label "Promo"
  //   "ignore" -> do nothing
  PROMO_ACTION: 'spam',

  // Safety / debugging
  MAX_BODY_CHARS: 6000,
  LOG: true
};
