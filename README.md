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

## 📦 Setup

### 1. Create Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Copy the Script ID from the URL

### 2. Set OpenAI API Key

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. In Apps Script: **Project Settings** → **Script Properties**
3. Add property: `OPENAI_API_KEY` = `your-key-here`

### 3. Deploy from GitHub

This project uses GitHub Actions for automatic deployment.

**Required Secrets** (in Repository Settings → Secrets):

- `CLASP_CLIENT_ID` - Your Google OAuth client ID
- `CLASP_CLIENT_SECRET` - Your Google OAuth client secret  
- `CLASP_REFRESH_TOKEN` - Your Google OAuth refresh token

**Get OAuth Credentials:**

```bash
npm install -g @google/clasp
clasp login
cat ~/.clasprc.json
```

### 4. Set Up Trigger

In Apps Script editor:
1. Click **Triggers** (clock icon)
2. **Add Trigger**
3. Function: `processInbox`
4. Event: Time-driven
5. Frequency: Every hour (or your preference)

## 🔐 Security & Privacy

- ✅ Your emails never leave Google/OpenAI infrastructure
- ✅ Only sender, subject, and truncated body sent to AI
- ✅ No email content stored anywhere
- ✅ OAuth tokens encrypted in GitHub Secrets
- ✅ Open source - review all code

## 📊 AI Model Details

**Model**: `gpt-4o-mini`
- Fast and cost-effective
- Optimized for classification tasks
- ~$0.15 per 1M input tokens

**Prompt Strategy**:
- System: Strict JSON output, three categories only
- User: Sender + Subject + Body (up to 6000 chars)
- Temperature: 0.0 (deterministic results)

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/Mybono/GmailSpamCleanUp.git

# Edit files in src/
# Commit and push to main branch
# GitHub Actions automatically deploys to Apps Script
```

## 📝 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Issues and Pull Requests welcome!

---

**Note**: This script requires an OpenAI API key. Set `USE_OPENAI: false` in config to use only rule-based filtering (free, but less accurate).
