/**
 * FinPulse — Google Account Cloud Sync & Gmail Auto-Capture Bridge
 * =================================================================
 * Deploy this script inside your Google Account (https://script.google.com)
 * attached to a Google Sheet. It provides:
 *   1. Automatic Gmail scanning for Bank Alerts, QR Payments, Credit/Debit & Salary emails
 *   2. Webhook endpoint (doPost) for iPhone Apple Shortcuts (Apple Pay, SMS, QR OCR screenshots)
 *   3. Live JSON Sync endpoint (doGet) for the FinPulse Dashboard
 *
 * SETUP STEPS:
 *   1. Create a new Google Sheet (https://sheets.new) and name it "FinPulse Ledger".
 *   2. Click Extensions -> Apps Script, and paste this entire file into Code.gs.
 *   3. Click "Deploy" -> "New deployment" -> Select type: "Web app".
 *      - Execute as: "Me"
 *      - Who has access: "Anyone" (secured via your optional SYNC_TOKEN below)
 *   4. Copy the generated Web App URL and paste it into FinPulse -> "Device & Cloud Sync".
 *   5. (Optional) In Apps Script -> "Triggers" (clock icon on left), add a Time-driven trigger
 *      for `scanGmailForTransactions` to run every 15 minutes.
 */

const SHEET_NAME = 'Transactions';
const SYNC_TOKEN = ''; // Optional: set a secret passphrase here and in FinPulse settings

// Gmail search query for RHB Bank, JANM e-Penyata Gaji, DuitNow QR, Touch 'n Go, Apple Pay, FPX & JomPAY
const GMAIL_SEARCH_QUERY = 'newer_than:7d ("RHB" OR "JANM" OR "Penyata Gaji" OR "Gaji Bersih" OR "DuitNow" OR "Touch n Go" OR "FPX" OR "JomPAY" OR "Apple Pay" OR "transaction" OR "paid" OR "receipt")';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['id', 'date', 'description', 'category', 'account', 'type', 'amount', 'notes', 'createdAt']);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
  }
  return sheet;
}

/**
 * GET Endpoint: Returns all transactions stored in Google Sheets to FinPulse Dashboard
 */
function doGet(e) {
  const params = (e && e.parameter) || {};
  if (SYNC_TOKEN && params.token !== SYNC_TOKEN) {
    return jsonResponse({ ok: false, error: 'Unauthorized token' });
  }

  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const transactions = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0] && !r[6]) continue;
    const dateVal = r[1] instanceof Date
      ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), 'yyyy-MM-dd')
      : String(r[1] || '').slice(0, 10);

    transactions.push({
      id: String(r[0]),
      date: dateVal,
      description: String(r[2] || 'Synced Transaction'),
      category: String(r[3] || 'Shopping & Tech'),
      account: String(r[4] || 'Checking Account'),
      type: String(r[5] || 'expense'),
      amount: Number(parseFloat(r[6]) || 0),
      notes: String(r[7] || '')
    });
  }

  return jsonResponse({
    ok: true,
    count: transactions.length,
    syncedAt: new Date().toISOString(),
    transactions: transactions
  });
}

/**
 * POST Endpoint: Receives transactions from:
 *  - iPhone Apple Shortcuts (Apple Pay tap, Bank SMS, or QR Screenshot OCR text)
 *  - FinPulse Web Dashboard pushing local transactions to Google Sheets
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (SYNC_TOKEN && body.token !== SYNC_TOKEN) {
      return jsonResponse({ ok: false, error: 'Unauthorized token' });
    }

    const sheet = getOrCreateSheet();
    const existingIds = new Set(
      sheet.getDataRange().getValues().slice(1).map((r) => String(r[0]))
    );

    // Case 1: Raw notification/SMS/QR OCR text sent from iPhone Shortcut
    if (body.rawText) {
      const parsed = parseNotificationText(body.rawText, body.defaultAccount || 'Apple Pay');
      if (!parsed) {
        return jsonResponse({ ok: false, error: 'Could not extract amount from text' });
      }
      appendTransactionRow(sheet, parsed);
      return jsonResponse({ ok: true, added: 1, transaction: parsed });
    }

    // Case 2: Single structured transaction from iPhone Shortcut (e.g., Apple Wallet Automation)
    if (body.amount && !Array.isArray(body.transactions)) {
      const tx = normalizeShortcutTransaction(body);
      if (!existingIds.has(tx.id)) {
        appendTransactionRow(sheet, tx);
      }
      return jsonResponse({ ok: true, added: 1, transaction: tx });
    }

    // Case 3: Batch sync from FinPulse Dashboard
    if (Array.isArray(body.transactions)) {
      let added = 0;
      body.transactions.forEach((tx) => {
        if (tx && tx.id && !existingIds.has(String(tx.id))) {
          appendTransactionRow(sheet, tx);
          existingIds.add(String(tx.id));
          added++;
        }
      });
      return jsonResponse({ ok: true, added: added });
    }

    return jsonResponse({ ok: false, error: 'Unrecognized payload format' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

/**
 * Scheduled Gmail Scanner: Automatically parses bank/QR/salary emails in Gmail
 */
