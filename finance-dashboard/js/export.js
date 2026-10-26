(function () {
  window.FinPulse = window.FinPulse || {};

  function escapeCSVField(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function exportToCSV(transactions, filterDescription) {
    const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount', 'Notes'];
    const rows = transactions.map((tx) => [
      escapeCSVField(tx.date),
      escapeCSVField(tx.description),
      escapeCSVField(tx.category),
      escapeCSVField(tx.account),
      escapeCSVField(tx.type),
      escapeCSVField(Number(tx.amount).toFixed(2)),
      escapeCSVField(tx.notes || '')
    ]);

    const csvContent =
      '\uFEFF' + // UTF-8 BOM for Excel compatibility
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `tabungkita-transactions-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  function parseCSVImport(csvText) {
    const lines = csvText
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      throw new Error('CSV file must include a header row and at least one transaction row.');
    }

    const rawHeaders = parseCSVLine(lines[0]).map((h) => h.replace(/^\uFEFF/, '').toLowerCase());
    const idxDate = rawHeaders.findIndex((h) => h.includes('date'));
    const idxDesc = rawHeaders.findIndex((h) => h.includes('desc') || h.includes('merchant') || h.includes('name'));
    const idxCat = rawHeaders.findIndex((h) => h.includes('cat'));
    const idxAcc = rawHeaders.findIndex((h) => h.includes('acc') || h.includes('method'));
    const idxType = rawHeaders.findIndex((h) => h.includes('type'));
    const idxAmt = rawHeaders.findIndex((h) => h.includes('amount') || h.includes('value') || h.includes('total'));
    const idxNotes = rawHeaders.findIndex((h) => h.includes('note') || h.includes('memo') || h.includes('tag'));

    if (idxDate === -1 || idxAmt === -1) {
      throw new Error('CSV must contain at least "Date" and "Amount" columns.');
    }

    const imported = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length < 2) continue;

      const rawAmount = parseFloat((cols[idxAmt] || '0').replace(/[^0-9.-]/g, ''));
      if (isNaN(rawAmount) || rawAmount === 0) continue;

      let type = idxType !== -1 ? (cols[idxType] || '').toLowerCase() : '';
      if (type !== 'income' && type !== 'expense') {
        type = rawAmount < 0 ? 'expense' : 'expense';
      }

      const amount = Math.abs(rawAmount);
      const dateStr = cols[idxDate] || new Date().toISOString().slice(0, 10);
      const description = (idxDesc !== -1 && cols[idxDesc]) ? cols[idxDesc] : 'Imported Transaction';
      const category = (idxCat !== -1 && cols[idxCat]) ? cols[idxCat] : (type === 'income' ? 'Salary & Payroll' : 'Shopping & Tech');
      const account = (idxAcc !== -1 && cols[idxAcc]) ? cols[idxAcc] : 'Checking Account';
      const notes = (idxNotes !== -1 && cols[idxNotes]) ? cols[idxNotes] : '';

      imported.push({
        id: 'tx_imp_' + Date.now() + '_' + i,
        date: dateStr,
        description,
        category,
        account,
        type,
        amount: Number(amount.toFixed(2)),
        notes
      });
    }

    return imported;
  }

  function exportToPDFReport(reportContext) {
    const container = document.getElementById('printReportContainer');
    if (!container) return;

    const {
      filterSummary,
      kpis,
      categorySeries,
      transactions,
      formatCurrency
    } = reportContext;

    const generatedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const catRowsHtml = categorySeries
      .map(
        (c) => `
        <tr>
          <td>${escapeHtml(c.category)}</td>
          <td>${formatCurrency(c.amount)}</td>
          <td>${c.pct}%</td>
        </tr>`
      )
      .join('');

    const txRowsHtml = transactions
      .slice(0, 150)
      .map(
        (tx) => `
        <tr>
          <td>${escapeHtml(tx.date)}</td>
          <td>${escapeHtml(tx.description)}</td>
          <td>${escapeHtml(tx.category)}</td>
          <td>${escapeHtml(tx.account)}</td>
          <td>${tx.type.toUpperCase()}</td>
          <td style="text-align:right;font-weight:600;">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</td>
        </tr>`
      )
      .join('');

    container.innerHTML = `
      <div class="print-header">
        <div>
          <h1 style="font-size:20px;margin-bottom:4px;">TabungKita — Laporan Aliran Ringgit &amp; Simpanan</h1>
          <div style="font-size:12px;color:#475569;">${escapeHtml(filterSummary)}</div>
        </div>
        <div style="text-align:right;font-size:12px;color:#475569;">
          <div>Generated: ${escapeHtml(generatedAt)}</div>
          <div>Records: ${transactions.length} transactions</div>
        </div>
      </div>

      <div class="print-kpi-row">
        <div class="print-kpi-box">
          <div class="lbl">Total Income</div>
          <div class="val" style="color:#059669;">${formatCurrency(kpis.totalIncome)}</div>
        </div>
        <div class="print-kpi-box">
          <div class="lbl">Total Expenses</div>
          <div class="val" style="color:#e11d48;">${formatCurrency(kpis.totalExpense)}</div>
        </div>
        <div class="print-kpi-box">
          <div class="lbl">Net Cash Flow</div>
          <div class="val" style="color:#2563eb;">${formatCurrency(kpis.netCashFlow)}</div>
        </div>
        <div class="print-kpi-box">
          <div class="lbl">Savings Rate</div>
          <div class="val">${kpis.savingsRate.toFixed(1)}%</div>
        </div>
      </div>

      <div class="print-section-title">Expense Breakdown by Category</div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Total Spend</th>
            <th>Share of Expenses</th>
          </tr>
        </thead>
        <tbody>
          ${catRowsHtml || '<tr><td colspan="3">No expenses recorded in this period.</td></tr>'}
        </tbody>
      </table>

      <div class="print-section-title">Transactions Ledger ${transactions.length > 150 ? '(First 150 shown)' : ''}</div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Merchant / Description</th>
            <th>Category</th>
            <th>Account</th>
            <th>Type</th>
            <th style="text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${txRowsHtml || '<tr><td colspan="6">No transactions match current filters.</td></tr>'}
        </tbody>
      </table>
    `;

    window.print();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.FinPulse.Export = {
    exportToCSV,
    parseCSVImport,
    exportToPDFReport,
    escapeHtml
  };
})();
