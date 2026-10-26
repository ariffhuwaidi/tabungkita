(function () {
  window.FinPulse = window.FinPulse || {};

  const STORAGE_KEY_TX = 'finpulse_transactions_v2_my';
  const STORAGE_KEY_BUDGETS = 'finpulse_budgets_v2_my';
  const STORAGE_KEY_JANM = 'finpulse_janm_rule_v1';

  const CATEGORIES = {
    'Housing & Loan (LPPSA/Rent)': { type: 'expense', color: '#6366f1', defaultBudget: 1450 },
    'Groceries & Supermarket': { type: 'expense', color: '#10b981', defaultBudget: 750 },
    'Dining, Mamak & Coffee': { type: 'expense', color: '#f59e0b', defaultBudget: 500 },
    'Fuel, Toll (RFID) & Transit': { type: 'expense', color: '#3b82f6', defaultBudget: 380 },
    'Utilities (TNB, Air, Unifi, Telco)': { type: 'expense', color: '#06b6d4', defaultBudget: 320 },
    'Shopping & Online (Shopee/Lazada)': { type: 'expense', color: '#ec4899', defaultBudget: 450 },
    'Entertainment & Subscriptions': { type: 'expense', color: '#8b5cf6', defaultBudget: 200 },
    'Health, Takaful & Fitness': { type: 'expense', color: '#14b8a6', defaultBudget: 280 },
    'Balik Kampung & Travel': { type: 'expense', color: '#f43f5e', defaultBudget: 350 },
    'Salary & JANM (Gaji Bersih)': { type: 'income', color: '#10b981', defaultBudget: 0 },
    'Elaun, Bonus & Side Income': { type: 'income', color: '#34d399', defaultBudget: 0 },
    'ASB, Tabung Haji & Dividends': { type: 'income', color: '#60a5fa', defaultBudget: 0 }
  };

  const ACCOUNTS = [
    'RHB Bank (Salary / Debit)',
    'DuitNow QR',
    'Touch \'n Go eWallet',
    'Apple Pay (RHB Visa)',
    'Maybank / MAE',
    'Credit Card',
    'ASB / Tabung Haji Savings',
    'Cash Wallet'
  ];

  // Official JANM Payday typical schedule (day of month 1..12)
  // Festive months (e.g., March/April Hari Raya, Jan/Feb CNY, Oct/Nov Deepavali, Dec) are paid earlier (around 19th-22nd)
  const JANM_PAYDAY_BY_MONTH = {
    1: 23,
    2: 20,
    3: 19,
    4: 24,
    5: 23,
    6: 24,
    7: 23,
    8: 22,
    9: 24,
    10: 21,
    11: 24,
    12: 19
  };

  function getJANMPaydayForMonth(year, monthOneBased) {
    return JANM_PAYDAY_BY_MONTH[monthOneBased] || 24;
  }

  function formatDateISO(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function generateSeedTransactions() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const seed = [];
    let idCounter = 2000;

    // Generate 8 months of realistic Malaysian personal finance history (JANM -> RHB Bank, DuitNow QR, TnG, Apple Pay)
    for (let offset = 7; offset >= 0; offset--) {
      const baseDate = new Date(currentYear, currentMonth - offset, 1);
      const yr = baseDate.getFullYear();
      const mo = baseDate.getMonth();
      const monthOneBased = mo + 1;
      const maxDay = offset === 0 ? Math.max(2, now.getDate()) : 28;
      const clampDay = (d) => Math.min(d, maxDay);

      const janmPayday = getJANMPaydayForMonth(yr, monthOneBased);

      // 1. JANM Monthly Salary into RHB Bank (auto-scheduled on JANM payday if payday <= today)
      if (offset > 0 || now.getDate() >= janmPayday) {
        const ymKey = `${yr}-${String(monthOneBased).padStart(2, '0')}`;
        seed.push({
          id: `janm_auto_${ymKey}`,
          date: formatDateISO(new Date(yr, mo, janmPayday)),
          description: 'JANM — Gaji Bersih Bulanan (IBG Credit)',
          category: 'Salary & JANM (Gaji Bersih)',
          account: 'RHB Bank (Salary / Debit)',
          type: 'income',
          amount: 4850.00,
          notes: `Auto-detected JANM Jadual Gaji (${ymKey}) -> RHB Bank`
        });
      }

      // Occasional Bantuan Khas / Elaun / Side Income
      if (offset === 2 || offset === 6) {
        seed.push({
          id: `tx_${idCounter++}`,
          date: formatDateISO(new Date(yr, mo, clampDay(15))),
          description: offset === 2 ? 'JANM — Bayaran Insentif / Elaun Khas' : 'Tuntutan Perjalanan & Kerja Lebih Masa',
          category: 'Elaun, Bonus & Side Income',
          account: 'RHB Bank (Salary / Debit)',
          type: 'income',
          amount: offset === 2 ? 1000.00 : 420.00,
          notes: 'Kredit terus ke akaun RHB'
        });
      }

      // ASB / Tabung Haji / Hibah yield
      seed.push({
        id: `tx_${idCounter++}`,
        date: formatDateISO(new Date(yr, mo, clampDay(27))),
        description: 'Simpanan & Pulangan ASB / Tabung Haji',
        category: 'ASB, Tabung Haji & Dividends',
        account: 'ASB / Tabung Haji Savings',
        type: 'income',
        amount: Number((125.00 + offset * 5.5).toFixed(2)),
        notes: 'Dividen / Hibah bulanan'
      });

      // Fixed Housing / LPPSA / Sewa
      seed.push({
        id: `tx_${idCounter++}`,
        date: formatDateISO(new Date(yr, mo, clampDay(3))),
        description: 'Ansuran Perumahan / Sewa Rumah',
        category: 'Housing & Loan (LPPSA/Rent)',
        account: 'RHB Bank (Salary / Debit)',
        type: 'expense',
        amount: 1400.00,
        notes: 'Potongan bulanan RHB IBG'
      });

      // Utilities (TNB, Unifi, Air, CelcomDigi/Maxis)
      seed.push({
        id: `tx_${idCounter++}`,
        date: formatDateISO(new Date(yr, mo, clampDay(6))),
        description: 'TNB Elektrik, TM Unifi & Bil Air (JomPAY)',
        category: 'Utilities (TNB, Air, Unifi, Telco)',
        account: 'RHB Bank (Salary / Debit)',
        type: 'expense',
        amount: Number((265 + (offset % 3) * 18.5).toFixed(2)),
        notes: 'Bayaran bil JomPAY via RHB'
      });

      // Groceries (Jaya Grocer, Lotus's, Mydin, 99 Speedmart)
      const groceryTrips = [
        { day: 4, merchant: 'Lotus\'s Hypermarket', amt: 215.40 + offset * 4, account: 'Apple Pay (RHB Visa)' },
        { day: 11, merchant: 'Jaya Grocer', amt: 168.80 + (offset % 4) * 11, account: 'Apple Pay (RHB Visa)' },
        { day: 18, merchant: 'Mydin Wholesale & Pasar Segar', amt: 184.20 - (offset % 3) * 9, account: 'DuitNow QR' },
        { day: 25, merchant: '99 Speedmart (Barangan Dapur)', amt: 74.50, account: 'DuitNow QR' }
      ];
      groceryTrips.forEach((trip) => {
        if (trip.day <= maxDay || offset > 0) {
          seed.push({
            id: `tx_${idCounter++}`,
            date: formatDateISO(new Date(yr, mo, clampDay(trip.day))),
            description: trip.merchant,
            category: 'Groceries & Supermarket',
            account: trip.account,
            type: 'expense',
            amount: Number(trip.amt.toFixed(2)),
            notes: 'Barangan dapur'
          });
        }
      });

      // Dining, Mamak & Coffee (DuitNow QR & Apple Pay)
      const diningList = [
        { day: 5, merchant: 'ZUS Coffee (DuitNow QR)', amt: 14.90, account: 'DuitNow QR', notes: 'Scanned merchant DuitNow QR' },
        { day: 9, merchant: 'Restoran Nasi Kandar Pelita', amt: 28.50 + (offset % 3) * 6, account: 'DuitNow QR', notes: 'Makan malam QR Pay' },
        { day: 14, merchant: 'Nando\'s / Family Dinner', amt: 118.60, account: 'Apple Pay (RHB Visa)', notes: 'iPhone Apple Pay tap' },
        { day: 21, merchant: 'Gerai Makan Tengahari & Kopi', amt: 19.00, account: 'Touch \'n Go eWallet', notes: 'QR eWallet scan' }
      ];
      diningList.forEach((item) => {
        if (item.day <= maxDay || offset > 0) {
          seed.push({
            id: `tx_${idCounter++}`,
            date: formatDateISO(new Date(yr, mo, clampDay(item.day))),
            description: item.merchant,
            category: 'Dining, Mamak & Coffee',
            account: item.account,
            type: 'expense',
            amount: Number(item.amt.toFixed(2)),
            notes: item.notes
          });
        }
      });

      // Fuel, Toll (RFID) & Transit
      seed.push({
        id: `tx_${idCounter++}`,
        date: formatDateISO(new Date(yr, mo, clampDay(8))),
        description: 'Petronas RON95 & Touch \'n Go RFID Tol',
        category: 'Fuel, Toll (RFID) & Transit',
        account: 'Touch \'n Go eWallet',
        type: 'expense',
        amount: Number((240.00 + (offset % 4) * 25).toFixed(2)),
        notes: 'Minyak & Tol RFID'
      });

      // Shopping & Online (Shopee / Lazada)
      if (offset % 2 === 1 || offset === 0) {
        seed.push({
          id: `tx_${idCounter++}`,
          date: formatDateISO(new Date(yr, mo, clampDay(13))),
          description: offset === 0 ? 'Shopee Malaysia — Keperluan Rumah (FPX RHB)' : 'Uniqlo & Watsons (Apple Pay)',
          category: 'Shopping & Online (Shopee/Lazada)',
          account: offset === 0 ? 'RHB Bank (Salary / Debit)' : 'Apple Pay (RHB Visa)',
          type: 'expense',
          amount: Number((195 + (offset % 3) * 65).toFixed(2)),
          notes: 'Belian online / mall'
        });
      }

      // Health, Takaful & Fitness
      seed.push({
        id: `tx_${idCounter++}`,
        date: formatDateISO(new Date(yr, mo, clampDay(7))),
        description: 'Caruman Takaful Perubatan & Farmasi Caring',
        category: 'Health, Takaful & Fitness',
        account: 'RHB Bank (Salary / Debit)',
        type: 'expense',
        amount: 220.00,
        notes: 'Autodebit RHB Takaful'
      });

      // Entertainment & Subscriptions
      seed.push({
        id: `tx_${idCounter++}`,
        date: formatDateISO(new Date(yr, mo, clampDay(16))),
        description: 'Netflix, Spotify & TGV Cinemas',
        category: 'Entertainment & Subscriptions',
        account: 'Apple Pay (RHB Visa)',
        type: 'expense',
        amount: Number((85.00 + (offset % 3) * 28).toFixed(2)),
        notes: 'Langganan bulanan'
      });
    }

    return seed.sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function getDefaultBudgets() {
    const budgets = {};
    Object.keys(CATEGORIES).forEach((cat) => {
      if (CATEGORIES[cat].type === 'expense') {
        budgets[cat] = CATEGORIES[cat].defaultBudget;
      }
    });
    return budgets;
  }

  function loadJANMRule() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_JANM);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read JANM rule:', err);
    }
    const defaultRule = {
      enabled: true,
      netAmount: 4850.00,
      account: 'RHB Bank (Salary / Debit)',
      scheduleMode: 'janm_official', // 'janm_official' or 'fixed_day'
      fixedDay: 24,
      description: 'JANM — Gaji Bersih Bulanan (IBG Credit)'
    };
    saveJANMRule(defaultRule);
    return defaultRule;
  }

  function saveJANMRule(rule) {
    try {
      localStorage.setItem(STORAGE_KEY_JANM, JSON.stringify(rule));
    } catch (err) {
      console.warn('Could not save JANM rule:', err);
    }
  }

  function loadTransactions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TX);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read transactions from localStorage:', err);
    }
    const seed = generateSeedTransactions();
    saveTransactions(seed);
    return seed;
  }

  function saveTransactions(list) {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(list));
    } catch (err) {
      console.warn('Could not save transactions to localStorage:', err);
    }
  }

  function resetTransactionsToSeed() {
    const seed = generateSeedTransactions();
    saveTransactions(seed);
    const defaultBudgets = getDefaultBudgets();
    saveBudgets(defaultBudgets);
    return { transactions: seed, budgets: defaultBudgets };
  }

  function loadBudgets() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (raw) {
        return { ...getDefaultBudgets(), ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('Could not load budgets:', err);
    }
    const defaults = getDefaultBudgets();
    saveBudgets(defaults);
    return defaults;
  }

  function saveBudgets(budgets) {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    } catch (err) {
      console.warn('Could not save budgets:', err);
    }
  }

  window.FinPulse.Data = {
    CATEGORIES,
    ACCOUNTS,
    JANM_PAYDAY_BY_MONTH,
    getJANMPaydayForMonth,
    loadJANMRule,
    saveJANMRule,
    loadTransactions,
    saveTransactions,
    resetTransactionsToSeed,
    loadBudgets,
    saveBudgets,
    formatDateISO
  };
})();
