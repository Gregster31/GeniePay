import type { Receipt } from '@/models/ReceiptModel';
import { sliceAddress } from '@/utils/WalletAddressSlicer';
import { formatCurrency, formatDateLong } from '@/utils/Format';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Build the full HTML string for a receipt */
export function buildReceiptHtml(receipt: Receipt): string {
  const recipientRows = receipt.recipients
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #2a2438;color:#d1d5db;font-size:13px;">
          ${escapeHtml(r.name ?? '—')}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #2a2438;color:#d1d5db;font-size:13px;font-family:monospace;">
          ${escapeHtml(sliceAddress(r.address))}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #2a2438;color:#a78bfa;font-size:13px;text-align:right;">
          ${r.amountUsd !== undefined ? formatCurrency(r.amountUsd) : '—'}
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #2a2438;color:#9ca3af;font-size:13px;text-align:right;">
          ${r.amountEth !== undefined ? `${r.amountEth.toFixed(6)} ${escapeHtml(receipt.currency)}` : '—'}
        </td>
      </tr>`,
    )
    .join('');

  const typeLabel = receipt.type === 'payroll' ? 'Batch Payroll' : 'Quick Pay';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>GeniePay Receipt – ${receipt.txHash.slice(0, 10)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0f0d16;
      color: #fff;
      padding: 40px;
      min-height: 100vh;
    }
    @media print {
      body { background: #fff !important; color: #000 !important; padding: 20px; }
      .no-print { display: none !important; }
      .card { background: #fff !important; border-color: #ddd !important; }
      .label { color: #555 !important; }
      .value { color: #000 !important; }
      .hash  { color: #555 !important; }
      .amount { color: #7c3aed !important; }
      table th { background: #f3f4f6 !important; color: #374151 !important; }
      table td { color: #374151 !important; border-color: #e5e7eb !important; }
      tr td:nth-child(3) { color: #7c3aed !important; }
    }
    .card {
      background: rgba(26,27,34,0.95);
      border: 1px solid rgba(124,58,237,0.3);
      border-radius: 16px;
      padding: 32px;
      max-width: 720px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(124,58,237,0.2);
    }
    .logo-circle {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 800; color: white;
    }
    .brand { font-size: 22px; font-weight: 700; color: #fff; }
    .sub   { font-size: 13px; color: #6b7280; margin-top: 2px; }
    .badge {
      margin-left: auto;
      background: rgba(34,197,94,0.1);
      border: 1px solid rgba(34,197,94,0.3);
      color: #4ade80;
      padding: 4px 14px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 600;
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin-bottom: 12px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 28px;
    }
    .meta-item { }
    .label { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
    .value { font-size: 14px; color: #e5e7eb; font-weight: 500; }
    .hash  { font-family: monospace; font-size: 12px; color: #a78bfa; word-break: break-all; }
    .amount-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(124,58,237,0.08);
      border: 1px solid rgba(124,58,237,0.2);
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .amount { font-size: 28px; font-weight: 700; color: #a78bfa; }
    .amount-sub { font-size: 13px; color: #6b7280; margin-top: 4px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    table th {
      background: rgba(124,58,237,0.12);
      color: #9ca3af;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 10px 12px;
      text-align: left;
    }
    table th:last-child, table td:last-child { text-align: right; }
    table th:nth-child(3), table td:nth-child(3) { text-align: right; }
    .footer {
      padding-top: 20px;
      border-top: 1px solid rgba(124,58,237,0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #4b5563;
    }
    .print-btn {
      margin: 24px auto 0;
      display: block;
      background: #7c3aed;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="logo-circle">G</div>
      <div>
        <div class="brand">GeniePay</div>
        <div class="sub">${typeLabel} Receipt</div>
      </div>
      <div class="badge">✓ Confirmed</div>
    </div>

    <!-- Summary -->
    <div class="section-title">Transaction Summary</div>
    <div class="amount-row">
      <div>
        <div class="label">Total Sent</div>
        <div class="amount">${formatCurrency(receipt.totalUsd)}</div>
        <div class="amount-sub">${receipt.totalCrypto.toFixed(6)} ${escapeHtml(receipt.currency)} on ${escapeHtml(receipt.network)}</div>
      </div>
      <div style="text-align:right;">
        <div class="label">Recipients</div>
        <div class="value" style="font-size:22px;font-weight:700;">${receipt.recipients.length}</div>
      </div>
    </div>

    <!-- Meta -->
    <div class="section-title">Details</div>
    <div class="meta-grid">
      <div class="meta-item">
        <div class="label">Date &amp; Time</div>
        <div class="value">${formatDateLong(receipt.createdAt)}</div>
      </div>
      <div class="meta-item">
        <div class="label">Network</div>
        <div class="value">${escapeHtml(receipt.network)}</div>
      </div>
      <div class="meta-item">
        <div class="label">From</div>
        <div class="hash">${receipt.from}</div>
      </div>
      <div class="meta-item">
        <div class="label">Transaction Hash</div>
        <div class="hash">${receipt.txHash}</div>
      </div>
      ${receipt.gasFee ? `<div class="meta-item"><div class="label">Gas Used</div><div class="value">${escapeHtml(receipt.gasFee)}</div></div>` : ''}
    </div>

    <!-- Recipients table -->
    <div class="section-title">Recipients (${receipt.recipients.length})</div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Wallet</th>
          <th>USD</th>
          <th>${escapeHtml(receipt.currency)}</th>
        </tr>
      </thead>
      <tbody>${recipientRows}</tbody>
    </table>

    <div class="footer">
      <span>Generated by GeniePay · geniepay.ca</span>
      <span>Receipt ID: ${receipt.id}</span>
    </div>
  </div>

  <button class="print-btn no-print" onclick="window.print()">
    Save as PDF / Print
  </button>
</body>
</html>`;
}

export function openReceiptPdf(receipt: Receipt): void {
  const html = buildReceiptHtml(receipt);
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const tab  = window.open(url, '_blank');

  if (tab) {
    tab.addEventListener('load', () => {
      setTimeout(() => tab.print(), 600);
    });
  }

  // Clean up object URL after a minute
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Download the receipt as a standalone .html file.
 */
export function downloadReceiptHtml(receipt: Receipt): void {
  const html     = buildReceiptHtml(receipt);
  const blob     = new Blob([html], { type: 'text/html' });
  const url      = URL.createObjectURL(blob);
  const anchor   = document.createElement('a');
  anchor.href    = url;
  anchor.download = `geniepay-receipt-${receipt.txHash.slice(0, 10)}.html`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}