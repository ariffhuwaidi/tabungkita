(function () {
  const { Data, Charts, Export, Sync } = window.FinPulse;

  const state = {
    transactions: [],
    budgets: {},
    parsedStaging: [],
    activeView: 'dashboard',
    trendMode: 'area',
    pieMode: 'donut',
    filters: {
      search: '',
      preset: '6m',
      dateFrom: '',
      dateTo: '',
      type: 'all',
      category: 'all',
      account: 'all'
    },
    sort: {
      field: 'date',
      dir: 'desc'
    },
    pagination: {
      page: 1,
      pageSize: 10
    }
  };

  // DOM References
  const els = {
    appShell: document.getElementById('appShell'),
    btnSidebarToggle: document.getElementById('btnSidebarToggle'),
    salutationPrefix: document.getElementById('salutationPrefix'),
    userNicknameDisplay: document.getElementById('userNicknameDisplay'),
    btnEditNickname: document.getElementById('btnEditNickname'),

    btnAuthOpen: document.getElementById('btnAuthOpen'),
    authStatusDot: document.getElementById('authStatusDot'),
    authAccountLabel: document.getElementById('authAccountLabel'),
    authModal: document.getElementById('authModal'),
    btnCloseAuthModal: document.getElementById('btnCloseAuthModal'),
    btnCancelAuthModal: document.getElementById('btnCancelAuthModal'),
    btnSignInApple: document.getElementById('btnSignInApple'),
    btnSignInGoogle: document.getElementById('btnSignInGoogle'),
    authProfileForm: document.getElementById('authProfileForm'),
    authNicknameInput: document.getElementById('authNicknameInput'),
    authEmailInput: document.getElementById('authEmailInput'),
    authConnectedInfo: document.getElementById('authConnectedInfo'),
    authConnectedBadge: document.getElementById('authConnectedBadge'),
    btnSignOutAccount: document.getElementById('btnSignOutAccount'),

    navItems: document.querySelectorAll('.nav-item'),
    pageTitle: document.getElementById('pageTitle'),
    activeFilterSummary: document.getElementById('activeFilterSummary'),
    viewDashboard: document.getElementById('viewDashboard'),
    viewTransactions: document.getElementById('viewTransactions'),
    viewBudgets: document.getElementById('viewBudgets'),
    viewSync: document.getElementById('viewSync'),
    btnQuickSmartCapture: document.getElementById('btnQuickSmartCapture'),

    smartParserInput: document.getElementById('smartParserInput'),
    btnLoadSampleAlerts: document.getElementById('btnLoadSampleAlerts'),
    btnParsePreview: document.getElementById('btnParsePreview'),
    btnCommitParsed: document.getElementById('btnCommitParsed'),
    smartParserPreviewWrap: document.getElementById('smartParserPreviewWrap'),
    smartParserPreviewBody: document.getElementById('smartParserPreviewBody'),

    janmStatusBadge: document.getElementById('janmStatusBadge'),
    janmNetAmount: document.getElementById('janmNetAmount'),
    janmScheduleMode: document.getElementById('janmScheduleMode'),
    janmFixedDay: document.getElementById('janmFixedDay'),
    janmAutoEnabled: document.getElementById('janmAutoEnabled'),
    janmCurrentMonthInfo: document.getElementById('janmCurrentMonthInfo'),
    btnSaveJANMRule: document.getElementById('btnSaveJANMRule'),
    btnPostJANMNow: document.getElementById('btnPostJANMNow'),

    btnSimApplePay: document.getElementById('btnSimApplePay'),
    btnSimQRPay: document.getElementById('btnSimQRPay'),
    btnSimSalary: document.getElementById('btnSimSalary'),

    syncWebAppUrl: document.getElementById('syncWebAppUrl'),
    syncTokenInput: document.getElementById('syncTokenInput'),
    syncStatusText: document.getElementById('syncStatusText'),
    btnSyncGoogleNow: document.getElementById('btnSyncGoogleNow'),
    btnCopyAppsScript: document.getElementById('btnCopyAppsScript'),

    filterSearch: document.getElementById('filterSearch'),
    filterPreset: document.getElementById('filterPreset'),
    filterDateFrom: document.getElementById('filterDateFrom'),
    filterDateTo: document.getElementById('filterDateTo'),
    filterType: document.getElementById('filterType'),
    filterCategory: document.getElementById('filterCategory'),
    filterAccount: document.getElementById('filterAccount'),
    btnClearFilters: document.getElementById('btnClearFilters'),

    kpiIncome: document.getElementById('kpiIncome'),
    kpiIncomeMeta: document.getElementById('kpiIncomeMeta'),
    kpiExpense: document.getElementById('kpiExpense'),
    kpiExpenseMeta: document.getElementById('kpiExpenseMeta'),
    kpiNet: document.getElementById('kpiNet'),
    kpiNetMeta: document.getElementById('kpiNetMeta'),
    kpiSavingsRate: document.getElementById('kpiSavingsRate'),
    kpiTopCategory: document.getElementById('kpiTopCategory'),

    cashFlowAreaChart: document.getElementById('cashFlowAreaChart'),
    categoryDonutChart: document.getElementById('categoryDonutChart'),
    categoryLegend: document.getElementById('categoryLegend'),
    monthlyBarChart: document.getElementById('monthlyBarChart'),
    budgetBarChart: document.getElementById('budgetBarChart'),
    trendChartTypeToggle: document.getElementById('trendChartTypeToggle'),
    pieChartTypeToggle: document.getElementById('pieChartTypeToggle'),

    tableCountLabel: document.getElementById('tableCountLabel'),
    pageSizeSelect: document.getElementById('pageSizeSelect'),
    transactionsTable: document.getElementById('transactionsTable'),
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    paginationInfo: document.getElementById('paginationInfo'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),

    budgetsGrid: document.getElementById('budgetsGrid'),

    btnAddTransaction: document.getElementById('btnAddTransaction'),
    transactionModal: document.getElementById('transactionModal'),
    modalTitle: document.getElementById('modalTitle'),
    transactionForm: document.getElementById('transactionForm'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    txId: document.getElementById('txId'),
    txType: document.getElementById('txType'),
    txDate: document.getElementById('txDate'),
    txAmount: document.getElementById('txAmount'),
    txCategory: document.getElementById('txCategory'),
    txDescription: document.getElementById('txDescription'),
    txAccount: document.getElementById('txAccount'),
    txNotes: document.getElementById('txNotes'),

    btnExportCSV: document.getElementById('btnExportCSV'),
    btnExportPDF: document.getElementById('btnExportPDF'),
    btnExportCSVTable: document.getElementById('btnExportCSVTable'),
    btnExportPDFTable: document.getElementById('btnExportPDFTable'),
    csvImportInput: document.getElementById('csvImportInput'),
    btnResetDemo: document.getElementById('btnResetDemo'),
    btnThemeToggle: document.getElementById('btnThemeToggle'),
    btnMobileThemeToggle: document.getElementById('btnMobileThemeToggle'),
    themeToggleLabel: document.getElementById('themeToggleLabel'),
    toastContainer: document.getElementById('toastContainer')
  };

  const STORAGE_KEY_PROFILE = 'tabungkita_user_profile_v1';
  const STORAGE_KEY_SIDEBAR = 'tabungkita_sidebar_collapsed_v1';
  const STORAGE_KEY_THEME = 'tabungkita_theme_pref_v1';

  function getDeviceSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (els.themeToggleLabel) {
      els.themeToggleLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
  }

  function initThemeFromDeviceSettings() {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    const activeTheme = saved === 'dark' || saved === 'light' ? saved : getDeviceSystemTheme();
    applyTheme(activeTheme);

    // Automatically follow OS / iPhone dark-light mode changes when no manual override is locked
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e) => {
        if (!localStorage.getItem(STORAGE_KEY_THEME)) {
          applyTheme(e.matches ? 'dark' : 'light');
          renderAll();
        }
      };
      if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', handleSystemChange);
      } else if (typeof mq.addListener === 'function') {
        mq.addListener(handleSystemChange);
      }
    }
  }

  function toggleThemeManual() {
    const current = document.documentElement.getAttribute('data-theme') || getDeviceSystemTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    // If the user switches back to match their device's native setting, clear manual override so it stays synced with OS
    if (next === getDeviceSystemTheme()) {
      localStorage.removeItem(STORAGE_KEY_THEME);
    } else {
      localStorage.setItem(STORAGE_KEY_THEME, next);
    }
    applyTheme(next);
    renderAll();
  }

  function loadUserProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn('Could not load user profile:', err);
    }
    return {
      nickname: 'Amir',
      email: '',
      provider: null // 'apple' | 'google' | null
    };
  }

  function saveUserProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('Could not save user profile:', err);
    }
  }

  function getTimeOfDayGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  function renderSalutationAndAuth() {
    const profile = loadUserProfile();
    if (els.salutationPrefix) {
      els.salutationPrefix.textContent = getTimeOfDayGreeting();
    }
    if (els.userNicknameDisplay) {
      els.userNicknameDisplay.textContent = profile.nickname || 'Amir';
    }

    if (els.authStatusDot && els.authAccountLabel) {
      if (profile.provider) {
        els.authStatusDot.classList.add('connected');
        const provName = profile.provider === 'apple' ? 'Apple ID' : 'Google';
        els.authAccountLabel.textContent = `${provName} • ${profile.nickname}`;
      } else {
        els.authStatusDot.classList.remove('connected');
        els.authAccountLabel.textContent = 'Sign in with Apple / Google';
      }
    }

    if (els.authNicknameInput) els.authNicknameInput.value = profile.nickname || 'Amir';
    if (els.authEmailInput) els.authEmailInput.value = profile.email || '';

    if (els.authConnectedInfo && els.authConnectedBadge && els.btnSignOutAccount) {
      if (profile.provider) {
        els.authConnectedInfo.hidden = false;
        els.btnSignOutAccount.hidden = false;
        els.authConnectedBadge.textContent =
          profile.provider === 'apple'
            ? `Connected via Apple ID (${profile.email || 'iCloud Auto-Capture'})`
            : `Connected via Google Account (${profile.email || 'Gmail & Sheets Sync'})`;
      } else {
        els.authConnectedInfo.hidden = true;
        els.btnSignOutAccount.hidden = true;
      }
    }
  }

  function initSidebarState() {
    if (!els.appShell) return;
    const isCollapsed = localStorage.getItem(STORAGE_KEY_SIDEBAR) === 'true';
    els.appShell.classList.toggle('sidebar-collapsed', isCollapsed);
  }

  function toggleSidebar() {
    if (!els.appShell) return;
    const nextState = !els.appShell.classList.contains('sidebar-collapsed');
    els.appShell.classList.toggle('sidebar-collapsed', nextState);
    localStorage.setItem(STORAGE_KEY_SIDEBAR, String(nextState));
    setTimeout(() => {
      renderAll();
    }, 300);
  }

  function openAuthModal() {
    renderSalutationAndAuth();
    if (els.authModal) {
      els.authModal.hidden = false;
      if (els.authNicknameInput) els.authNicknameInput.focus();
    }
  }

  function closeAuthModal() {
    if (els.authModal) els.authModal.hidden = true;
  }

  function handleProviderSignIn(provider) {
    const current = loadUserProfile();
    const nickname = (els.authNicknameInput && els.authNicknameInput.value.trim()) || current.nickname || 'Amir';
    const defaultDomain = provider === 'apple' ? 'icloud.com' : 'gmail.com';
    const enteredEmail = els.authEmailInput && els.authEmailInput.value.trim();
    const email = enteredEmail || `${nickname.toLowerCase().replace(/[^a-z0-9]/g, '')}@${defaultDomain}`;

    const updated = {
      nickname,
      email,
      provider
    };
    saveUserProfile(updated);
    renderSalutationAndAuth();
    closeAuthModal();

    const providerLabel = provider === 'apple' ? 'Apple ID (iCloud & Wallet)' : 'Google Account (Gmail & Sheets)';
    showToast(`Signed in with ${providerLabel} as ${nickname}`);
  }

  function init() {
    state.transactions = Data.loadTransactions();
    state.budgets = Data.loadBudgets();

    initThemeFromDeviceSettings();
    initSidebarState();
    renderSalutationAndAuth();

    // 1. Check JANM -> RHB Bank Silent Salary Auto-Detector
    if (Sync && typeof Sync.checkAndPostJANMSalary === 'function') {
      const janmCheck = Sync.checkAndPostJANMSalary(state.transactions, false);
      if (janmCheck.posted && janmCheck.transaction) {
        state.transactions.unshift(janmCheck.transaction);
        Data.saveTransactions(state.transactions);
        setTimeout(() => {
          showToast(
            `JANM Payday Auto-Detected: Credited ${Charts.formatCurrency(janmCheck.transaction.amount)} into RHB Bank!`
          );
        }, 300);
      }
    }

    // 2. Check if an iPhone Apple Shortcut deep-linked a transaction via URL query params
    if (Sync && typeof Sync.checkUrlAutoCapture === 'function') {
      const autoCaptured = Sync.checkUrlAutoCapture();
      if (autoCaptured) {
        state.transactions.unshift(autoCaptured);
        Data.saveTransactions(state.transactions);
        setTimeout(() => {
          showToast(`Auto-captured from iPhone Shortcut: ${autoCaptured.description} (${Charts.formatCurrency(autoCaptured.amount)})`);
        }, 250);
      }
    }

    initSyncSettingsUI();
    populateSelectOptions();
    applyDatePreset(state.filters.preset);
    bindEvents();
    renderAll();
  }

  function initSyncSettingsUI() {
    if (!Sync) return;
    const cfg = Sync.loadSyncConfig();
    if (els.syncWebAppUrl) els.syncWebAppUrl.value = cfg.webAppUrl || '';
    if (els.syncTokenInput) els.syncTokenInput.value = cfg.syncToken || '';
    if (els.syncStatusText) {
      els.syncStatusText.textContent = cfg.lastSyncedAt
        ? `Last synced: ${new Date(cfg.lastSyncedAt).toLocaleString()}`
        : 'Not synced yet — paste Web App URL above';
    }

    // Populate JANM -> RHB Rule inputs & status
    const rule = Data.loadJANMRule();
    if (els.janmNetAmount) els.janmNetAmount.value = Number(rule.netAmount || 4850).toFixed(2);
    if (els.janmScheduleMode) els.janmScheduleMode.value = rule.scheduleMode || 'janm_official';
    if (els.janmFixedDay) els.janmFixedDay.value = rule.fixedDay || 24;
    if (els.janmAutoEnabled) els.janmAutoEnabled.value = rule.enabled ? 'true' : 'false';
    updateJANMStatusBanner();
  }

  function updateJANMStatusBanner() {
    if (!els.janmCurrentMonthInfo || !Sync) return;
    const rule = Data.loadJANMRule();
    const check = Sync.checkAndPostJANMSalary(state.transactions, false);
    const now = new Date();
    const ymKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const payday =
      rule.scheduleMode === 'fixed_day'
        ? rule.fixedDay
        : Data.getJANMPaydayForMonth(now.getFullYear(), now.getMonth() + 1);

    if (els.janmStatusBadge) {
      els.janmStatusBadge.textContent = rule.enabled
        ? 'Active — Auto-Payday Enabled'
        : 'Manual Confirmation Mode';
    }

    if (check.alreadyExists) {
      els.janmCurrentMonthInfo.innerHTML = `<span style="color:var(--color-income);font-weight:600;">✓ ${ymKey} JANM Gaji Bersih (${Charts.formatCurrency(rule.netAmount)}) is already recorded in RHB Bank</span> (Payday: ${payday}/${now.getMonth() + 1}/${now.getFullYear()}).`;
    } else {
      els.janmCurrentMonthInfo.innerHTML = `Scheduled JANM Payday for <strong>${ymKey}</strong>: <strong>Day ${payday}</strong> — Target: <strong>${Charts.formatCurrency(rule.netAmount)} → RHB Bank (Salary / Debit)</strong>.`;
    }
  }

  function populateSelectOptions() {
    const categories = Object.keys(Data.CATEGORIES);
    els.filterCategory.innerHTML =
      '<option value="all">All Categories</option>' +
      categories.map((c) => `<option value="${Export.escapeHtml(c)}">${Export.escapeHtml(c)}</option>`).join('');

    els.filterAccount.innerHTML =
      '<option value="all">All Accounts</option>' +
      Data.ACCOUNTS.map((a) => `<option value="${Export.escapeHtml(a)}">${Export.escapeHtml(a)}</option>`).join('');

    syncModalCategories('expense');
  }

  function syncModalCategories(txType) {
    const allCats = Object.keys(Data.CATEGORIES);
    const matching = allCats.filter((c) => Data.CATEGORIES[c].type === txType);
    const list = matching.length > 0 ? matching : allCats;
    els.txCategory.innerHTML = list
      .map((c) => `<option value="${Export.escapeHtml(c)}">${Export.escapeHtml(c)}</option>`)
      .join('');
  }

  function applyDatePreset(preset) {
    const now = new Date();
    const todayStr = Data.formatDateISO(now);
    let fromStr = '';
    let toStr = todayStr;

    if (preset === 'all') {
      fromStr = '';
      toStr = '';
    } else if (preset === '30d') {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      fromStr = Data.formatDateISO(d);
    } else if (preset === '90d') {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
      fromStr = Data.formatDateISO(d);
    } else if (preset === '6m') {
      const d = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      fromStr = Data.formatDateISO(d);
    } else if (preset === 'ytd') {
      fromStr = `${now.getFullYear()}-01-01`;
    } else if (preset === '12m') {
      const d = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      fromStr = Data.formatDateISO(d);
    } else if (preset === 'custom') {
      return;
    }

    state.filters.dateFrom = fromStr;
    state.filters.dateTo = toStr;
    els.filterDateFrom.value = fromStr;
    els.filterDateTo.value = toStr;
  }

  function getFilteredTransactions() {
    const { search, dateFrom, dateTo, type, category, account } = state.filters;
    const q = search.trim().toLowerCase();

    const filtered = state.transactions.filter((tx) => {
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;
      if (type !== 'all' && tx.type !== type) return false;
      if (category !== 'all' && tx.category !== category) return false;
      if (account !== 'all' && tx.account !== account) return false;
      if (q) {
        const hay = `${tx.description} ${tx.category} ${tx.account} ${tx.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const { field, dir } = state.sort;
    const mult = dir === 'asc' ? 1 : -1;

    return filtered.sort((a, b) => {
      if (field === 'amount') {
        return (Number(a.amount) - Number(b.amount)) * mult;
      }
      const va = String(a[field] || '').toLowerCase();
      const vb = String(b[field] || '').toLowerCase();
      if (va < vb) return -1 * mult;
      if (va > vb) return 1 * mult;
      return 0;
    });
  }

  function computeAnalytics(filtered) {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const monthMap = {};
    const categoryTotals = {};
    const distinctMonths = new Set();

    filtered.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const ym = (tx.date || '').slice(0, 7);
      if (ym) {
        distinctMonths.add(ym);
        if (!monthMap[ym]) {
          monthMap[ym] = { ym, income: 0, expense: 0 };
        }
      }

      if (tx.type === 'income') {
        totalIncome += amt;
        incomeCount++;
        if (ym) monthMap[ym].income += amt;
      } else {
        totalExpense += amt;
        expenseCount++;
        if (ym) monthMap[ym].expense += amt;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
      }
    });

    const netCashFlow = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const sortedMonths = Object.keys(monthMap).sort();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySeries = sortedMonths.map((ym) => {
      const [yr, mo] = ym.split('-');
      const mIdx = Math.max(0, Math.min(11, parseInt(mo, 10) - 1));
      const inc = Number(monthMap[ym].income.toFixed(2));
      const exp = Number(monthMap[ym].expense.toFixed(2));
      return {
        ym,
        label: `${monthNames[mIdx]} '${yr.slice(2)}`,
        income: inc,
        expense: exp,
        net: Number((inc - exp).toFixed(2))
      };
    });

    const paletteFallback = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e'];
    const categorySeries = Object.keys(categoryTotals)
      .map((cat, idx) => {
        const amount = Number(categoryTotals[cat].toFixed(2));
        const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : '0.0';
        const color = (Data.CATEGORIES[cat] && Data.CATEGORIES[cat].color) || paletteFallback[idx % paletteFallback.length];
        return { category: cat, amount, pct, color };
      })
      .sort((a, b) => b.amount - a.amount);

    const activeMonthCount = Math.max(1, distinctMonths.size);
    const expenseCategories = Object.keys(Data.CATEGORIES).filter(
      (c) => Data.CATEGORIES[c].type === 'expense'
    );

    const budgetSeries = expenseCategories
      .map((cat) => {
        const totalCatSpend = categoryTotals[cat] || 0;
        const monthlyAvg = totalCatSpend / activeMonthCount;
        const budget = Number(state.budgets[cat] || Data.CATEGORIES[cat].defaultBudget || 0);
        return {
          category: cat,
          totalSpend: totalCatSpend,
          monthlyAvg,
          budget,
          color: Data.CATEGORIES[cat].color
        };
      })
      .sort((a, b) => b.monthlyAvg - a.monthlyAvg);

    return {
      kpis: {
        totalIncome,
        totalExpense,
        netCashFlow,
        savingsRate,
        incomeCount,
        expenseCount,
        topCategory: categorySeries[0] || null
      },
      monthlySeries,
      categorySeries,
      budgetSeries,
      activeMonthCount
    };
  }

  function buildFilterSummaryText(count) {
    const parts = [];
    const { dateFrom, dateTo, type, category, account, search } = state.filters;
    if (dateFrom || dateTo) {
      parts.push(`Period: ${dateFrom || 'Start'} to ${dateTo || 'Present'}`);
    } else {
      parts.push('Period: All Time');
    }
    if (type !== 'all') parts.push(`Type: ${type}`);
    if (category !== 'all') parts.push(`Category: ${category}`);
    if (account !== 'all') parts.push(`Account: ${account}`);
    if (search) parts.push(`Search: "${search}"`);
    return `${parts.join(' • ')} (${count} transactions)`;
  }

  function renderAll() {
    const filtered = getFilteredTransactions();
    const analytics = computeAnalytics(filtered);
    const summaryText = buildFilterSummaryText(filtered.length);

    els.activeFilterSummary.textContent = summaryText;
    renderKPIs(analytics.kpis);
    renderCharts(analytics);
    renderCategoryLegend(analytics.categorySeries);
    renderTable(filtered);
    renderBudgetsView(analytics.budgetSeries, analytics.activeMonthCount);
    updateJANMStatusBanner();
  }

  function renderKPIs(kpis) {
    const fmt = Charts.formatCurrency;
    els.kpiIncome.textContent = fmt(kpis.totalIncome);
    els.kpiIncomeMeta.textContent = `${kpis.incomeCount} income transaction${kpis.incomeCount === 1 ? '' : 's'}`;

    els.kpiExpense.textContent = fmt(kpis.totalExpense);
    els.kpiExpenseMeta.textContent = `${kpis.expenseCount} expense transaction${kpis.expenseCount === 1 ? '' : 's'}`;

    els.kpiNet.textContent = (kpis.netCashFlow >= 0 ? '+' : '') + fmt(kpis.netCashFlow);
    els.kpiNet.style.color = kpis.netCashFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)';
    els.kpiNetMeta.textContent = kpis.netCashFlow >= 0 ? 'Positive net cash flow' : 'Net deficit in period';

    els.kpiSavingsRate.textContent = `${kpis.savingsRate.toFixed(1)}%`;
    els.kpiTopCategory.textContent = kpis.topCategory
      ? `Top spend: ${kpis.topCategory.category} (${kpis.topCategory.pct}%)`
      : 'Top spend: —';
  }

  function renderCharts(analytics) {
    if (state.activeView !== 'dashboard') return;

    Charts.renderCashFlowTrend(
      els.cashFlowAreaChart,
      analytics.monthlySeries,
      state.trendMode
    );

    Charts.renderCategoryDonut(
      els.categoryDonutChart,
      analytics.categorySeries,
      state.pieMode,
      (clickedCategory) => {
        toggleCategoryFilter(clickedCategory);
      },
      state.filters.category
    );

    Charts.renderMonthlyBarChart(
      els.monthlyBarChart,
      analytics.monthlySeries
    );

    Charts.renderBudgetComparisonChart(
      els.budgetBarChart,
      analytics.budgetSeries
    );
  }

  function renderCategoryLegend(categorySeries) {
    if (!els.categoryLegend) return;
    if (categorySeries.length === 0) {
      els.categoryLegend.innerHTML = '<div style="color:var(--text-muted);font-size:0.82rem;">No expenses in selected range.</div>';
      return;
    }

    els.categoryLegend.innerHTML = categorySeries
      .map((item) => {
        const isActive = state.filters.category === item.category;
        return `
          <div class="legend-item ${isActive ? 'active-filter' : ''}" data-cat="${Export.escapeHtml(item.category)}" title="Click to filter by ${Export.escapeHtml(item.category)}">
            <div class="legend-left">
              <span class="legend-swatch" style="background:${item.color}"></span>
              <span>${Export.escapeHtml(item.category)}</span>
            </div>
            <div class="legend-right">
              ${Charts.formatCurrency(item.amount)}
              <span class="legend-pct">${item.pct}%</span>
            </div>
          </div>
        `;
      })
      .join('');

    els.categoryLegend.querySelectorAll('.legend-item').forEach((row) => {
      row.addEventListener('click', () => {
        const cat = row.getAttribute('data-cat');
        toggleCategoryFilter(cat);
      });
    });
  }

  function toggleCategoryFilter(categoryName) {
    if (state.filters.category === categoryName) {
      state.filters.category = 'all';
    } else {
      state.filters.category = categoryName;
    }
    els.filterCategory.value = state.filters.category;
    state.pagination.page = 1;
    renderAll();
  }

  function renderTable(filtered) {
    const total = filtered.length;
    const pageSize = state.pagination.pageSize;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (state.pagination.page > totalPages) state.pagination.page = totalPages;

    const startIdx = (state.pagination.page - 1) * pageSize;
    const pageItems = filtered.slice(startIdx, startIdx + pageSize);

    els.tableCountLabel.textContent = `Showing ${pageItems.length} of ${total} matching transactions`;
    els.paginationInfo.textContent = `Page ${state.pagination.page} of ${totalPages} (${total} total)`;
    els.btnPrevPage.disabled = state.pagination.page <= 1;
    els.btnNextPage.disabled = state.pagination.page >= totalPages;

    if (pageItems.length === 0) {
      els.transactionsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:2rem;color:var(--text-secondary);">
            No transactions match your current filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    els.transactionsTableBody.innerHTML = pageItems
      .map((tx) => {
        const catInfo = Data.CATEGORIES[tx.category] || { color: '#6366f1' };
        const sign = tx.type === 'income' ? '+' : '-';
        const amountClass = tx.type === 'income' ? 'amount-income' : 'amount-expense';
        return `
          <tr>
            <td>${Export.escapeHtml(tx.date)}</td>
            <td>
              <div style="font-weight:600;">${Export.escapeHtml(tx.description)}</div>
              ${tx.notes ? `<div style="font-size:0.75rem;color:var(--text-secondary);">${Export.escapeHtml(tx.notes)}</div>` : ''}
            </td>
            <td>
              <span class="cat-badge">
                <span class="legend-swatch" style="background:${catInfo.color}"></span>
                ${Export.escapeHtml(tx.category)}
              </span>
            </td>
            <td>${Export.escapeHtml(tx.account)}</td>
            <td><span class="type-pill type-${tx.type}">${tx.type}</span></td>
            <td class="text-right ${amountClass}">${sign}${Charts.formatCurrency(tx.amount)}</td>
            <td class="text-right">
              <div class="row-actions">
                <button class="action-icon-btn edit" data-id="${Export.escapeHtml(tx.id)}" title="Edit transaction">Edit</button>
                <button class="action-icon-btn delete" data-id="${Export.escapeHtml(tx.id)}" title="Delete transaction">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    els.transactionsTableBody.querySelectorAll('.action-icon-btn.edit').forEach((btn) => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    els.transactionsTableBody.querySelectorAll('.action-icon-btn.delete').forEach((btn) => {
      btn.addEventListener('click', () => deleteTransaction(btn.getAttribute('data-id')));
    });
  }

  function renderBudgetsView(budgetSeries, activeMonthCount) {
    if (!els.budgetsGrid) return;
    els.budgetsGrid.innerHTML = budgetSeries
      .map((b) => {
        const pct = b.budget > 0 ? Math.min(100, Math.round((b.monthlyAvg / b.budget) * 100)) : 0;
        const rawPct = b.budget > 0 ? Math.round((b.monthlyAvg / b.budget) * 100) : 0;
        const isOver = b.budget > 0 && b.monthlyAvg > b.budget;
        const barColor = isOver ? 'var(--color-expense)' : b.color;
        return `
          <div class="budget-item">
            <div class="budget-top">
              <span class="budget-cat-name">
                <span class="legend-swatch" style="background:${b.color}"></span>
                ${Export.escapeHtml(b.category)}
              </span>
              <div class="budget-input-wrap">
                <span>Limit RM</span>
                <input type="number" min="0" step="10" data-budget-cat="${Export.escapeHtml(b.category)}" value="${b.budget}" />
              </div>
            </div>
            <div class="budget-progress-track">
              <div class="budget-progress-bar" style="width:${pct}%;background:${barColor}"></div>
            </div>
            <div class="budget-stats">
              <span>Avg/mo: <strong>${Charts.formatCurrency(b.monthlyAvg)}</strong> (${activeMonthCount} mo)</span>
              <span style="color:${isOver ? 'var(--color-expense)' : 'var(--text-secondary)'};font-weight:600;">
                ${rawPct}% of budget
              </span>
            </div>
          </div>
        `;
      })
      .join('');

    els.budgetsGrid.querySelectorAll('input[data-budget-cat]').forEach((input) => {
      input.addEventListener('change', () => {
        const cat = input.getAttribute('data-budget-cat');
        const val = Math.max(0, parseFloat(input.value) || 0);
        state.budgets[cat] = val;
        Data.saveBudgets(state.budgets);
        renderAll();
        showToast(`Updated ${cat} monthly budget to ${Charts.formatCurrency(val)}`);
      });
    });
  }

  function openAddModal() {
    els.modalTitle.textContent = 'Add Transaction';
    els.txId.value = '';
    els.txType.value = 'expense';
    syncModalCategories('expense');
    els.txDate.value = Data.formatDateISO(new Date());
    els.txAmount.value = '';
    els.txDescription.value = '';
    els.txAccount.value = 'DuitNow QR';
    els.txNotes.value = '';
    els.transactionModal.hidden = false;
    els.txDescription.focus();
  }

  function openEditModal(id) {
    const tx = state.transactions.find((t) => t.id === id);
    if (!tx) return;
    els.modalTitle.textContent = 'Edit Transaction';
    els.txId.value = tx.id;
    els.txType.value = tx.type;
    syncModalCategories(tx.type);
    if (!Array.from(els.txCategory.options).some((o) => o.value === tx.category)) {
      const opt = document.createElement('option');
      opt.value = tx.category;
      opt.textContent = tx.category;
      els.txCategory.appendChild(opt);
    }
    els.txCategory.value = tx.category;
    els.txDate.value = tx.date;
    els.txAmount.value = tx.amount;
    els.txDescription.value = tx.description;
    els.txAccount.value = tx.account;
    els.txNotes.value = tx.notes || '';
    els.transactionModal.hidden = false;
  }

  function closeModal() {
    els.transactionModal.hidden = true;
  }

  function deleteTransaction(id) {
    const idx = state.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return;
    const removed = state.transactions[idx];
    state.transactions.splice(idx, 1);
    Data.saveTransactions(state.transactions);
    renderAll();
    showToast(`Deleted "${removed.description}"`);
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    els.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3200);
  }

  function switchView(viewName) {
    state.activeView = viewName;
    els.navItems.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    if (els.viewSync) els.viewSync.classList.remove('active');

    if (viewName === 'dashboard') {
      els.pageTitle.textContent = 'Overview';
      els.viewDashboard.classList.add('active');
      els.viewTransactions.classList.add('active');
      els.viewBudgets.classList.remove('active');
    } else if (viewName === 'transactions') {
      els.pageTitle.textContent = 'Transactions';
      els.viewDashboard.classList.remove('active');
      els.viewTransactions.classList.add('active');
      els.viewBudgets.classList.remove('active');
    } else if (viewName === 'budgets') {
      els.pageTitle.textContent = 'Budgets';
      els.viewDashboard.classList.remove('active');
      els.viewTransactions.classList.remove('active');
      els.viewBudgets.classList.add('active');
    } else if (viewName === 'sync') {
      els.pageTitle.textContent = 'Auto-Capture & Sync';
      els.viewDashboard.classList.remove('active');
      els.viewTransactions.classList.add('active');
      els.viewBudgets.classList.remove('active');
      if (els.viewSync) els.viewSync.classList.add('active');
    }

    renderAll();
  }

  function renderSmartParserPreview() {
    if (!Sync || !els.smartParserInput) return;
    const raw = els.smartParserInput.value;
    const parsed = Sync.parseSmartBatchInput(raw);
    state.parsedStaging = parsed;

    if (parsed.length === 0) {
      els.smartParserPreviewWrap.hidden = true;
      els.btnCommitParsed.disabled = true;
      els.btnCommitParsed.textContent = 'Add 0 Parsed Transactions to Ledger';
      return;
    }

    els.smartParserPreviewWrap.hidden = false;
    els.btnCommitParsed.disabled = false;
    els.btnCommitParsed.textContent = `Add ${parsed.length} Parsed Transaction${parsed.length === 1 ? '' : 's'} to Ledger`;

    els.smartParserPreviewBody.innerHTML = parsed
      .map((tx) => {
        const catInfo = Data.CATEGORIES[tx.category] || { color: '#6366f1' };
        const sign = tx.type === 'income' ? '+' : '-';
        const amountClass = tx.type === 'income' ? 'amount-income' : 'amount-expense';
        return `
          <tr>
            <td>${Export.escapeHtml(tx.date)}</td>
            <td><strong>${Export.escapeHtml(tx.description)}</strong></td>
            <td>
              <span class="cat-badge">
                <span class="legend-swatch" style="background:${catInfo.color}"></span>
                ${Export.escapeHtml(tx.category)}
              </span>
            </td>
            <td>${Export.escapeHtml(tx.account)}</td>
            <td><span class="type-pill type-${tx.type}">${tx.type}</span></td>
            <td class="text-right ${amountClass}">${sign}${Charts.formatCurrency(tx.amount)}</td>
          </tr>
        `;
      })
      .join('');
  }

  function triggerCSVExport() {
    const filtered = getFilteredTransactions();
    Export.exportToCSV(filtered, els.activeFilterSummary.textContent);
    showToast(`Exported ${filtered.length} transactions to CSV`);
  }

  function triggerPDFExport() {
    const filtered = getFilteredTransactions();
    const analytics = computeAnalytics(filtered);
    Export.exportToPDFReport({
      filterSummary: buildFilterSummaryText(filtered.length),
      kpis: analytics.kpis,
      categorySeries: analytics.categorySeries,
      transactions: filtered,
      formatCurrency: Charts.formatCurrency
    });
  }

  function bindEvents() {
    // Sidebar navigation
    els.navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        switchView(btn.getAttribute('data-view'));
      });
    });

    // Filter controls
    els.filterSearch.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      state.pagination.page = 1;
      renderAll();
    });

    els.filterPreset.addEventListener('change', (e) => {
      state.filters.preset = e.target.value;
      applyDatePreset(state.filters.preset);
      state.pagination.page = 1;
      renderAll();
    });

    els.filterDateFrom.addEventListener('change', (e) => {
      state.filters.dateFrom = e.target.value;
      state.filters.preset = 'custom';
      els.filterPreset.value = 'custom';
      state.pagination.page = 1;
      renderAll();
    });

    els.filterDateTo.addEventListener('change', (e) => {
      state.filters.dateTo = e.target.value;
      state.filters.preset = 'custom';
      els.filterPreset.value = 'custom';
      state.pagination.page = 1;
      renderAll();
    });

    els.filterType.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      state.pagination.page = 1;
      renderAll();
    });

    els.filterCategory.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      state.pagination.page = 1;
      renderAll();
    });

    els.filterAccount.addEventListener('change', (e) => {
      state.filters.account = e.target.value;
      state.pagination.page = 1;
      renderAll();
    });

    els.btnClearFilters.addEventListener('click', () => {
      state.filters = {
        search: '',
        preset: 'all',
        dateFrom: '',
        dateTo: '',
        type: 'all',
        category: 'all',
        account: 'all'
      };
      els.filterSearch.value = '';
      els.filterPreset.value = 'all';
      els.filterDateFrom.value = '';
      els.filterDateTo.value = '';
      els.filterType.value = 'all';
      els.filterCategory.value = 'all';
      els.filterAccount.value = 'all';
      state.pagination.page = 1;
      renderAll();
      showToast('All filters cleared');
    });

    // Chart mode pills
    els.trendChartTypeToggle.querySelectorAll('.pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        els.trendChartTypeToggle.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        state.trendMode = pill.getAttribute('data-mode');
        renderAll();
      });
    });

    els.pieChartTypeToggle.querySelectorAll('.pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        els.pieChartTypeToggle.querySelectorAll('.pill').forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        state.pieMode = pill.getAttribute('data-mode');
        renderAll();
      });
    });

    // Table sorting
    els.transactionsTable.querySelectorAll('th.sortable').forEach((th) => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (state.sort.field === field) {
          state.sort.dir = state.sort.dir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sort.field = field;
          state.sort.dir = field === 'date' || field === 'amount' ? 'desc' : 'asc';
        }

        els.transactionsTable.querySelectorAll('th.sortable').forEach((header) => {
          const ind = header.querySelector('.sort-indicator');
          if (header === th) {
            ind.textContent = state.sort.dir === 'asc' ? '▲' : '▼';
          } else {
            ind.textContent = '';
          }
        });

        renderAll();
      });
    });

    // Pagination
    els.pageSizeSelect.addEventListener('change', (e) => {
      state.pagination.pageSize = parseInt(e.target.value, 10) || 10;
      state.pagination.page = 1;
      renderAll();
    });

    els.btnPrevPage.addEventListener('click', () => {
      if (state.pagination.page > 1) {
        state.pagination.page--;
        renderAll();
      }
    });

    els.btnNextPage.addEventListener('click', () => {
      state.pagination.page++;
      renderAll();
    });

    // Modal Add/Edit
    els.btnAddTransaction.addEventListener('click', openAddModal);
    els.btnCloseModal.addEventListener('click', closeModal);
    els.btnCancelModal.addEventListener('click', closeModal);
    els.txType.addEventListener('change', (e) => syncModalCategories(e.target.value));

    els.transactionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = els.txId.value;
      const payload = {
        id: id || 'tx_' + Date.now(),
        type: els.txType.value,
        date: els.txDate.value,
        amount: Number(parseFloat(els.txAmount.value).toFixed(2)),
        category: els.txCategory.value,
        description: els.txDescription.value.trim(),
        account: els.txAccount.value,
        notes: els.txNotes.value.trim()
      };

      if (id) {
        const idx = state.transactions.findIndex((t) => t.id === id);
        if (idx !== -1) state.transactions[idx] = payload;
        showToast(`Updated "${payload.description}"`);
      } else {
        state.transactions.unshift(payload);
        showToast(`Added "${payload.description}" (${Charts.formatCurrency(payload.amount)})`);
      }

      Data.saveTransactions(state.transactions);
      closeModal();
      renderAll();
    });

    // CSV & PDF Exports
    els.btnExportCSV.addEventListener('click', triggerCSVExport);
    els.btnExportCSVTable.addEventListener('click', triggerCSVExport);
    els.btnExportPDF.addEventListener('click', triggerPDFExport);
    els.btnExportPDFTable.addEventListener('click', triggerPDFExport);

    // CSV Import
    els.csvImportInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = Export.parseCSVImport(ev.target.result);
          state.transactions = [...imported, ...state.transactions];
          Data.saveTransactions(state.transactions);
          renderAll();
          showToast(`Successfully imported ${imported.length} transactions from CSV!`);
        } catch (err) {
          showToast(`CSV Import Error: ${err.message}`);
        }
        els.csvImportInput.value = '';
      };
      reader.readAsText(file);
    });

    // Reset Sample Data
    els.btnResetDemo.addEventListener('click', () => {
      const restored = Data.resetTransactionsToSeed();
      state.transactions = restored.transactions;
      state.budgets = restored.budgets;
      state.pagination.page = 1;
      renderAll();
      showToast('Restored default sample transactions and budgets');
    });

    // Quick Smart Capture Topbar Button
    if (els.btnQuickSmartCapture) {
      els.btnQuickSmartCapture.addEventListener('click', () => {
        switchView('sync');
        if (els.smartParserInput) els.smartParserInput.focus();
      });
    }

    // Smart SMS / QR Receipt Parser
    if (els.btnLoadSampleAlerts) {
      els.btnLoadSampleAlerts.addEventListener('click', () => {
        els.smartParserInput.value = Sync.SAMPLE_NOTIFICATIONS;
        renderSmartParserPreview();
        showToast('Loaded 5 sample alerts (QR Pay, Apple Pay, Salary, Debit & Credit)');
      });
    }

    if (els.btnParsePreview) {
      els.btnParsePreview.addEventListener('click', () => {
        renderSmartParserPreview();
      });
    }

    if (els.smartParserInput) {
      els.smartParserInput.addEventListener('input', () => {
        renderSmartParserPreview();
      });
    }

    if (els.btnCommitParsed) {
      els.btnCommitParsed.addEventListener('click', () => {
        if (!state.parsedStaging || state.parsedStaging.length === 0) return;
        const count = state.parsedStaging.length;
        state.transactions = [...state.parsedStaging, ...state.transactions];
        Data.saveTransactions(state.transactions);
        state.parsedStaging = [];
        els.smartParserInput.value = '';
        renderSmartParserPreview();
        state.pagination.page = 1;
        renderAll();
        showToast(`Auto-captured and added ${count} transaction${count === 1 ? '' : 's'} to your ledger!`);
      });
    }

    // JANM -> RHB Bank Auto-Salary Rule Controls
    if (els.btnSaveJANMRule) {
      els.btnSaveJANMRule.addEventListener('click', () => {
        const currentRule = Data.loadJANMRule();
        const updatedRule = {
          ...currentRule,
          netAmount: Math.max(100, parseFloat(els.janmNetAmount.value) || 4850),
          scheduleMode: els.janmScheduleMode.value || 'janm_official',
          fixedDay: Math.min(28, Math.max(1, parseInt(els.janmFixedDay.value, 10) || 24)),
          enabled: els.janmAutoEnabled.value === 'true'
        };
        Data.saveJANMRule(updatedRule);
        updateJANMStatusBanner();
        showToast(`Saved JANM → RHB Salary Rule (${Charts.formatCurrency(updatedRule.netAmount)}/month)`);
      });
    }

    if (els.btnPostJANMNow) {
      els.btnPostJANMNow.addEventListener('click', () => {
        // Save any edits to amount first
        const currentRule = Data.loadJANMRule();
        currentRule.netAmount = Math.max(100, parseFloat(els.janmNetAmount.value) || 4850);
        Data.saveJANMRule(currentRule);

        const res = Sync.checkAndPostJANMSalary(state.transactions, true);
        if (res.posted && res.transaction) {
          state.transactions.unshift(res.transaction);
          Data.saveTransactions(state.transactions);
          updateJANMStatusBanner();
          renderAll();
          showToast(
            `Credited JANM Gaji Bersih (${Charts.formatCurrency(res.transaction.amount)}) to RHB Bank!`
          );
        }
      });
    }

    // Live iPhone Shortcut Simulations (Malaysian RHB / DuitNow QR / JANM e-Penyata Gaji)
    if (els.btnSimApplePay) {
      els.btnSimApplePay.addEventListener('click', () => {
        const tx = Sync.parseSingleNotificationLine(
          'Apple Wallet: RM 24.90 at Jaya Grocer using Apple Pay (RHB Visa Debit) on ' + Data.formatDateISO(new Date()),
          1
        );
        if (tx) {
          state.transactions.unshift(tx);
          Data.saveTransactions(state.transactions);
          renderAll();
          showToast(`iPhone Apple Pay (RHB) Captured: ${tx.description} (-${Charts.formatCurrency(tx.amount)})`);
        }
      });
    }

    if (els.btnSimQRPay) {
      els.btnSimQRPay.addEventListener('click', () => {
        const tx = Sync.parseSingleNotificationLine(
          'DuitNow QR Receipt: Paid RM 14.90 to ZUS Coffee via DuitNow QR on ' + Data.formatDateISO(new Date()),
          2
        );
        if (tx) {
          state.transactions.unshift(tx);
          Data.saveTransactions(state.transactions);
          renderAll();
          showToast(`DuitNow QR Captured: ${tx.description} (-${Charts.formatCurrency(tx.amount)})`);
        }
      });
    }

    if (els.btnSimSalary) {
      els.btnSimSalary.addEventListener('click', () => {
        const netAmt = (els.janmNetAmount && parseFloat(els.janmNetAmount.value)) || 4850.00;
        const tx = Sync.parseSingleNotificationLine(
          `e-Penyata Gaji JANM: Gaji Pokok RM 4,200.00 | Potongan RM 500.00 | GAJI BERSIH: RM ${netAmt.toFixed(2)} -> RHB Bank on ` + Data.formatDateISO(new Date()),
          3
        );
        if (tx) {
          state.transactions.unshift(tx);
          Data.saveTransactions(state.transactions);
          updateJANMStatusBanner();
          renderAll();
          showToast(`JANM Gaji Bersih Captured: +${Charts.formatCurrency(tx.amount)} into RHB Bank`);
        }
      });
    }

    // Google Cloud Sync & Apps Script Copy
    if (els.btnSyncGoogleNow) {
      els.btnSyncGoogleNow.addEventListener('click', async () => {
        const cfg = Sync.loadSyncConfig();
        cfg.webAppUrl = (els.syncWebAppUrl.value || '').trim();
        cfg.syncToken = (els.syncTokenInput.value || '').trim();
        Sync.saveSyncConfig(cfg);

        if (!cfg.webAppUrl) {
          showToast('Please paste your Google Apps Script Web App URL first.');
          return;
        }

        els.btnSyncGoogleNow.disabled = true;
        els.btnSyncGoogleNow.textContent = 'Syncing...';
        try {
          const result = await Sync.syncWithGoogleCloud(state.transactions);
          state.transactions = result.mergedTransactions;
          Data.saveTransactions(state.transactions);
          initSyncSettingsUI();
          renderAll();
          showToast(`Google Cloud Sync complete! (+${result.pulledCount} pulled, ${result.pushedCount} pushed)`);
        } catch (err) {
          showToast(`Cloud Sync Error: ${err.message}`);
        } finally {
          els.btnSyncGoogleNow.disabled = false;
          els.btnSyncGoogleNow.textContent = 'Save & Sync with Google Cloud';
        }
      });
    }

    if (els.btnCopyAppsScript) {
      els.btnCopyAppsScript.addEventListener('click', () => {
        showToast('Open integrations/google-apps-script.gs in your project folder to copy the full Gmail + Google Sheets bridge script.');
      });
    }

    // Sidebar collapse / expand toggle
    if (els.btnSidebarToggle) {
      els.btnSidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Apple / Google Sign-In & Salutation Nickname Modal
    if (els.btnAuthOpen) {
      els.btnAuthOpen.addEventListener('click', openAuthModal);
    }
    if (els.btnEditNickname) {
      els.btnEditNickname.addEventListener('click', openAuthModal);
    }
    if (els.btnCloseAuthModal) {
      els.btnCloseAuthModal.addEventListener('click', closeAuthModal);
    }
    if (els.btnCancelAuthModal) {
      els.btnCancelAuthModal.addEventListener('click', closeAuthModal);
    }
    if (els.btnSignInApple) {
      els.btnSignInApple.addEventListener('click', () => handleProviderSignIn('apple'));
    }
    if (els.btnSignInGoogle) {
      els.btnSignInGoogle.addEventListener('click', () => handleProviderSignIn('google'));
    }
    if (els.authProfileForm) {
      els.authProfileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const current = loadUserProfile();
        const updated = {
          ...current,
          nickname: (els.authNicknameInput.value || '').trim() || 'Amir',
          email: (els.authEmailInput.value || '').trim()
        };
        saveUserProfile(updated);
        renderSalutationAndAuth();
        closeAuthModal();
        showToast(`Greeting updated: ${getTimeOfDayGreeting()}, ${updated.nickname}`);
      });
    }
    if (els.btnSignOutAccount) {
      els.btnSignOutAccount.addEventListener('click', () => {
        const current = loadUserProfile();
        saveUserProfile({
          nickname: current.nickname || 'Amir',
          email: '',
          provider: null
        });
        renderSalutationAndAuth();
        closeAuthModal();
        showToast('Signed out of cloud account');
      });
    }

    // Theme toggle (desktop & mobile)
    if (els.btnThemeToggle) {
      els.btnThemeToggle.addEventListener('click', toggleThemeManual);
    }
    if (els.btnMobileThemeToggle) {
      els.btnMobileThemeToggle.addEventListener('click', toggleThemeManual);
    }

    // Redraw charts on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderAll();
      }, 100);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
