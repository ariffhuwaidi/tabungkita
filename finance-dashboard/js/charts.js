(function () {
  window.FinPulse = window.FinPulse || {};

  const tooltipEl = document.getElementById('chartTooltip');

  function formatCurrency(val) {
    const sign = val < 0 ? '-' : '';
    return sign + 'RM ' + Math.abs(val).toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatCompact(val) {
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 1000) {
      return sign + 'RM ' + (abs / 1000).toFixed(1) + 'k';
    }
    return sign + 'RM ' + abs.toFixed(0);
  }

  function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      grid: isLight ? '#e5e5ea' : '#2c2c2e',
      text: isLight ? '#86868b' : '#86868b',
      textStrong: isLight ? '#1d1d1f' : '#f5f5f7',
      cardBg: isLight ? '#ffffff' : '#1d1d1f',
      income: isLight ? '#248a3d' : '#30d158',
      expense: isLight ? '#d70015' : '#ff453a',
      net: isLight ? '#0071e3' : '#2997ff'
    };
  }

  function setupHiDPICanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    const width = Math.max(240, rect.width);
    const height = Math.max(200, rect.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function showTooltip(evt, html) {
    if (!tooltipEl) return;
    tooltipEl.innerHTML = html;
    tooltipEl.hidden = false;
    const pad = 14;
    let x = evt.clientX + pad;
    let y = evt.clientY + pad;
    const rect = tooltipEl.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - 10) {
      x = evt.clientX - rect.width - pad;
    }
    if (y + rect.height > window.innerHeight - 10) {
      y = evt.clientY - rect.height - pad;
    }
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }

  function hideTooltip() {
    if (tooltipEl) tooltipEl.hidden = true;
  }

  // 1. Area / Line Chart: Cash Flow & Net Trend
  function renderCashFlowTrend(canvas, monthlySeries, mode) {
    if (!canvas) return;
    const { ctx, width, height } = setupHiDPICanvas(canvas);
    const theme = getThemeColors();
    ctx.clearRect(0, 0, width, height);

    if (!monthlySeries || monthlySeries.length === 0) {
      drawEmptyState(ctx, width, height, theme, 'No transactions in selected period');
      return;
    }

    const padLeft = 58;
    const padRight = 24;
    const padTop = 28;
    const padBottom = 38;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    let maxVal = 100;
    let minVal = 0;
    monthlySeries.forEach((m) => {
      maxVal = Math.max(maxVal, m.income, m.expense, m.net);
      minVal = Math.min(minVal, m.net, 0);
    });
    maxVal = maxVal * 1.12;
    if (minVal < 0) minVal = minVal * 1.15;

    const range = maxVal - minVal || 1;
    const yFor = (val) => padTop + plotH - ((val - minVal) / range) * plotH;
    const xFor = (idx) =>
      monthlySeries.length === 1
        ? padLeft + plotW / 2
        : padLeft + (idx / (monthlySeries.length - 1)) * plotW;

    // Grid lines
    const steps = 4;
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 1;
    ctx.fillStyle = theme.text;
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "SF Pro Text", "San Francisco", sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= steps; i++) {
      const v = minVal + (range * i) / steps;
      const y = yFor(v);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(formatCompact(v), padLeft - 8, y + 4);
    }

    // Legend at top right
    const legendItems = [
      { label: 'Income', color: theme.income },
      { label: 'Expenses', color: theme.expense },
      { label: 'Net Savings', color: theme.net }
    ];
    let lx = width - padRight;
    ctx.textAlign = 'right';
    for (let i = legendItems.length - 1; i >= 0; i--) {
      const item = legendItems[i];
      ctx.fillStyle = theme.text;
      ctx.fillText(item.label, lx, 16);
      const tw = ctx.measureText(item.label).width;
      lx -= tw + 8;
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(lx, 12, 4, 0, Math.PI * 2);
      ctx.fill();
      lx -= 18;
    }

    const baseLineY = yFor(0);

    function drawSeries(key, color, fillAlpha) {
      const pts = monthlySeries.map((m, idx) => ({
        x: xFor(idx),
        y: yFor(m[key])
      }));

      if (mode === 'area' && pts.length > 1) {
        const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
        grad.addColorStop(0, hexToRgba(color, fillAlpha));
        grad.addColorStop(1, hexToRgba(color, 0.01));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, baseLineY);
        pts.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.lineTo(pts[pts.length - 1].x, baseLineY);
        ctx.closePath();
        ctx.fill();
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      pts.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();

      pts.forEach((p) => {
        ctx.fillStyle = theme.cardBg;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    drawSeries('income', theme.income, 0.25);
    drawSeries('expense', theme.expense, 0.2);
    drawSeries('net', theme.net, 0.18);

    // X-axis labels
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    monthlySeries.forEach((m, idx) => {
      const x = xFor(idx);
      ctx.fillText(m.label, x, height - 12);
    });

    // Interactive hover
    canvas.onmousemove = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const mx = evt.clientX - rect.left;
      let closestIdx = 0;
      let minDist = Infinity;
      monthlySeries.forEach((_, idx) => {
        const dist = Math.abs(xFor(idx) - mx);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });
      if (minDist < 48) {
        const item = monthlySeries[closestIdx];
        showTooltip(
          evt,
          `<strong>${item.label}</strong><br/>
           <span style="color:#10b981">● Income:</span> ${formatCurrency(item.income)}<br/>
           <span style="color:#f43f5e">● Expenses:</span> ${formatCurrency(item.expense)}<br/>
           <span style="color:#60a5fa">● Net Flow:</span> ${formatCurrency(item.net)}`
        );
      } else {
        hideTooltip();
      }
    };
    canvas.onmouseleave = hideTooltip;
  }

  // 2. Donut / Pie Chart: Expense Breakdown by Category
  function renderCategoryDonut(canvas, categorySeries, mode, onSliceClick, activeCategory) {
    if (!canvas) return;
    const { ctx, width, height } = setupHiDPICanvas(canvas);
    const theme = getThemeColors();
    ctx.clearRect(0, 0, width, height);

    const total = categorySeries.reduce((acc, c) => acc + c.amount, 0);
    if (total <= 0) {
      drawEmptyState(ctx, width, height, theme, 'No expenses to display');
      canvas.onmousemove = null;
      canvas.onclick = null;
      return;
    }

    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 12;
    const innerRadius = mode === 'donut' ? outerRadius * 0.62 : 0;

    let startAngle = -Math.PI / 2;
    const slices = [];

    categorySeries.forEach((item) => {
      const sliceAngle = (item.amount / total) * Math.PI * 2;
      const endAngle = startAngle + sliceAngle;
      const isSelected = activeCategory && activeCategory !== 'all' && activeCategory === item.category;

      const midAngle = startAngle + sliceAngle / 2;
      const offset = isSelected ? 6 : 0;
      const scx = cx + Math.cos(midAngle) * offset;
      const scy = cy + Math.sin(midAngle) * offset;

      ctx.beginPath();
      ctx.arc(scx, scy, outerRadius, startAngle, endAngle);
      if (innerRadius > 0) {
        ctx.arc(scx, scy, innerRadius, endAngle, startAngle, true);
      } else {
        ctx.lineTo(scx, scy);
      }
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = theme.cardBg;
      ctx.stroke();

      slices.push({
        ...item,
        startAngle,
        endAngle,
        pct: ((item.amount / total) * 100).toFixed(1)
      });

      startAngle = endAngle;
    });

    if (mode === 'donut') {
      ctx.fillStyle = theme.text;
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "SF Pro Text", "San Francisco", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TOTAL SPENT', cx, cy - 6);

      ctx.fillStyle = theme.textStrong;
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "SF Pro Text", "San Francisco", sans-serif';
      ctx.fillText(formatCurrency(total), cx, cy + 14);
    }

    function getSliceAtEvent(evt) {
      const rect = canvas.getBoundingClientRect();
      const dx = evt.clientX - rect.left - cx;
      const dy = evt.clientY - rect.top - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < innerRadius || dist > outerRadius + 6) return null;

      let angle = Math.atan2(dy, dx);
      if (angle < -Math.PI / 2) angle += Math.PI * 2;

      return slices.find((s) => angle >= s.startAngle && angle <= s.endAngle) || null;
    }

    canvas.onmousemove = (evt) => {
      const hit = getSliceAtEvent(evt);
      if (hit) {
        canvas.style.cursor = 'pointer';
        showTooltip(
          evt,
          `<strong>${hit.category}</strong><br/>
           Amount: ${formatCurrency(hit.amount)} (${hit.pct}%)<br/>
           <em>Click to filter</em>`
        );
      } else {
        canvas.style.cursor = 'default';
        hideTooltip();
      }
    };

    canvas.onmouseleave = hideTooltip;

    canvas.onclick = (evt) => {
      const hit = getSliceAtEvent(evt);
      if (hit && typeof onSliceClick === 'function') {
        onSliceClick(hit.category);
      }
    };
  }

  // 3. Grouped Vertical Bar Chart: Monthly Income vs Expense
  function renderMonthlyBarChart(canvas, monthlySeries) {
    if (!canvas) return;
    const { ctx, width, height } = setupHiDPICanvas(canvas);
    const theme = getThemeColors();
    ctx.clearRect(0, 0, width, height);

    if (!monthlySeries || monthlySeries.length === 0) {
      drawEmptyState(ctx, width, height, theme, 'No monthly data');
      return;
    }

    const padLeft = 56;
    const padRight = 18;
    const padTop = 22;
    const padBottom = 36;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    let maxVal = 100;
    monthlySeries.forEach((m) => {
      maxVal = Math.max(maxVal, m.income, m.expense);
    });
    maxVal *= 1.12;

    const steps = 4;
    ctx.strokeStyle = theme.grid;
    ctx.fillStyle = theme.text;
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "SF Pro Text", "San Francisco", sans-serif';
    ctx.textAlign = 'right';

    for (let i = 0; i <= steps; i++) {
      const v = (maxVal * i) / steps;
      const y = padTop + plotH - (v / maxVal) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(formatCompact(v), padLeft - 8, y + 4);
    }

    const groupWidth = plotW / monthlySeries.length;
    const barW = Math.min(24, Math.max(8, groupWidth * 0.3));
    const hitBoxes = [];

    monthlySeries.forEach((m, idx) => {
      const center = padLeft + idx * groupWidth + groupWidth / 2;
      const incH = (m.income / maxVal) * plotH;
      const expH = (m.expense / maxVal) * plotH;

      const incX = center - barW - 2;
      const incY = padTop + plotH - incH;
      const expX = center + 2;
      const expY = padTop + plotH - expH;

      ctx.fillStyle = theme.income;
      drawRoundedBar(ctx, incX, incY, barW, incH, 4);

      ctx.fillStyle = theme.expense;
      drawRoundedBar(ctx, expX, expY, barW, expH, 4);

      ctx.fillStyle = theme.text;
      ctx.textAlign = 'center';
      ctx.fillText(m.label, center, height - 12);

      hitBoxes.push({
        xLeft: center - groupWidth / 2,
        xRight: center + groupWidth / 2,
        item: m
      });
    });

    canvas.onmousemove = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const mx = evt.clientX - rect.left;
      const hit = hitBoxes.find((b) => mx >= b.xLeft && mx <= b.xRight);
      if (hit) {
        const diff = hit.item.income - hit.item.expense;
        showTooltip(
          evt,
          `<strong>${hit.item.label}</strong><br/>
           Income: ${formatCurrency(hit.item.income)}<br/>
           Expense: ${formatCurrency(hit.item.expense)}<br/>
           Net: ${formatCurrency(diff)}`
        );
      } else {
        hideTooltip();
      }
    };
    canvas.onmouseleave = hideTooltip;
  }

  // 4. Horizontal Bar Chart: Category Spend vs Monthly Budget
  function renderBudgetComparisonChart(canvas, budgetSeries) {
    if (!canvas) return;
    const { ctx, width, height } = setupHiDPICanvas(canvas);
    const theme = getThemeColors();
    ctx.clearRect(0, 0, width, height);

    const topItems = (budgetSeries || []).slice(0, 6);
    if (topItems.length === 0) {
      drawEmptyState(ctx, width, height, theme, 'No expense budget data');
      return;
    }

    const padLeft = 118;
    const padRight = 56;
    const padTop = 14;
    const padBottom = 22;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    let maxVal = 100;
    topItems.forEach((b) => {
      maxVal = Math.max(maxVal, b.monthlyAvg, b.budget);
    });
    maxVal *= 1.15;

    const rowH = plotH / topItems.length;
    const hitRows = [];

    topItems.forEach((b, idx) => {
      const yCenter = padTop + idx * rowH + rowH / 2;
      const barH = Math.min(14, rowH * 0.42);

      // Category label
      ctx.fillStyle = theme.text;
      ctx.font = '11px -apple-system, BlinkMacSystemFont, "SF Pro Text", "San Francisco", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(b.category, padLeft - 10, yCenter + 4);

      // Background budget target track
      const budgetW = (b.budget / maxVal) * plotW;
      ctx.fillStyle = theme.grid;
      ctx.fillRect(padLeft, yCenter - barH / 2, plotW, barH);

      // Actual average monthly spend bar
      const actualW = (b.monthlyAvg / maxVal) * plotW;
      const isOver = b.budget > 0 && b.monthlyAvg > b.budget;
      ctx.fillStyle = isOver ? theme.expense : b.color || theme.net;
      ctx.fillRect(padLeft, yCenter - barH / 2, Math.max(2, actualW), barH);

      // Target marker line
      if (b.budget > 0) {
        const markerX = padLeft + budgetW;
        ctx.strokeStyle = theme.textStrong;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(markerX, yCenter - barH / 2 - 3);
        ctx.lineTo(markerX, yCenter + barH / 2 + 3);
        ctx.stroke();
      }

      // Percentage label at right
      const pct = b.budget > 0 ? Math.round((b.monthlyAvg / b.budget) * 100) : 0;
      ctx.fillStyle = isOver ? theme.expense : theme.text;
      ctx.textAlign = 'left';
      ctx.fillText(`${pct}%`, padLeft + plotW + 8, yCenter + 4);

      hitRows.push({
        yTop: padTop + idx * rowH,
        yBottom: padTop + (idx + 1) * rowH,
        item: b,
        pct
      });
    });

    canvas.onmousemove = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const my = evt.clientY - rect.top;
      const hit = hitRows.find((r) => my >= r.yTop && my <= r.yBottom);
      if (hit) {
        showTooltip(
          evt,
          `<strong>${hit.item.category}</strong><br/>
           Avg Monthly Spend: ${formatCurrency(hit.item.monthlyAvg)}<br/>
           Monthly Budget: ${formatCurrency(hit.item.budget)} (${hit.pct}%)`
        );
      } else {
        hideTooltip();
      }
    };
    canvas.onmouseleave = hideTooltip;
  }

  function drawRoundedBar(ctx, x, y, w, h, r) {
    if (h <= 0) return;
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  }

  function drawEmptyState(ctx, width, height, theme, message) {
    ctx.fillStyle = theme.text;
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "SF Pro Text", "San Francisco", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(message, width / 2, height / 2);
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  window.FinPulse.Charts = {
    renderCashFlowTrend,
    renderCategoryDonut,
    renderMonthlyBarChart,
    renderBudgetComparisonChart,
    formatCurrency
  };
})();
