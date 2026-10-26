# TabungKita

**Minimalist Personal Finance, JANM Salary & DuitNow QR Analytics Dashboard**

An Apple-inspired, zero-dependency personal finance web application designed for Malaysian banking workflows. Built with pure HTML5, CSS3, and vanilla JavaScript featuring a custom High-DPI Canvas charting engine, automatic **JANM → RHB Bank** salary detection, **DuitNow QR / Apple Pay / Touch 'n Go** smart receipt parsing, and **Google Sheets / Gmail** cloud sync.

---

## Key Features

- **Apple-Inspired Minimalist UI**: Designed with Apple's San Francisco typography, frosted-glass navigation, collapsible icon-only sidebar (desktop), floating iOS bottom tab bar (mobile), and automatic device Light/Dark mode (`prefers-color-scheme`).
- **Interactive HiDPI Charts**:
  - **Cash Flow Trajectory**: Toggleable Area & Line chart tracking monthly income, expenses, and net savings.
  - **Spending by Category**: Interactive Donut & Pie chart with click-to-filter slices.
  - **Monthly Comparison & Budget Utilization**: Grouped bar and horizontal budget progress charts in `RM`.
- **JANM → RHB Bank Auto-Salary Detector**: Automatically credits monthly *Gaji Bersih* on official JANM payday dates (even when banks send no SMS alert) and extracts `GAJI BERSIH` from *e-Penyata Gaji* text/OCR.
- **Smart Notification & QR Receipt Parser**: Paste or forward bank SMS alerts, **DuitNow QR** receipts, **Touch 'n Go eWallet (RFID)** logs, **Apple Pay** notifications, or **RHB FPX/JomPAY** history to auto-extract amount, merchant, account, and category.
- **iPhone Shortcuts & Google Cloud Sync**: Includes an iOS Shortcuts guide and a ready-to-deploy Google Apps Script ([`integrations/google-apps-script.gs`](integrations/google-apps-script.gs)) for automatic Gmail scanning and cross-device Google Sheets synchronization.
- **Export & Portability**: One-click CSV export/import and print-ready executive PDF financial reports.

---

## Quick Start

No build step or package installation required:
1. Clone or download this repository.
2. Open `index.html` in any modern browser, or deploy directly to **GitHub Pages**, **Netlify**, or **Cloudflare Pages**.
3. On iPhone (Safari), tap **Share → Add to Home Screen** to use **TabungKita** as a full-screen mobile web app.
