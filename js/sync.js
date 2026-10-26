(function () {
  window.FinPulse = window.FinPulse || {};

  const STORAGE_KEY_SYNC = 'finpulse_sync_config_v1';

  const SAMPLE_NOTIFICATIONS = [
    'e-Penyata Gaji JANM (Oktober 2026): Gaji Pokok RM 4,200.00 | Jumlah Elaun RM 1,150.00 | Potongan RM 500.00 | GAJI BERSIH: RM 4,850.00 (Bank: RHB BANK)',
    'DuitNow QR Alert: You paid RM 14.90 to ZUS COFFEE via DuitNow QR on 2026-10-26. Ref: DN8839201',
    'Apple Wallet: RM 168.80 at Jaya Grocer using Apple Pay (RHB Visa Debit ending 4419).',
    'Touch \'n Go eWallet: Reload & RFID Toll deduction of RM 45.00 at PLUS Highway.',
    'RHB Bank Alert: FPX Payment of RM 189.00 to SHOPEE MALAYSIA debited from RHB Account.'
  ].join('\n');

  function loadSyncConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SYNC);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read sync config:', err);
    }
    return {
      webAppUrl: '',
      syncToken: '',
      autoSyncOnLoad: true,
      lastSyncedAt: null
    };
  }

  function saveSyncConfig(cfg) {
    try {
      localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(cfg));
    } catch (err) {
      console.warn('Could not save sync config:', err);
    }
  }

  /**
   * Automatic JANM -> RHB Bank Payday Detector & Auto-Poster
   * Since RHB Bank does not push an SMS/notification when JANM IBG salary arrives,
   * this engine checks the JANM Payday Calendar (or user's payday rule) and
   * automatically posts the monthly Gaji Bersih if it hasn't been logged yet this month.
   */
  function checkAndPostJANMSalary(transactions, forcePostNow) {
    const Data = window.FinPulse.Data;
    const rule = Data.loadJANMRule();
    if (!rule.enabled && !forcePostNow) {
      return { posted: false, reason: 'disabled' };
    }

    const now = new Date();
    const yr = now.getFullYear();
    const moOneBased = now.getMonth() + 1;
    const ymKey = `${yr}-${String(moOneBased).padStart(2, '0')}`;

    const scheduledPayday =
      rule.scheduleMode === 'fixed_day'
        ? Math.min(28, Math.max(1, parseInt(rule.fixedDay, 10) || 24))
        : Data.getJANMPaydayForMonth(yr, moOneBased);

    // Check if a JANM salary transaction is already recorded for this YYYY-MM
    const alreadyExists = transactions.some((tx) => {
      if (tx.id === `janm_auto_${ymKey}`) return true;
      const txYm = String(tx.date || '').slice(0, 7);
      if (txYm !== ymKey || tx.type !== 'income') return false;
      const desc = String(tx.description || '').toLowerCase();
      return desc.includes('janm') || desc.includes('gaji bersih') || desc.includes('penyata gaji');
    });

    if (alreadyExists && !forcePostNow) {
      return {
        posted: false,
        alreadyExists: true,
        ymKey,
        scheduledPayday
      };
    }

    const isPaydayReached = now.getDate() >= scheduledPayday;
    if (!isPaydayReached && !forcePostNow) {
      return {
        posted: false,
        alreadyExists: false,
        ymKey,
        scheduledPayday,
        daysRemaining: scheduledPayday - now.getDate()
      };
    }

    const txDate = forcePostNow
      ? Data.formatDateISO(now)
      : Data.formatDateISO(new Date(yr, now.getMonth(), scheduledPayday));

    const newSalaryTx = {
      id: alreadyExists ? `janm_manual_${Date.now()}` : `janm_auto_${ymKey}`,
      date: txDate,
      description: rule.description || 'JANM — Gaji Bersih Bulanan (IBG Credit)',
      category: 'Salary & JANM (Gaji Bersih)',
      account: rule.account || 'RHB Bank (Salary / Debit)',
      type: 'income',
      amount: Number(parseFloat(rule.netAmount || 4850).toFixed(2)),
      notes: forcePostNow
        ? `Posted via JANM -> RHB Salary Tracker (${ymKey})`
        : `Auto-credited on JANM Payday (${ymKey}) -> RHB Bank`
    };

    return {
      posted: true,
      transaction: newSalaryTx,
      ymKey,
      scheduledPayday
    };
  }

  function inferCategoryFromText(text, type) {
    const t = String(text || '').toLowerCase();
    if (type === 'income') {
      if (/asb|tabung haji|dividen|dividend|hibah|interest|apy|yield/.test(t)) return 'ASB, Tabung Haji & Dividends';
      if (/elaun|bonus|insentif|tuntutan|overtime|freelance|side income|bantuan khas/.test(t)) return 'Elaun, Bonus & Side Income';
      return 'Salary & JANM (Gaji Bersih)';
    }
    if (/grocery|jaya grocer|lotus|mydin|99 speedmart|village grocer|econsave|giant|aeon big|supermarket|pasar|mart/.test(t)) return 'Groceries & Supermarket';
    if (/coffee|zus|starbucks|arabica|mamak|pelita|nasi|restoran|cafe|dining|mcdonald|kfc|nando|grabfood|foodpanda|kopi|gerai|baker/.test(t)) return 'Dining, Mamak & Coffee';
    if (/petronas|shell|caltex|bhp|rfid|toll|plus highway|touch 'n go|tng|grab|lrt|mrt|rapidkl|fuel|minyak|parking/.test(t)) return 'Fuel, Toll (RFID) & Transit';
    if (/netflix|spotify|tgv|gsc|cinema|movie|astro|steam|playstation|concert/.test(t)) return 'Entertainment & Subscriptions';
    if (/tnb|elektrik|unifi|tm |syabas|air selangor|indah water|celcom|digi|maxis|umobile|time fibre|jompay|bil |utility/.test(t)) return 'Utilities (TNB, Air, Unifi, Telco)';
    if (/lppsa|rent|sewa|mortgage|ansuran rumah|apartment|cukai pintu|maintenance/.test(t)) return 'Housing & Loan (LPPSA/Rent)';
    if (/takaful|etiqa|prubsn|AIA|caring|watsons|guardian|klinik|hospital|farmasi|gym|fitness|dental/.test(t)) return 'Health, Takaful & Fitness';
    if (/airasia|malaysia airlines|batik air|firefly|hotel|booking|agoda|airbnb|balik kampung|travel/.test(t)) return 'Balik Kampung & Travel';
    return 'Shopping & Online (Shopee/Lazada)';
  }

  function inferAccountFromText(text) {
    const t = String(text || '').toLowerCase();
    if (/\b(duitnow qr|qr pay|qr scan|scanned qr)\b/.test(t)) {
      return 'DuitNow QR';
    }
    if (/\b(touch 'n go|tng|ewallet|rfid)\b/.test(t)) {
      return 'Touch \'n Go eWallet';
    }
    if (/\b(apple pay|apple wallet)\b/.test(t)) {
      return 'Apple Pay (RHB Visa)';
    }
    if (/\b(rhb|janm|penyata gaji|gaji bersih|fpx|ibg|jompay)\b/.test(t)) {
      return 'RHB Bank (Salary / Debit)';
    }
    if (/\b(maybank|mae|m2u)\b/.test(t)) {
      return 'Maybank / MAE';
    }
    if (/\b(asb|tabung haji)\b/.test(t)) {
      return 'ASB / Tabung Haji Savings';
    }
    if (/\b(credit card|visa signature|mastercard credit)\b/.test(t)) {
      return 'Credit Card';
    }
    if (/\b(cash|tunai)\b/.test(t)) {
      return 'Cash Wallet';
    }
    return 'RHB Bank (Salary / Debit)';
  }

  function parseSingleNotificationLine(rawLine, indexOffset) {
    const clean = String(rawLine || '').replace(/\s+/g, ' ').trim();
    if (!clean) return null;

    let bestAmount = null;

    // Special priority 1: JANM e-Penyata Gaji "GAJI BERSIH" or "PENDAPATAN BERSIH"
    const gajiBersihMatch = clean.match(
      /(?:gaji\s+bersih|pendapatan\s+bersih|net\s+pay|net\s+salary)\s*[:=\-]?\s*(?:RM|MYR|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i
    );
    if (gajiBersihMatch && gajiBersihMatch[1]) {
      bestAmount = parseFloat(gajiBersihMatch[1].replace(/,/g, ''));
    }

    // Standard currency / decimal extraction if not a multi-field payslip
    if (!bestAmount) {
      const decimalOrCurrencyMatch = clean.match(
        /(?:(?:RM|MYR|USD|SGD|\$)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?)|([0-9]{1,3}(?:,[0-9]{3})*\.[0-9]{2}))/i
      );
      if (decimalOrCurrencyMatch) {
        const numStr = (decimalOrCurrencyMatch[1] || decimalOrCurrencyMatch[2] || '').replace(/,/g, '');
        bestAmount = parseFloat(numStr);
      }
    }

    if (!bestAmount || isNaN(bestAmount) || bestAmount <= 0) {
      return null;
    }

    // Detect Income (including JANM, Gaji Bersih, IBG Credit, Elaun, Dividen) vs Expense
    const isJANM = /\b(janm|jabatan akauntan negara|penyata gaji|gaji bersih|pendapatan bersih|gaji bulanan)\b/i.test(clean);
    const isIncome =
      isJANM ||
      /\b(credited|received|salary|gaji|payroll|deposit|deposited|ibg cr|duitnow cr|elaun|bonus|dividen|hibah|refund)\b/i.test(clean);
    const type = isIncome ? 'income' : 'expense';

    // Detect Date (YYYY-MM-DD or today)
    const todayISO = window.FinPulse.Data.formatDateISO(new Date());
    let dateStr = todayISO;
    const isoDateMatch = clean.match(/\b(20[2-3][0-9]-[01][0-9]-[0-3][0-9])\b/);
    if (isoDateMatch) {
      dateStr = isoDateMatch[1];
    }

    // Detect Account / Method
    const account = isJANM ? 'RHB Bank (Salary / Debit)' : inferAccountFromText(clean);

    // Extract Merchant / Counterparty
    let merchant = '';
    if (isJANM) {
      merchant = 'JANM — Gaji Bersih Bulanan (RHB)';
    } else {
      const patterns = [
        /(?:paid(?:\s+[^\s]+)?\s+to|payment(?:\s+[^\s]+)*\s+to|transfer\s+to|at|from|merchant[:\s]+)\s+([A-Za-z0-9&'’\-\.\s]{2,38}?)(?:\s+(?:via|using|with|on|ref|for|card|ending|debited|\.|,|\(|$))/i,
        /(?:to|at|from)\s+([A-Za-z0-9&'’\-\.\s]{2,32})$/i
      ];
      for (const pat of patterns) {
        const m = clean.match(pat);
        if (m && m[1]) {
          merchant = m[1].trim().replace(/[.,;:]+$/, '');
          break;
        }
      }
    }

    if (!merchant) {
      if (isIncome) {
        merchant = 'RHB Account Credit / Salary';
      } else if (account === 'DuitNow QR') {
        merchant = 'DuitNow QR Merchant';
      } else if (account === 'Touch \'n Go eWallet') {
        merchant = 'Touch \'n Go eWallet / RFID';
      } else {
        merchant = clean.slice(0, 36);
      }
    }

    const category = isJANM
      ? 'Salary & JANM (Gaji Bersih)'
      : inferCategoryFromText(merchant + ' ' + clean, type);

    return {
      id: 'smart_' + Date.now() + '_' + (indexOffset || 0) + '_' + Math.floor(Math.random() * 900),
      date: dateStr,
      description: merchant,
      category,
      account,
      type,
      amount: Number(bestAmount.toFixed(2)),
      notes: isJANM
        ? 'Auto-extracted Gaji Bersih from JANM e-Penyata Gaji / RHB'
        : `Auto-parsed: "${clean.slice(0, 75)}${clean.length > 75 ? '...' : ''}"`
    };
  }

  function parseSmartBatchInput(rawText) {
    const lines = String(rawText || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const results = [];
    lines.forEach((line, idx) => {
      const parsed = parseSingleNotificationLine(line, idx);
      if (parsed) {
        results.push(parsed);
      }
    });
    return results;
  }

  function checkUrlAutoCapture() {
    if (!window.location.search) return null;
    const params = new URLSearchParams(window.location.search);

    let capturedTx = null;
    const quickText = params.get('quick_text') || params.get('rawText') || params.get('sms');
    const amountParam = params.get('amount');

    if (quickText) {
      capturedTx = parseSingleNotificationLine(quickText, 0);
      if (capturedTx && params.get('method')) {
        capturedTx.account = params.get('method');
      }
    } else if (amountParam) {
      const amt = Math.abs(parseFloat(amountParam.replace(/[^0-9.-]/g, '')) || 0);
      if (amt > 0) {
        const desc = (params.get('merchant') || params.get('description') || 'iPhone Shortcut Payment').trim();
        const type = (params.get('type') || 'expense').toLowerCase() === 'income' ? 'income' : 'expense';
        const method = params.get('method') || params.get('account') || 'Apple Pay (RHB Visa)';
        const cat = params.get('category') || inferCategoryFromText(desc, type);
        capturedTx = {
          id: 'ios_url_' + Date.now(),
          date: params.get('date') || window.FinPulse.Data.formatDateISO(new Date()),
          description: desc,
          category: cat,
          account: method,
          type,
          amount: Number(amt.toFixed(2)),
          notes: 'Captured via iPhone Apple Shortcut link'
        };
      }
    }

    if (capturedTx) {
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    return capturedTx;
  }

  async function syncWithGoogleCloud(localTransactions) {
    const cfg = loadSyncConfig();
    if (!cfg.webAppUrl) {
      throw new Error('Please enter your Google Apps Script Web App URL first.');
    }

    const url = new URL(cfg.webAppUrl);
    if (cfg.syncToken) {
      url.searchParams.set('token', cfg.syncToken);
    }

    const getResp = await fetch(url.toString(), { method: 'GET' });
    if (!getResp.ok) {
      throw new Error(`Cloud endpoint returned HTTP ${getResp.status}`);
    }
    const cloudData = await getResp.json();
    if (!cloudData.ok) {
      throw new Error(cloudData.error || 'Cloud sync returned an error.');
    }

    const cloudTxList = Array.isArray(cloudData.transactions) ? cloudData.transactions : [];
    const cloudIds = new Set(cloudTxList.map((t) => String(t.id)));
    const localIds = new Set(localTransactions.map((t) => String(t.id)));

    const newFromCloud = cloudTxList.filter((t) => !localIds.has(String(t.id)));
    const unsyncedLocal = localTransactions.filter((t) => !cloudIds.has(String(t.id)));

    if (unsyncedLocal.length > 0) {
      await fetch(cfg.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          token: cfg.syncToken || '',
          transactions: unsyncedLocal.slice(0, 100)
        })
      });
    }

    const merged = [...newFromCloud, ...localTransactions].sort((a, b) =>
      a.date < b.date ? 1 : -1
    );

    cfg.lastSyncedAt = new Date().toISOString();
    saveSyncConfig(cfg);

    return {
      mergedTransactions: merged,
      pulledCount: newFromCloud.length,
      pushedCount: unsyncedLocal.length,
      syncedAt: cfg.lastSyncedAt
    };
  }

  window.FinPulse.Sync = {
    SAMPLE_NOTIFICATIONS,
    loadSyncConfig,
    saveSyncConfig,
    checkAndPostJANMSalary,
    parseSmartBatchInput,
    parseSingleNotificationLine,
    checkUrlAutoCapture,
    syncWithGoogleCloud
  };
})();
