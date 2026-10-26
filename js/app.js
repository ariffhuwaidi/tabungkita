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
    btnMobileAddTx: document.getElementById('btnMobileAddTx'),
    btnMobileSmartCapture: document.getElementById('btnMobileSmartCapture'),
    btnMobileThemeToggle: document.getElementById('btnMobileThemeToggle'),
    btnToggleMobileFilters: document.getElementById('btnToggleMobileFilters'),
    filterSecondaryRow: document.getElementById('filterSecondaryRow'),
    customDateGroup: document.getElementById('customDateGroup'),

    navItems: document.querySelectorAll('.nav-item'),
    pageTitle: document.getElementById('pageTitle'),
    activeFilterSummary: document.getElementById('activeFilterSummary'),
    viewDashboard: document.getElementById('viewDashboard'),
    viewTransactions: document.getElementById('viewTransactions'),
    viewReports: document.getElementById('viewReports'),
    viewBudgets: document.getElementById('viewBudgets'),
    viewSync: document.getElementById('viewSync'),
    viewGuide: document.getElementById('viewGuide'),
    btnQuickSmartCapture: document.getElementById('btnQuickSmartCapture'),

    homeNetBalance: document.getElementById('homeNetBalance'),
    homeMonthlyIncome: document.getElementById('homeMonthlyIncome'),
    homeMonthlyExpense: document.getElementById('homeMonthlyExpense'),
    homeSavingsRate: document.getElementById('homeSavingsRate'),
    btnHomeAddExpense: document.getElementById('btnHomeAddExpense'),
    btnHomeTodayQuickAdd: document.getElementById('btnHomeTodayQuickAdd'),
    homeTodayList: document.getElementById('homeTodayList'),
    homeTodaySubtitle: document.getElementById('homeTodaySubtitle'),
    homeBudgetSummary: document.getElementById('homeBudgetSummary'),
    btnHomeManageBudgets: document.getElementById('btnHomeManageBudgets'),
    btnHomeViewActivity: document.getElementById('btnHomeViewActivity'),
    btnHomeViewReports: document.getElementById('btnHomeViewReports'),

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
    mobileTransactionsList: document.getElementById('mobileTransactionsList'),
    transactionsTable: document.getElementById('transactionsTable'),
    transactionsTableBody: document.getElementById('transactionsTableBody'),
    paginationInfo: document.getElementById('paginationInfo'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    btnNextPage: document.getElementById('btnNextPage'),
    btnClearAllTable: document.getElementById('btnClearAllTable'),

    budgetsGrid: document.getElementById('budgetsGrid'),

    btnAddTransaction: document.getElementById('btnAddTransaction'),
    transactionModal: document.getElementById('transactionModal'),
    modalTitle: document.getElementById('modalTitle'),
    transactionForm: document.getElementById('transactionForm'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    btnTypeExpense: document.getElementById('btnTypeExpense'),
    btnTypeIncome: document.getElementById('btnTypeIncome'),
    quickCategoryChips: document.getElementById('quickCategoryChips'),
    btnSaveTransaction: document.getElementById('btnSaveTransaction'),
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
    themeToggleLabel: document.getElementById('themeToggleLabel'),
    toastContainer: document.getElementById('toastContainer')
  };

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
    if (next === getDeviceSystemTheme()) {
      localStorage.removeItem(STORAGE_KEY_THEME);
    } else {
      localStorage.setItem(STORAGE_KEY_THEME, next);
    }
    applyTheme(next);
    renderAll();
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
    }, 280);
  }

  function init() {
    state.transactions = Data.loadTransactions();
    state.budgets = Data.loadBudgets();

    initThemeFromDeviceSettings();
    initSidebarState();

    // 1. Check JANM -> RHB Bank Auto-Salary Detector (only if user enabled Automatic mode)
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
          showToast(`Auto-captured: ${autoCaptured.description} (${Charts.formatCurrency(autoCaptured.amount)})`);
        }, 250);
      }
    }

    initSyncSettingsUI();
    populateSelectOptions();
    applyDatePreset(state.filters.preset);
    bindEvents();
    switchView('dashboard');
  }

  function initSyncSettingsUI() {
    if (!Sync) return;
    const cfg = Sync.loadSyncConfig();
    if (els.syncWebAppUrl) els.syncWebAppUrl.value = cfg.webAppUrl || '';
    if (els.syncTokenInput) els.syncTokenInput.value = cfg.syncToken || '';
    if (els.syncStatusText) {
      els.syncStatusText.textContent = cfg.lastSyncedAt
        ? `Last synced: ${new Date(cfg.lastSyncedAt).toLocaleString()}`
        : 'Not synced yet';
    }

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
      els.janmStatusBadge.textContent = rule.enabled ? 'Automatic' : 'Manual';
    }

    if (check.alreadyExists) {
      els.janmCurrentMonthInfo.innerHTML = `<span style="color:var(--color-income);font-weight:600;">✓ ${ymKey} JANM Gaji Bersih (${Charts.formatCurrency(rule.netAmount)}) recorded in RHB Bank.</span>`;
    } else {
      els.janmCurrentMonthInfo.innerHTML = `Next JANM Payday (${ymKey}): <strong>Day ${payday}</strong> • <strong>${Charts.formatCurrency(rule.netAmount)} → RHB Bank</strong>`;
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

    if (els.customDateGroup) {
      els.customDateGroup.hidden = preset !== 'custom';
    }

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

    const paletteFallback = ['#0071e3', '#30d158', '#ff9f0a', '#ff375f', '#5e5ce6', '#bf5af2', '#64d2ff', '#ff453a'];
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
      parts.push(`${dateFrom || 'Start'} – ${dateTo || 'Now'}`);
    } else {
      parts.push('All Time');
    }
    if (type !== 'all') parts.push(type);
    if (category !== 'all') parts.push(category);
    if (account !== 'all') parts.push(account);
    if (search) parts.push(`"${search}"`);
    return `${parts.join(' • ')} • ${count} transaction${count === 1 ? '' : 's'}`;
  }

  function renderAll() {
    const filtered = getFilteredTransactions();
    const analytics = computeAnalytics(filtered);
    const summaryText = buildFilterSummaryText(filtered.length);

    els.activeFilterSummary.textContent = summaryText;
    renderHomeView();
    renderKPIs(analytics.kpis);
    renderCharts(analytics);
    renderCategoryLegend(analytics.categorySeries);
    renderTable(filtered);
    renderBudgetsView(analytics.budgetSeries, analytics.activeMonthCount);
    updateJANMStatusBanner();
  }

  function renderHomeView() {
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const todayISO = Data.formatDateISO(now);

    let allIncome = 0;
    let allExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    const monthCategoryTotals = {};
    const todayTransactions = [];

    state.transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const isThisMonth = (tx.date || '').slice(0, 7) === currentYM;
      const isToday = tx.date === todayISO;

      if (tx.type === 'income') {
        allIncome += amt;
        if (isThisMonth) monthIncome += amt;
      } else {
        allExpense += amt;
        if (isThisMonth) {
          monthExpense += amt;
          monthCategoryTotals[tx.category] = (monthCategoryTotals[tx.category] || 0) + amt;
        }
      }

      if (isToday) {
        todayTransactions.push(tx);
      }
    });

    const netRecorded = allIncome - allExpense;
    const monthSavingsRate = monthIncome > 0 ? Math.max(0, ((monthIncome - monthExpense) / monthIncome) * 100) : 0;

    if (els.homeNetBalance) {
      els.homeNetBalance.textContent = (netRecorded < 0 ? '-' : '') + Charts.formatCurrency(netRecorded);
      els.homeNetBalance.style.color = netRecorded < 0 ? 'var(--color-expense)' : 'var(--text-primary)';
    }

    if (els.homeMonthlyIncome) {
      els.homeMonthlyIncome.textContent = `+${Charts.formatCurrency(monthIncome)}`;
    }

    if (els.homeMonthlyExpense) {
      els.homeMonthlyExpense.textContent = `-${Charts.formatCurrency(monthExpense)}`;
    }

    if (els.homeSavingsRate) {
      els.homeSavingsRate.textContent = `${monthSavingsRate.toFixed(1)}%`;
    }

    // Render Today's Transactions List
    if (els.homeTodayList) {
      if (todayTransactions.length === 0) {
        els.homeTodayList.innerHTML = `
          <div class="home-empty-today">
            <span class="home-empty-text">No expenses recorded today</span>
            <button class="btn btn-secondary btn-sm" id="btnEmptyAddToday">
              + Log Today's Expense
            </button>
          </div>
        `;
        const btnEmpty = document.getElementById('btnEmptyAddToday');
        if (btnEmpty) btnEmpty.addEventListener('click', () => openAddModal('expense'));
      } else {
        els.homeTodayList.innerHTML = todayTransactions
          .map((tx) => {
            const isInc = tx.type === 'income';
            const sign = isInc ? '+' : '-';
            const catData = Data.CATEGORIES[tx.category] || {};
            const color = catData.color || (isInc ? 'var(--color-income)' : 'var(--navy-primary)');
            return `
              <div class="mobile-tx-card" style="border-left: 3.5px solid ${color};">
                <div class="mobile-tx-top">
                  <div class="mobile-tx-merchant">${Export.escapeHtml(tx.description)}</div>
                  <div class="mobile-tx-amount ${isInc ? 'amount-income' : 'amount-expense'}">
                    ${sign}${Charts.formatCurrency(tx.amount)}
                  </div>
                </div>
                <div class="mobile-tx-sub">
                  <span>${Export.escapeHtml(tx.category)}</span>
                  <span>•</span>
                  <span>${Export.escapeHtml(tx.account)}</span>
                </div>
              </div>
            `;
          })
          .join('');
      }
    }

    if (els.homeTodaySubtitle) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      els.homeTodaySubtitle.textContent = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} • ${todayTransactions.length} recorded`;
    }

    // Render Compact Monthly Spending & Budget Summary
    if (els.homeBudgetSummary) {
      const expenseCats = Object.keys(Data.CATEGORIES).filter((c) => Data.CATEGORIES[c].type === 'expense');
      const catSummaries = expenseCats
        .map((cat) => {
          const spent = monthCategoryTotals[cat] || 0;
          const budget = Number(state.budgets[cat] || Data.CATEGORIES[cat].defaultBudget || 0);
          const color = Data.CATEGORIES[cat].color || '#142B4A';
          return { cat, spent, budget, color };
        })
        .sort((a, b) => b.spent - a.spent);

      const topCats = catSummaries.slice(0, 4);
      let totalBudget = 0;
      expenseCats.forEach((c) => {
        totalBudget += Number(state.budgets[c] || Data.CATEGORIES[c].defaultBudget || 0);
      });

      if (monthExpense === 0 && totalBudget === 0) {
        els.homeBudgetSummary.innerHTML = `
          <div style="color:var(--text-muted);font-size:0.84rem;text-align:center;padding:1rem 0;">
            No monthly spending recorded yet. Tap "+ Add Expense" above.
          </div>
        `;
      } else {
        const rowsHtml = topCats
          .map((item) => {
            const pct = item.budget > 0 ? Math.min(100, Math.round((item.spent / item.budget) * 100)) : 0;
            const isOver = item.budget > 0 && item.spent > item.budget;
            const barBg = isOver ? 'var(--color-expense)' : item.color;
            return `
              <div class="home-budget-row">
                <div class="home-budget-info">
                  <span class="home-budget-cat">
                    <span class="legend-swatch" style="background:${item.color}"></span>
                    ${Export.escapeHtml(item.cat)}
                  </span>
                  <span class="home-budget-amounts">
                    <strong>${Charts.formatCurrency(item.spent)}</strong> / ${Charts.formatCurrency(item.budget)}
                  </span>
                </div>
                <div class="home-budget-track">
                  <div class="home-budget-fill" style="width:${pct}%;background:${barBg};"></div>
                </div>
              </div>
            `;
          })
          .join('');

        const totalPct = totalBudget > 0 ? Math.min(100, Math.round((monthExpense / totalBudget) * 100)) : 0;
        const totalHtml = `
          ${rowsHtml}
          <div class="home-budget-footer">
            <span>Total Spent This Month: <strong>${Charts.formatCurrency(monthExpense)}</strong></span>
            <span>Total Budget: <strong>${Charts.formatCurrency(totalBudget)}</strong> (${totalPct}%)</span>
          </div>
        `;
        els.homeBudgetSummary.innerHTML = totalHtml;
      }
    }
  }

  function renderKPIs(kpis) {
    const fmt = Charts.formatCurrency;
    els.kpiIncome.textContent = fmt(kpis.totalIncome);
    els.kpiIncomeMeta.textContent = `${kpis.incomeCount} income entr${kpis.incomeCount === 1 ? 'y' : 'ies'}`;

    els.kpiExpense.textContent = fmt(kpis.totalExpense);
    els.kpiExpenseMeta.textContent = `${kpis.expenseCount} expense entr${kpis.expenseCount === 1 ? 'y' : 'ies'}`;

    els.kpiNet.textContent = (kpis.netCashFlow > 0 ? '+' : '') + fmt(kpis.netCashFlow);
    els.kpiNet.style.color =
      kpis.netCashFlow > 0
        ? 'var(--color-income)'
        : kpis.netCashFlow < 0
        ? 'var(--color-expense)'
        : 'var(--text-primary)';
    els.kpiNetMeta.textContent =
      kpis.netCashFlow >= 0 ? 'Available net flow' : 'Net deficit in period';

    els.kpiSavingsRate.textContent = `${kpis.savingsRate.toFixed(1)}%`;
    els.kpiTopCategory.textContent = kpis.topCategory
      ? `Top: ${kpis.topCategory.category} (${kpis.topCategory.pct}%)`
      : 'Top spend: —';
  }

  function renderCharts(analytics) {
    if (state.activeView !== 'reports') return;

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
      els.categoryLegend.innerHTML =
        '<div style="color:var(--text-muted);font-size:0.82rem;text-align:center;padding:0.5rem 0;">No expenses recorded yet. Tap "+ Add" to log your first expense.</div>';
      return;
    }

    els.categoryLegend.innerHTML = categorySeries
      .map((item) => {
        const isActive = state.filters.category === item.category;
        return `
          <div class="legend-item ${isActive ? 'active-filter' : ''}" data-cat="${Export.escapeHtml(item.category)}">
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

    els.tableCountLabel.textContent = `${total} transaction${total === 1 ? '' : 's'}`;
    els.paginationInfo.textContent = `Page ${state.pagination.page} of ${totalPages}`;
    els.btnPrevPage.disabled = state.pagination.page <= 1;
    els.btnNextPage.disabled = state.pagination.page >= totalPages;

    if (pageItems.length === 0) {
      const emptyMessage =
        state.transactions.length === 0
          ? 'No transactions yet. Tap "+ Add" or "Smart Capture" to log your first transaction.'
          : 'No transactions match your current filters.';

      els.transactionsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:2.2rem 1rem;color:var(--text-muted);">
            ${emptyMessage}
          </td>
        </tr>
      `;
      if (els.mobileTransactionsList) {
        els.mobileTransactionsList.innerHTML = `
          <div style="text-align:center;padding:2rem 0.75rem;color:var(--text-muted);font-size:0.86rem;">
            ${emptyMessage}
          </div>
        `;
      }
      return;
    }

    // 1. Render Desktop Table Rows
    els.transactionsTableBody.innerHTML = pageItems
      .map((tx) => {
        const catInfo = Data.CATEGORIES[tx.category] || { color: '#0071e3' };
        const sign = tx.type === 'income' ? '+' : '-';
        const amountClass = tx.type === 'income' ? 'amount-income' : 'amount-expense';
        return `
          <tr>
            <td>${Export.escapeHtml(tx.date)}</td>
            <td>
              <div style="font-weight:600;">${Export.escapeHtml(tx.description)}</div>
              ${tx.notes ? `<div style="font-size:0.75rem;color:var(--text-muted);">${Export.escapeHtml(tx.notes)}</div>` : ''}
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
                <button class="action-icon-btn edit" data-id="${Export.escapeHtml(tx.id)}">Edit</button>
                <button class="action-icon-btn delete" data-id="${Export.escapeHtml(tx.id)}">Delete</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    // 2. Render Mobile Apple-Wallet Card List
    if (els.mobileTransactionsList) {
      els.mobileTransactionsList.innerHTML = pageItems
        .map((tx) => {
          const catInfo = Data.CATEGORIES[tx.category] || { color: '#0071e3' };
          const sign = tx.type === 'income' ? '+' : '-';
          const amountClass = tx.type === 'income' ? 'amount-income' : 'amount-expense';
          return `
            <div class="mobile-tx-item">
              <div class="mobile-tx-left">
                <span class="mobile-tx-dot" style="background:${catInfo.color}"></span>
                <div class="mobile-tx-info">
                  <div class="mobile-tx-title">${Export.escapeHtml(tx.description)}</div>
                  <div class="mobile-tx-sub">${Export.escapeHtml(tx.date)} • ${Export.escapeHtml(tx.account)}</div>
                  <div class="mobile-tx-sub">${Export.escapeHtml(tx.category)}</div>
                </div>
              </div>
              <div class="mobile-tx-right">
                <div class="mobile-tx-amount ${amountClass}">${sign}${Charts.formatCurrency(tx.amount)}</div>
                <div class="mobile-tx-actions">
                  <button class="action-icon-btn edit" data-id="${Export.escapeHtml(tx.id)}">Edit</button>
                  <button class="action-icon-btn delete" data-id="${Export.escapeHtml(tx.id)}">Delete</button>
                </div>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // Bind Edit / Delete buttons across both Desktop and Mobile views
    document.querySelectorAll('.action-icon-btn.edit').forEach((btn) => {
      btn.addEventListener('click', () => openEditModal(btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.action-icon-btn.delete').forEach((btn) => {
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
                <span>RM</span>
                <input type="number" min="0" step="10" inputmode="numeric" data-budget-cat="${Export.escapeHtml(b.category)}" value="${b.budget}" />
              </div>
            </div>
            <div class="budget-progress-track">
              <div class="budget-progress-bar" style="width:${pct}%;background:${barColor}"></div>
            </div>
            <div class="budget-stats">
              <span>Avg/mo: <strong>${Charts.formatCurrency(b.monthlyAvg)}</strong></span>
              <span style="color:${isOver ? 'var(--color-expense)' : 'var(--text-muted)'};font-weight:600;">
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
        showToast(`Updated ${cat} budget to ${Charts.formatCurrency(val)}`);
      });
    });
  }

  const QUICK_EXPENSE_CHIPS = [
    { label: '🍔 Dining & Coffee', cat: 'Dining, Mamak & Coffee' },
    { label: '🛒 Groceries', cat: 'Groceries & Supermarket' },
    { label: '🚗 Fuel & Tol', cat: 'Fuel, Toll (RFID) & Transit' },
    { label: '⚡ Utilities', cat: 'Utilities (TNB, Air, Unifi, Telco)' },
    { label: '🛍️ Shopping', cat: 'Shopping & Online (Shopee/Lazada)' },
    { label: '💊 Health', cat: 'Health, Takaful & Fitness' },
    { label: '🎬 Entertainment', cat: 'Entertainment & Subscriptions' },
    { label: '🏠 Rent/Housing', cat: 'Housing & Loan (LPPSA/Rent)' }
  ];

  const QUICK_INCOME_CHIPS = [
    { label: '💰 JANM Gaji', cat: 'Salary & JANM (Gaji Bersih)' },
    { label: '✨ Elaun & Bonus', cat: 'Elaun, Bonus & Side Income' },
    { label: '📈 ASB / Dividen', cat: 'ASB, Tabung Haji & Dividends' }
  ];

  function renderQuickCategoryChips(type, selectedCat) {
    if (!els.quickCategoryChips) return;
    const chips = type === 'income' ? QUICK_INCOME_CHIPS : QUICK_EXPENSE_CHIPS;
    els.quickCategoryChips.innerHTML = chips
      .map((c) => {
        const isActive = c.cat === selectedCat;
        return `<button type="button" class="cat-chip ${isActive ? 'active' : ''}" data-cat="${Export.escapeHtml(c.cat)}">${Export.escapeHtml(c.label)}</button>`;
      })
      .join('');

    els.quickCategoryChips.querySelectorAll('.cat-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        els.quickCategoryChips.querySelectorAll('.cat-chip').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        els.txCategory.value = cat;
      });
    });
  }

  function setModalType(type) {
    els.txType.value = type;
    if (els.btnTypeExpense) els.btnTypeExpense.classList.toggle('active', type === 'expense');
    if (els.btnTypeIncome) els.btnTypeIncome.classList.toggle('active', type === 'income');
    syncModalCategories(type);
    const defaultCat = type === 'income' ? 'Salary & JANM (Gaji Bersih)' : 'Dining, Mamak & Coffee';
    els.txCategory.value = defaultCat;
    renderQuickCategoryChips(type, defaultCat);
    if (els.btnSaveTransaction) {
      els.btnSaveTransaction.textContent = type === 'income' ? 'Save Income' : 'Save Expense';
    }
  }

  function openAddModal(defaultType = 'expense') {
    els.modalTitle.textContent = defaultType === 'income' ? 'Add Income' : 'Add Expense';
    els.txId.value = '';
    setModalType(defaultType);
    els.txDate.value = Data.formatDateISO(new Date());
    els.txAmount.value = '';
    els.txDescription.value = '';
    els.txAccount.value = defaultType === 'income' ? 'RHB Bank (Salary / Debit)' : 'DuitNow QR';
    els.txNotes.value = '';
    if (els.btnSaveTransaction) {
      els.btnSaveTransaction.disabled = false;
    }
    els.transactionModal.hidden = false;

    // Fast 3-5 second entry: Auto-focus amount field immediately
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (els.txAmount) els.txAmount.focus();
      }, 50);
    });
  }

  function openEditModal(id) {
    const tx = state.transactions.find((t) => t.id === id);
    if (!tx) return;
    els.modalTitle.textContent = 'Edit Transaction';
    els.txId.value = tx.id;
    setModalType(tx.type);
    if (!Array.from(els.txCategory.options).some((o) => o.value === tx.category)) {
      const opt = document.createElement('option');
      opt.value = tx.category;
      opt.textContent = tx.category;
      els.txCategory.appendChild(opt);
    }
    els.txCategory.value = tx.category;
    renderQuickCategoryChips(tx.type, tx.category);
    els.txDate.value = tx.date;
    els.txAmount.value = tx.amount;
    els.txDescription.value = tx.description;
    els.txAccount.value = tx.account;
    els.txNotes.value = tx.notes || '';
    if (els.btnSaveTransaction) {
      els.btnSaveTransaction.disabled = false;
      els.btnSaveTransaction.textContent = 'Save Changes';
    }
    els.transactionModal.hidden = false;
    setTimeout(() => {
      if (els.txAmount) els.txAmount.focus();
    }, 50);
  }

  function closeModal() {
    els.transactionModal.hidden = true;
    if (els.btnSaveTransaction) els.btnSaveTransaction.disabled = false;
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
    }, 3000);
  }

  function switchView(viewName) {
    state.activeView = viewName;
    els.navItems.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    const allViews = [els.viewDashboard, els.viewTransactions, els.viewReports, els.viewBudgets, els.viewSync, els.viewGuide];
    allViews.forEach((v) => {
      if (v) v.classList.remove('active');
    });

    const filterBar = document.querySelector('.filter-bar');
    const showFilter = viewName === 'transactions' || viewName === 'reports';
    if (filterBar) filterBar.style.display = showFilter ? '' : 'none';

    if (viewName === 'dashboard') {
      els.pageTitle.textContent = 'Overview';
      els.activeFilterSummary.textContent = 'Personal finance snapshot';
      if (els.viewDashboard) els.viewDashboard.classList.add('active');
    } else if (viewName === 'transactions') {
      els.pageTitle.textContent = 'Activity';
      if (els.viewTransactions) els.viewTransactions.classList.add('active');
    } else if (viewName === 'reports') {
      els.pageTitle.textContent = 'Reports';
      els.activeFilterSummary.textContent = 'Cash flow & category breakdown';
      if (els.viewReports) els.viewReports.classList.add('active');
    } else if (viewName === 'budgets') {
      els.pageTitle.textContent = 'Budgets';
      els.activeFilterSummary.textContent = 'Monthly spending targets';
      if (els.viewBudgets) els.viewBudgets.classList.add('active');
    } else if (viewName === 'sync') {
      els.pageTitle.textContent = 'Auto-Capture & Sync';
      els.activeFilterSummary.textContent = 'SMS alerts, DuitNow QR & JANM payday rule';
      if (els.viewSync) els.viewSync.classList.add('active');
    } else if (viewName === 'guide') {
      els.pageTitle.textContent = 'Phone Setup Guide';
      els.activeFilterSummary.textContent = 'Link your iPhone for automatic capture';
      if (els.viewGuide) els.viewGuide.classList.add('active');
    }

    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderSmartParserPreview() {
    if (!Sync || !els.smartParserInput) return;
    const raw = els.smartParserInput.value;
    const parsed = Sync.parseSmartBatchInput(raw);
    state.parsedStaging = parsed;

    if (parsed.length === 0) {
      els.smartParserPreviewWrap.hidden = true;
      els.btnCommitParsed.disabled = true;
      els.btnCommitParsed.textContent = 'Add 0 Transactions';
      return;
    }

    els.smartParserPreviewWrap.hidden = false;
    els.btnCommitParsed.disabled = false;
    els.btnCommitParsed.textContent = `Add ${parsed.length} Transaction${parsed.length === 1 ? '' : 's'}`;

    els.smartParserPreviewBody.innerHTML = parsed
      .map((tx) => {
        const sign = tx.type === 'income' ? '+' : '-';
        const amountClass = tx.type === 'income' ? 'amount-income' : 'amount-expense';
        return `
          <tr>
            <td>${Export.escapeHtml(tx.date)}</td>
            <td><strong>${Export.escapeHtml(tx.description)}</strong></td>
            <td>${Export.escapeHtml(tx.category)}</td>
            <td>${Export.escapeHtml(tx.account)}</td>
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
    // Sidebar navigation & Bottom Tab Bar
    els.navItems.forEach((btn) => {
      btn.addEventListener('click', () => {
        switchView(btn.getAttribute('data-view'));
      });
    });

    // Desktop Sidebar collapse toggle
    if (els.btnSidebarToggle) {
      els.btnSidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Mobile Top Bar Quick Actions
    if (els.btnMobileAddTx) {
      els.btnMobileAddTx.addEventListener('click', openAddModal);
    }
    if (els.btnMobileSmartCapture) {
      els.btnMobileSmartCapture.addEventListener('click', () => {
        switchView('sync');
        if (els.smartParserInput) els.smartParserInput.focus();
      });
    }

    // Mobile Collapsible Filter Drawer
    if (els.btnToggleMobileFilters && els.filterSecondaryRow) {
      els.btnToggleMobileFilters.addEventListener('click', () => {
        const isOpen = els.filterSecondaryRow.classList.toggle('open');
        els.btnToggleMobileFilters.classList.toggle('active', isOpen);
        els.btnToggleMobileFilters.setAttribute('aria-expanded', String(isOpen));
      });
    }

    // Filter controls
    els.filterSearch.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      state.pagination.page = 1;
      renderAll();
    });

    els.filterPreset.addEventListener('change', (e) => {
      state.filters.preset = e.target.value;
      applyDatePreset(state.filters.preset);
      if (state.filters.preset === 'custom' && els.filterSecondaryRow) {
        els.filterSecondaryRow.classList.add('open');
      }
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
      if (els.customDateGroup) els.customDateGroup.hidden = true;
      state.pagination.page = 1;
      renderAll();
      showToast('Filters reset');
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

    // Home Screen Actions
    if (els.btnHomeAddExpense) {
      els.btnHomeAddExpense.addEventListener('click', () => openAddModal('expense'));
    }
    if (els.btnHomeTodayQuickAdd) {
      els.btnHomeTodayQuickAdd.addEventListener('click', () => openAddModal('expense'));
    }
    if (els.btnHomeManageBudgets) {
      els.btnHomeManageBudgets.addEventListener('click', () => switchView('budgets'));
    }
    if (els.btnHomeViewActivity) {
      els.btnHomeViewActivity.addEventListener('click', () => switchView('transactions'));
    }
    if (els.btnHomeViewReports) {
      els.btnHomeViewReports.addEventListener('click', () => switchView('reports'));
    }

    const btnSyncOpenGuide = document.getElementById('btnSyncOpenGuide');
    if (btnSyncOpenGuide) {
      btnSyncOpenGuide.addEventListener('click', () => switchView('guide'));
    }

    // Modal Add/Edit
    els.btnAddTransaction.addEventListener('click', () => openAddModal('expense'));
    els.btnCloseModal.addEventListener('click', closeModal);
    els.btnCancelModal.addEventListener('click', closeModal);

    if (els.btnTypeExpense) {
      els.btnTypeExpense.addEventListener('click', () => setModalType('expense'));
    }
    if (els.btnTypeIncome) {
      els.btnTypeIncome.addEventListener('click', () => setModalType('income'));
    }

    els.txCategory.addEventListener('change', (e) => {
      const cat = e.target.value;
      if (els.quickCategoryChips) {
        els.quickCategoryChips.querySelectorAll('.cat-chip').forEach((btn) => {
          btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
        });
      }
    });

    els.transactionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (els.btnSaveTransaction) {
        if (els.btnSaveTransaction.disabled) return;
        els.btnSaveTransaction.disabled = true;
      }

      const id = els.txId.value;
      const amtVal = parseFloat(els.txAmount.value);
      if (isNaN(amtVal) || amtVal <= 0) {
        showToast('Please enter an amount greater than 0');
        if (els.btnSaveTransaction) els.btnSaveTransaction.disabled = false;
        return;
      }

      const categoryVal = els.txCategory.value;
      const descVal = (els.txDescription.value || '').trim() || categoryVal;

      const payload = {
        id: id || 'tx_' + Date.now(),
        type: els.txType.value || 'expense',
        date: els.txDate.value || Data.formatDateISO(new Date()),
        amount: Number(amtVal.toFixed(2)),
        category: categoryVal,
        description: descVal,
        account: els.txAccount.value || 'DuitNow QR',
        notes: (els.txNotes.value || '').trim()
      };

      if (id) {
        const idx = state.transactions.findIndex((t) => t.id === id);
        if (idx !== -1) state.transactions[idx] = payload;
        showToast(`Updated "${payload.description}"`);
      } else {
        state.transactions.unshift(payload);
        showToast(`Recorded: ${payload.description} (${Charts.formatCurrency(payload.amount)})`);
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
          showToast(`Imported ${imported.length} transactions`);
        } catch (err) {
          showToast(`CSV Import Error: ${err.message}`);
        }
        els.csvImportInput.value = '';
      };
      reader.readAsText(file);
    });

    // Clear All Data to RM 0.00
    const handleClearAllToZero = () => {
      state.transactions = Data.clearAllTransactions();
      state.pagination.page = 1;
      renderAll();
      showToast('All transactions cleared — reset to RM 0.00');
    };

    if (els.btnResetDemo) {
      els.btnResetDemo.addEventListener('click', handleClearAllToZero);
    }
    if (els.btnClearAllTable) {
      els.btnClearAllTable.addEventListener('click', handleClearAllToZero);
    }

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
        showToast('Loaded sample alerts');
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
        showToast(`Added ${count} transaction${count === 1 ? '' : 's'}`);
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
        showToast(`Saved JANM Rule (${Charts.formatCurrency(updatedRule.netAmount)}/mo)`);
      });
    }

    if (els.btnPostJANMNow) {
      els.btnPostJANMNow.addEventListener('click', () => {
        const currentRule = Data.loadJANMRule();
        currentRule.netAmount = Math.max(100, parseFloat(els.janmNetAmount.value) || 4850);
        Data.saveJANMRule(currentRule);

        const res = Sync.checkAndPostJANMSalary(state.transactions, true);
        if (res.posted && res.transaction) {
          state.transactions.unshift(res.transaction);
          Data.saveTransactions(state.transactions);
          updateJANMStatusBanner();
          renderAll();
          showToast(`Credited ${Charts.formatCurrency(res.transaction.amount)} to RHB Bank`);
        }
      });
    }

    // Live iPhone Shortcut Simulations
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
          showToast(`Apple Pay: ${tx.description} (-${Charts.formatCurrency(tx.amount)})`);
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
          showToast(`DuitNow QR: ${tx.description} (-${Charts.formatCurrency(tx.amount)})`);
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
          showToast(`JANM Gaji Bersih: +${Charts.formatCurrency(tx.amount)} into RHB Bank`);
        }
      });
    }

    // Google Cloud Sync
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
          showToast(`Synced (+${result.pulledCount} pulled, ${result.pushedCount} pushed)`);
        } catch (err) {
          showToast(`Sync Error: ${err.message}`);
        } finally {
          els.btnSyncGoogleNow.disabled = false;
          els.btnSyncGoogleNow.textContent = 'Sync Now';
        }
      });
    }

    if (els.btnCopyAppsScript) {
      els.btnCopyAppsScript.addEventListener('click', () => {
        switchView('guide');
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