function scanGmailForTransactions() {
  const sheet = getOrCreateSheet();
  const existingIds = new Set(
    sheet.getDataRange().getValues().slice(1).map((r) => String(r[0]))
  );

  const threads = GmailApp.search(GMAIL_SEARCH_QUERY, 0, 30);
  let addedCount = 0;

  threads.forEach((thread) => {
    const messages = thread.getMessages();
    messages.forEach((msg) => {
      const msgId = 'gmail_' + msg.getId();
      if (existingIds.has(msgId)) return;

      const subject = msg.getSubject() || '';
      const plainBody = (msg.getPlainBody() || '').slice(0, 1200);
      const combined = subject + '\n' + plainBody;

      const parsed = parseNotificationText(combined, 'Checking Account');
      if (parsed && parsed.amount > 0) {
        parsed.id = msgId;
        parsed.date = Utilities.formatDate(
          msg.getDate(),
          Session.getScriptTimeZone(),
          'yyyy-MM-dd'
        );
        parsed.notes = 'Auto-captured from Gmail: ' + subject.slice(0, 60);
        appendTransactionRow(sheet, parsed);
        existingIds.add(msgId);
        addedCount++;
      }
    });
  });

  Logger.log('Gmail scan complete. Added ' + addedCount + ' transactions.');
}

function normalizeShortcutTransaction(body) {
  const rawAmt = Math.abs(parseFloat(String(body.amount).replace(/[^0-9.-]/g, '')) || 0);
  const desc = String(body.merchant || body.description || 'iPhone Wallet Payment').trim();
  const type = String(body.type || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
  const account = String(body.account || body.method || 'Apple Pay');
  const category = body.category || inferCategory(desc, type);
  const dateStr = body.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  return {
    id: body.id || ('ios_' + new Date().getTime()),
    date: dateStr,
    description: desc,
    category: category,
    account: account,
    type: type,
    amount: Number(rawAmt.toFixed(2)),
    notes: body.notes || 'Auto-captured via iPhone Shortcut'
  };
}

function parseNotificationText(text, fallbackAccount) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  const amtMatch = clean.match(/(?:USD|RM|SGD|EUR|GBP|\$|¥|€|£|INR|AUD|CAD)?\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2})/i);
  if (!amtMatch) return null;

  const amount = parseFloat(amtMatch[1].replace(/,/g, ''));
  if (!amount || amount <= 0) return null;

  const isIncome = /\b(credited|received|salary|payroll|deposit|deposited|refund|dividend|inward)\b/i.test(clean);
  const type = isIncome ? 'income' : 'expense';

  let account = fallbackAccount || 'Checking Account';
  if (/\b(qr|duitnow|paynow|grabpay|tng|touch 'n go|alipay|wechat|scan)\b/i.test(clean)) {
    account = 'QR Pay / e-Wallet';
  } else if (/\b(apple pay|wallet)\b/i.test(clean)) {
    account = 'Apple Pay';
  } else if (/\b(debit card|visa debit|mastercard debit)\b/i.test(clean)) {
    account = 'Debit Card';
  } else if (/\b(amex|american express)\b/i.test(clean)) {
    account = 'Amex Gold';
  } else if (/\b(credit card|sapphire|visa|mastercard)\b/i.test(clean)) {
    account = 'Sapphire Credit';
  }

  let merchant = 'Auto-Captured Transaction';
  const merchMatch = clean.match(/(?:at|to|from|merchant[:\s]+|paid to)\s+([A-Za-z0-9&'’\-\.\s]{2,35}?)(?:\s+(?:on|via|ref|using|for|with|date|amount|\.)|$)/i);
  if (merchMatch && merchMatch[1]) {
    merchant = merchMatch[1].trim();
  } else if (isIncome && /\bsalary|payroll\b/i.test(clean)) {
    merchant = 'Salary & Payroll Deposit';
  }

  return {
    id: 'auto_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1000),
    date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    description: merchant,
    category: inferCategory(merchant + ' ' + clean, type),
    account: account,
    type: type,
    amount: Number(amount.toFixed(2)),
    notes: 'Smart Capture'
  };
}

function inferCategory(text, type) {
  const t = text.toLowerCase();
  if (type === 'income') {
    if (t.includes('dividend') || t.includes('interest') || t.includes('vanguard')) return 'Investments & Dividends';
    if (t.includes('freelance') || t.includes('invoice') || t.includes('client')) return 'Freelance & Consulting';
    return 'Salary & Payroll';
  }
  if (/grocery|whole foods|trader joe|costco|mart|supermarket|jaya|fairprice/.test(t)) return 'Groceries';
  if (/coffee|starbucks|cafe|restaurant|dining|sushi|burger|pizza|food|grabfood|doordash|sweetgreen/.test(t)) return 'Dining & Coffee';
  if (/uber|lyft|grab|shell|petronas|fuel|gas|parking|toll|metro|transit/.test(t)) return 'Transportation';
  if (/netflix|spotify|cinema|imax|game|steam|disney|concert/.test(t)) return 'Entertainment';
  if (/electric|water|internet|fiber|telco|bill|utility|verizon|att/.test(t)) return 'Utilities & Bills';
  if (/rent|mortgage|apartment|lease|property/.test(t)) return 'Housing & Rent';
  if (/gym|fitness|equinox|clinic|hospital|pharmacy|dental|health/.test(t)) return 'Health & Fitness';
  if (/airline|delta|hotel|airbnb|booking|flight|travel/.test(t)) return 'Travel';
  return 'Shopping & Tech';
}

function appendTransactionRow(sheet, tx) {
  sheet.appendRow([
    tx.id,
    tx.date,
    tx.description,
    tx.category,
    tx.account,
    tx.type,
    tx.amount,
    tx.notes || '',
    new Date().toISOString()
  ]);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
