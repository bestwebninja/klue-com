/**
 * generateContract — produces a professional dark-themed HTML contract document.
 *
 * Pure TypeScript: no external dependencies, fully self-contained.
 * Output is a complete HTML string safe for dangerouslySetInnerHTML preview
 * and PDF generation.
 */

export interface ContractLineItem {
  description: string;
  amount: number;
}

export interface ContractData {
  title: string;
  contractorName: string;
  contractorLicense?: string;
  contractorEmail?: string;
  contractorPhone?: string;
  homeownerName: string;
  homeownerAddress: string;
  tradeType: string;
  scopeOfWork: string;
  lineItems: ContractLineItem[];
  startDate?: string;
  estimatedCompletionDate?: string;
  paymentSchedule?: Array<{ milestone: string; percentage: number }>;
  warrantyMonths?: number;
  specialConditions?: string;
  generatedDate?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateContract(data: ContractData): string {
  const totalAmount = data.lineItems.reduce((sum, li) => sum + li.amount, 0);
  const generatedDate = data.generatedDate ?? new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const defaultPaymentSchedule = data.paymentSchedule ?? [
    { milestone: "Contract Signing (Deposit)", percentage: 25 },
    { milestone: "Project Midpoint", percentage: 50 },
    { milestone: "Final Inspection & Completion", percentage: 25 },
  ];

  const warrantyMonths = data.warrantyMonths ?? 12;

  const lineItemRows = data.lineItems.map((li) => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #2a2a3a; color:#c8c8d4;">${li.description}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #2a2a3a; color:#c8c8d4; text-align:right;">${formatCurrency(li.amount)}</td>
    </tr>`).join("");

  const paymentRows = defaultPaymentSchedule.map((p) => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #2a2a3a; color:#c8c8d4;">${p.milestone}</td>
      <td style="padding:10px 12px; border-bottom:1px solid #2a2a3a; color:#a78bfa; text-align:right; font-weight:600;">${p.percentage}%</td>
      <td style="padding:10px 12px; border-bottom:1px solid #2a2a3a; color:#c8c8d4; text-align:right;">${formatCurrency(totalAmount * p.percentage / 100)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0f0f1a;
    color: #e2e2f0;
    font-family: 'Georgia', serif;
    font-size: 14px;
    line-height: 1.6;
    padding: 40px 32px;
    max-width: 860px;
    margin: 0 auto;
  }
  h1 { font-size: 22px; color: #a78bfa; letter-spacing: 0.5px; margin-bottom: 4px; }
  h2 { font-size: 13px; color: #8b8ba8; font-weight: 400; margin-bottom: 32px; letter-spacing: 1px; text-transform: uppercase; }
  h3 { font-size: 11px; color: #a78bfa; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; margin-top: 28px; }
  .header { border-bottom: 2px solid #a78bfa; padding-bottom: 20px; margin-bottom: 28px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .meta-card {
    background: #16162a;
    border: 1px solid #2a2a3a;
    border-radius: 8px;
    padding: 16px 18px;
  }
  .meta-label { font-size: 10px; color: #6b6b88; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .meta-value { color: #e2e2f0; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; background: #16162a; border: 1px solid #2a2a3a; border-radius: 8px; overflow: hidden; }
  thead tr { background: #1e1e36; }
  thead th { padding: 10px 12px; text-align: left; font-size: 10px; color: #8b8ba8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  thead th:last-child { text-align: right; }
  .total-row td { background: #1e1e36; padding: 12px; color: #a78bfa; font-weight: 700; font-size: 15px; }
  .section { margin-bottom: 28px; }
  .scope-box {
    background: #16162a;
    border: 1px solid #2a2a3a;
    border-left: 3px solid #a78bfa;
    border-radius: 8px;
    padding: 16px 18px;
    color: #c8c8d4;
    white-space: pre-wrap;
    font-family: Georgia, serif;
    line-height: 1.7;
  }
  .legal-text {
    background: #16162a;
    border: 1px solid #2a2a3a;
    border-radius: 8px;
    padding: 16px 18px;
    color: #8b8ba8;
    font-size: 12px;
    line-height: 1.7;
  }
  .legal-text p { margin-bottom: 10px; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; }
  .sig-block {
    background: #16162a;
    border: 1px solid #2a2a3a;
    border-radius: 8px;
    padding: 18px;
  }
  .sig-line { border-top: 1px solid #4a4a60; margin-top: 48px; margin-bottom: 6px; }
  .sig-label { font-size: 11px; color: #6b6b88; }
  .badge {
    display: inline-block;
    background: #1e1e36;
    border: 1px solid #a78bfa;
    color: #a78bfa;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
</style>
</head>
<body>

<div class="header">
  <div class="badge">Construction Services Agreement</div>
  <h1>${data.title}</h1>
  <h2>Dated ${generatedDate}</h2>
</div>

<div class="meta-grid">
  <div class="meta-card">
    <div class="meta-label">Contractor</div>
    <div class="meta-value"><strong>${data.contractorName}</strong></div>
    ${data.contractorLicense ? `<div class="meta-value" style="font-size:12px;color:#8b8ba8;">License: ${data.contractorLicense}</div>` : ""}
    ${data.contractorEmail ? `<div class="meta-value" style="font-size:12px;color:#8b8ba8;">${data.contractorEmail}</div>` : ""}
    ${data.contractorPhone ? `<div class="meta-value" style="font-size:12px;color:#8b8ba8;">${data.contractorPhone}</div>` : ""}
  </div>
  <div class="meta-card">
    <div class="meta-label">Homeowner / Client</div>
    <div class="meta-value"><strong>${data.homeownerName}</strong></div>
    <div class="meta-value" style="font-size:12px;color:#8b8ba8;">${data.homeownerAddress}</div>
  </div>
  <div class="meta-card">
    <div class="meta-label">Trade Type</div>
    <div class="meta-value">${data.tradeType}</div>
  </div>
  <div class="meta-card">
    <div class="meta-label">Project Timeline</div>
    ${data.startDate ? `<div class="meta-value">Start: ${data.startDate}</div>` : ""}
    ${data.estimatedCompletionDate ? `<div class="meta-value" style="font-size:12px;color:#8b8ba8;">Est. Completion: ${data.estimatedCompletionDate}</div>` : ""}
  </div>
</div>

<div class="section">
  <h3>Scope of Work</h3>
  <div class="scope-box">${data.scopeOfWork}</div>
</div>

<div class="section">
  <h3>Cost Breakdown</h3>
  <table>
    <thead>
      <tr>
        <th>Item / Description</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemRows}
      <tr class="total-row">
        <td style="text-align:left; padding:12px;">Total Contract Amount</td>
        <td style="text-align:right; padding:12px;">${formatCurrency(totalAmount)}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h3>Payment Schedule</h3>
  <table>
    <thead>
      <tr>
        <th>Milestone</th>
        <th style="text-align:right;">%</th>
        <th style="text-align:right;">Amount Due</th>
      </tr>
    </thead>
    <tbody>
      ${paymentRows}
    </tbody>
  </table>
</div>

<div class="section">
  <h3>Terms &amp; Conditions</h3>
  <div class="legal-text">
    <p><strong>1. Scope Changes.</strong> Any changes to the scope of work must be agreed upon in writing via a signed Change Order before additional work commences. Verbal agreements regarding scope changes are not binding.</p>
    <p><strong>2. Materials.</strong> Unless otherwise specified, Contractor shall supply all labor, materials, tools, and equipment necessary to complete the work described above. Homeowner-supplied materials are the responsibility of the Homeowner for quality and timely delivery.</p>
    <p><strong>3. Warranty.</strong> Contractor warrants all workmanship for ${warrantyMonths} months from the date of final completion. This warranty covers defects in workmanship only and does not cover damage caused by homeowner misuse, natural disasters, or normal wear and tear.</p>
    <p><strong>4. Permits.</strong> Contractor shall obtain all required permits unless otherwise noted. Permit fees are included in the contract price unless itemized separately.</p>
    <p><strong>5. Access.</strong> Homeowner agrees to provide Contractor reasonable access to the property during normal working hours (7 AM – 6 PM, Monday–Saturday) for the duration of the project.</p>
    <p><strong>6. Dispute Resolution.</strong> In the event of a dispute, both parties agree to attempt mediation before pursuing legal action. The prevailing party in any legal proceeding shall be entitled to recover reasonable attorney's fees.</p>
    <p><strong>7. Termination.</strong> Either party may terminate this agreement with 5 days' written notice. Homeowner shall pay for all work completed and materials purchased prior to termination.</p>
    <p><strong>8. Governing Law.</strong> This agreement shall be governed by the laws of the state where the project is located.</p>
    ${data.specialConditions ? `<p><strong>9. Special Conditions.</strong> ${data.specialConditions}</p>` : ""}
  </div>
</div>

<div class="sig-grid">
  <div class="sig-block">
    <div class="meta-label" style="margin-bottom:8px;">Contractor Signature</div>
    <div style="height:80px;display:flex;align-items:flex-end;">
      <div style="width:100%;">
        <div class="sig-line"></div>
        <div class="sig-label">${data.contractorName}</div>
        <div class="sig-label">Date: _______________</div>
      </div>
    </div>
  </div>
  <div class="sig-block">
    <div class="meta-label" style="margin-bottom:8px;">Homeowner Signature</div>
    <div style="height:80px;display:flex;align-items:flex-end;">
      <div style="width:100%;">
        <div class="sig-line"></div>
        <div class="sig-label">${data.homeownerName}</div>
        <div class="sig-label">Date: _______________</div>
      </div>
    </div>
  </div>
</div>

<div style="margin-top:40px; padding-top:20px; border-top:1px solid #2a2a3a; text-align:center; color:#4a4a60; font-size:11px;">
  Generated by Kluje Neural Command OS &bull; ${generatedDate} &bull; This document constitutes a legally binding agreement when signed by both parties.
</div>

</body>
</html>`;
}
