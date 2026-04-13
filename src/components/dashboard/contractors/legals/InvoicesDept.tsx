/**
 * InvoicesDept — Finance › Invoices
 * Create invoices from accepted quotes, track payment status,
 * and download as a printable HTML file.
 */
import { useState } from 'react';
import { Plus, Download, CheckCircle2, Clock, AlertCircle, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LineItem { id: string; description: string; qty: number; rate: number; }
interface Invoice {
  id: string;
  invoiceNo: string;
  clientName: string;
  clientEmail: string;
  siteAddress: string;
  issueDate: string;
  dueDate: string;
  items: LineItem[];
  notes: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: number;
}

function genId() { return Math.random().toString(36).slice(2, 9); }
function genInvoiceNo(list: Invoice[]) {
  return `INV-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
}

const STATUS_STYLE: Record<Invoice['status'], string> = {
  draft:   'bg-slate-500/20 text-slate-300 border-slate-500/40',
  sent:    'bg-sky-500/20 text-sky-300 border-sky-500/40',
  paid:    'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  overdue: 'bg-red-500/20 text-red-300 border-red-500/40',
};

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildInvoiceHtml(inv: Invoice): string {
  const subtotal = inv.items.reduce((s, i) => s + i.qty * i.rate, 0);
  const tax = subtotal * 0.0; // no tax by default
  const total = subtotal + tax;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${inv.invoiceNo}</title>
<style>body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:40px;max-width:750px;margin:0 auto}
h1{color:#ff6b00;font-size:24px}h2{color:#ff6b00;font-size:13px;margin-top:20px}
table{width:100%;border-collapse:collapse;margin:12px 0}th,td{padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:left}
th{background:#f3f4f6;font-size:11px;text-transform:uppercase}.total-row{font-weight:700;font-size:15px}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#e8f5e9;color:#2e7d32}
.footer{margin-top:40px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}
</style></head><body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #ff6b00;padding-bottom:16px;margin-bottom:20px">
  <div><h1>INVOICE</h1><p style="margin:0;color:#6b7280">${inv.invoiceNo}</p></div>
  <div style="text-align:right;font-size:12px"><div><strong>Issue Date:</strong> ${inv.issueDate}</div><div><strong>Due Date:</strong> ${inv.dueDate}</div><div style="margin-top:6px" class="badge">STATUS: ${inv.status.toUpperCase()}</div></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
  <div><h2>Bill To</h2><p><strong>${inv.clientName}</strong><br>${inv.siteAddress}<br><a href="mailto:${inv.clientEmail}">${inv.clientEmail}</a></p></div>
</div>
<h2>Services</h2>
<table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>
${inv.items.map(i => `<tr><td>${i.description}</td><td>${i.qty}</td><td>${fmt(i.rate)}</td><td>${fmt(i.qty * i.rate)}</td></tr>`).join('')}
</tbody></table>
<div style="text-align:right;margin-top:8px">
  <div>Subtotal: <strong>${fmt(subtotal)}</strong></div>
  <div class="total-row" style="margin-top:6px;font-size:18px;color:#ff6b00">Total Due: ${fmt(total)}</div>
</div>
${inv.notes ? `<h2>Notes</h2><p style="font-size:12px;color:#4b5563">${inv.notes}</p>` : ''}
<div class="footer">Payment due by ${inv.dueDate}. Late payments subject to 1.5%/month. Thank you for your business.</div>
</body></html>`;
}

export default function InvoicesDept({ onBack }: { onBack: () => void }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', siteAddress: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '', notes: '',
  });
  const [items, setItems] = useState<LineItem[]>([{ id: genId(), description: '', qty: 1, rate: 0 }]);

  const setF = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const updateItem = (id: string, k: keyof LineItem, v: string | number) =>
    setItems(p => p.map(i => i.id === id ? { ...i, [k]: v } : i));
  const addItem = () => setItems(p => [...p, { id: genId(), description: '', qty: 1, rate: 0 }]);
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));

  const subtotal = items.reduce((s, i) => s + (i.qty || 0) * (i.rate || 0), 0);

  const saveInvoice = () => {
    const inv: Invoice = {
      id: genId(), invoiceNo: genInvoiceNo(invoices),
      ...form, items, status: 'draft', createdAt: Date.now(),
    };
    setInvoices(p => [inv, ...p]);
    setCreating(false);
    setItems([{ id: genId(), description: '', qty: 1, rate: 0 }]);
    setForm({ clientName: '', clientEmail: '', siteAddress: '', issueDate: new Date().toISOString().slice(0, 10), dueDate: '', notes: '' });
  };

  const setStatus = (id: string, status: Invoice['status']) =>
    setInvoices(p => p.map(i => i.id === id ? { ...i, status } : i));

  const download = (inv: Invoice) => {
    const blob = new Blob([buildInvoiceHtml(inv)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${inv.invoiceNo}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const totals = {
    total: invoices.reduce((s, i) => s + i.items.reduce((si, li) => si + li.qty * li.rate, 0), 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.items.reduce((si, li) => si + li.qty * li.rate, 0), 0),
    outstanding: invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.items.reduce((si, li) => si + li.qty * li.rate, 0), 0),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-slate-100">Invoices</h3>
        <Button size="sm" onClick={() => setCreating(v => !v)}
          className="text-xs gap-1.5 bg-amber-400 text-[#1f3455] hover:bg-amber-300">
          <Plus className="h-3.5 w-3.5" /> New Invoice
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[['Total Invoiced', fmt(totals.total), 'text-slate-200'],
          ['Collected', fmt(totals.paid), 'text-emerald-300'],
          ['Outstanding', fmt(totals.outstanding), 'text-amber-300']].map(([l, v, c]) => (
          <div key={l} className="rounded-lg bg-[#0d294f] border border-amber-300/20 p-3 text-center">
            <p className={`text-lg font-bold ${c}`}>{v}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{l}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {creating && (
        <div className="rounded-lg border border-amber-300/30 bg-[#0d294f] p-4 space-y-4">
          <p className="text-xs font-semibold text-amber-300 uppercase tracking-wide">New Invoice</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([['clientName','Client Name','Acme Corp'],['clientEmail','Email','billing@acme.com'],
               ['siteAddress','Site Address','123 Main St'],['issueDate','Issue Date',''],
               ['dueDate','Due Date',''],] as const).map(([k, label, ph]) => (
              <div key={k} className="space-y-1.5">
                <Label className="text-[11px] text-slate-400">{label}</Label>
                <Input type={k.includes('Date') ? 'date' : 'text'} value={form[k]} onChange={e => setF(k, e.target.value)}
                  placeholder={ph} className="h-8 text-xs bg-[#07182f] border-amber-300/25 text-slate-100" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400 font-medium">Line Items</p>
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <Input value={item.description} onChange={e => updateItem(item.id,'description',e.target.value)}
                  placeholder="Description" className="col-span-6 h-8 text-xs bg-[#07182f] border-amber-300/25 text-slate-100" />
                <Input type="number" value={item.qty || ''} onChange={e => updateItem(item.id,'qty',parseFloat(e.target.value)||0)}
                  placeholder="Qty" className="col-span-2 h-8 text-xs bg-[#07182f] border-amber-300/25 text-slate-100" />
                <Input type="number" value={item.rate || ''} onChange={e => updateItem(item.id,'rate',parseFloat(e.target.value)||0)}
                  placeholder="Rate $" className="col-span-3 h-8 text-xs bg-[#07182f] border-amber-300/25 text-slate-100" />
                <button onClick={() => removeItem(item.id)} className="col-span-1 text-slate-500 hover:text-red-400 flex justify-center">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="text-xs text-amber-300 gap-1">
                <Plus className="h-3 w-3" /> Add Line
              </Button>
              <span className="text-sm font-semibold text-amber-300">Subtotal: {fmt(subtotal)}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-400">Notes</Label>
            <Input value={form.notes} onChange={e => setF('notes', e.target.value)}
              placeholder="Payment instructions, terms…" className="h-8 text-xs bg-[#07182f] border-amber-300/25 text-slate-100" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={saveInvoice} className="text-xs bg-amber-400 text-[#1f3455] hover:bg-amber-300">Save Invoice</Button>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)} className="text-xs text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {/* Invoice list */}
      {invoices.length === 0 && !creating && (
        <div className="text-center py-10 text-slate-400 border border-dashed border-amber-300/20 rounded-lg">
          <p className="text-sm">No invoices yet.</p>
          <p className="text-xs mt-1">Click "New Invoice" to create your first one.</p>
        </div>
      )}

      {invoices.map(inv => {
        const total = inv.items.reduce((s, i) => s + i.qty * i.rate, 0);
        return (
          <div key={inv.id} className="rounded-lg border border-amber-300/20 bg-[#0d294f] p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-100">{inv.invoiceNo}</span>
                  <Badge className={cn('text-[10px] border', STATUS_STYLE[inv.status])}>{inv.status.toUpperCase()}</Badge>
                </div>
                <p className="text-xs text-slate-300">{inv.clientName} · {inv.siteAddress}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Due: {inv.dueDate || '—'} · {inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-300">{fmt(total)}</p>
                <div className="flex gap-1.5 mt-2 justify-end flex-wrap">
                  {inv.status !== 'paid' && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(inv.id,'paid')}
                      className="text-[10px] h-6 px-2 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/10">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Paid
                    </Button>
                  )}
                  {inv.status === 'draft' && (
                    <Button size="sm" variant="outline" onClick={() => setStatus(inv.id,'sent')}
                      className="text-[10px] h-6 px-2 text-sky-300 border-sky-500/40 hover:bg-sky-500/10">
                      <Clock className="h-3 w-3 mr-1" /> Mark Sent
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setPreview(inv)}
                    className="text-[10px] h-6 px-2 text-slate-300 border-amber-300/30">
                    <Eye className="h-3 w-3 mr-1" /> Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => download(inv)}
                    className="text-[10px] h-6 px-2 text-amber-300 border-amber-300/30">
                    <Download className="h-3 w-3 mr-1" /> HTML
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Inline preview */}
      {preview && (
        <div className="rounded-lg border border-amber-300/30 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[#0d294f] border-b border-amber-300/20">
            <span className="text-xs font-medium text-slate-200">Preview — {preview.invoiceNo}</span>
            <Button size="sm" variant="ghost" onClick={() => setPreview(null)} className="text-xs text-slate-400 h-6">Close</Button>
          </div>
          <iframe srcDoc={buildInvoiceHtml(preview)} className="w-full" style={{ height: 420, border: 'none' }} title="Invoice Preview" sandbox="allow-same-origin allow-modals" />
        </div>
      )}
    </div>
  );
}
