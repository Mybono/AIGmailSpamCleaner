# 📬 GmailSpamCleanUp

> An intelligent Google Apps Script that uses AI to automatically detect and remove spam and promotional emails from your Gmail inbox.

## 🤖 What Makes This Different

This script combines **rule-based filtering** with **OpenAI's GPT** to intelligently classify emails:

- **Rule-Based Detection**: Fast detection of obvious spam patterns (scams, adult content, crypto schemes)
- **AI-Powered Classification**: Uses OpenAI GPT-4o-mini to analyze sender, subject, and content
- **Smart Decision Making**: Combines both approaches for accurate spam/promo detection
- **Automatic Cleanup**: Moves detected spam to Trash automatically

## 🚀 Features

- ✅ **Dual-Layer Filtering**: Rules + AI for maximum accuracy
- ✅ **Configurable Actions**: Treat promos as spam, archive them, or ignore
- ✅ **Confidence Thresholds**: Adjustable AI confidence levels (default: 75% for spam, 80% for promo)
- ✅ **Automatic Deployment**: GitHub Actions CI/CD pipeline
- ✅ **Safe & Transparent**: Logs all decisions, easy to review

## 🔧 How It Works

1. **Scans** your inbox for recent emails (default: last 30 days)
2. **Quick Check** with rule-based patterns (crypto, adult content, unsubscribe links)
3. **AI Analysis** sends email metadata to OpenAI for classification
4. **Smart Decision** combines rule + AI verdict with confidence scores
5. **Takes Action** moves spam to trash, handles promos per your config

### Classification Types

- **spam**: Fraud, scams, phishing, malicious content → Moved to Trash
- **promo**: Marketing, newsletters, bulk emails → Configurable action
- **ham**: Legitimate work/personal emails → Left untouched
- **unknown**: Uncertain classification → No action taken

## ⚙️ Configuration

Edit `src/config.js`:

```javascript
const CONFIG = {
  QUERY: 'in:inbox newer_than:30d',     // Search scope
  MAX_THREADS: 120,                      // Max emails per run
  
  USE_OPENAI: true,                      // Enable AI classification
  OPENAI_MODEL: 'gpt-4o-mini',          // Model to use
  SPAM_CONFIDENCE: 0.75,                 // AI confidence threshold for spam
  PROMO_CONFIDENCE: 0.80,                // AI confidence threshold for promo
  
  PROMO_ACTION: 'spam',                  // 'spam' | 'archive' | 'ignore'
  MAX_BODY_CHARS: 6000,                  // Limit email body sent to AI
  LOG: true                              // Enable detailed logging
};
```




**Note**: This script requires an OpenAI API key. Set `USE_OPENAI: false` in config to use only rule-based filtering (free, but less accurate).
