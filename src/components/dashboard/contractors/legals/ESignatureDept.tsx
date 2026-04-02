import { useState } from 'react';
import {
  DeptShell, KpiItem, AiTip, FieldGroup, Field, SelectField,
  SimpleBarChart, SectionCard, StatusBadge, OcrBanner,
} from '@/components/dashboard/contractors/DeptShell';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pen, Upload, CheckCircle, Clock, ExternalLink } from 'lucide-react';

const KPIS: KpiItem[] = [
  { label: 'Pending Signatures', value: '6',      sub: '2 overdue >48 hrs',       trend: 'down'    },
  { label: 'Completed Today',    value: '3',      sub: 'All in under 12 min',      trend: 'up'      },
  { label: 'Avg Completion',     value: '8.4 hrs', sub: '↓ from 14.2 hrs',        trend: 'up'      },
  { label: 'Fraud Flags',        value: '1',      sub: 'OCR anomaly detected',     trend: 'down'    },
];

const AI_TIPS: AiTip[] = [
  { text: "Document 'Subcontract_Rivera_v3.pdf' has a signature block that OCR identifies as a photocopy paste — not a genuine e-signature. Flagged for review.", action: 'Review Now' },
  { text: "Signer 'D. Reyes' has not opened the document in 72 hrs. Auto-reminder sent. Consider phone follow-up.", action: 'Call Signer' },
  { text: 'State of FL requires specific e-signature disclosure language for construction contracts >$50k. Check template compliance.', action: 'Check Rules' },
  { text: 'Connecting to your Agreements department: 4 agreements are awaiting countersignature. Batch-send option available.', action: 'Batch Send' },
];

const SIGNATURE_QUEUE = [
  { doc: 'Subcontract_Rivera_v3.pdf',       signer: 'J. Rivera',   status: 'Flagged'    as const, color: 'red'   as const, daysLeft: 0  },
  { doc: 'OwnerAgreement_LakesideDev.pdf',   signer: 'M. Torres',   status: 'Pending'    as const, color: 'amber' as const, daysLeft: 2  },
  { doc: 'ChangeOrder_CO-044.pdf',           signer: 'D. Reyes',    status: 'Overdue'    as const, color: 'red'   as const, daysLeft: -1 },
  { doc: 'NDA_OrionArch_2026.pdf',           signer: 'R. Patel',    status: 'Opened'     as const, color: 'blue'  as const, daysLeft: 3  },
  { doc: 'LienWaiver_BluRidgeConcrete.pdf',  signer: 'A. Nguyen',   status: 'Completed'  as const, color: 'green' as const, daysLeft: 5  },
];

const COMPLETION_CHART = [
  { label: 'Same-day',   value: '45%', pct: 45 },
  { label: '1–3 days',   value: '32%', pct: 32 },
  { label: '4–7 days',   value: '15%', pct: 15 },
  { label: '>7 days',    value: '8%',  pct: 8  },
];

const AUDIT_EVENTS = [
  { time: '09:14', label: 'Doc sent',             done: true  },
  { time: '09:47', label: 'Opened by Signer 1',   done: true  },
  { time: '09:52', label: 'Signed by Signer 1',   done: true  },
  { time: '11:23', label: 'Counter-signed',        done: true  },
  { time: '11:24', label: 'Completed',             done: true  },
];

const CROSS_LINKS = ['Agreements', 'Attorneys', 'Projects'];

interface ESignForm {
  docName: string; docType: string; relatedAgreement: string;
  signer1Name: string; signer1Email: string; signer1Role: string;
  signer2Name: string; signer2Email: string;
  signer3Name: string; signer3Email: string;
  signatureDeadline: string; message: string;
  signatureMethod: string; idVerification: string;
}

export default function ESignatureDept({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<ESignForm>({
    docName: '', docType: '', relatedAgreement: '',
    signer1Name: '', signer1Email: '', signer1Role: '',
    signer2Name: '', signer2Email: '',
    signer3Name: '', signer3Email: '',
    signatureDeadline: '', message: '',
    signatureMethod: '', idVerification: '',
  });

  const set = (k: keyof ESignForm) => (v: string) => setForm(f => ({ ...f, [k]: v }));
  const setE = (k: keyof ESignForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <DeptShell
      title="E-Signature Department"
      icon={Pen}
      kpis={KPIS}
      aiTips={AI_TIPS}
      onBack={onBack}
    >
      {/* ── Send for Signature ── */}
      <SectionCard title="Send for Signature">
        <div className="space-y-4">
          <FieldGroup>
            <Field label="Document Name" required>
              <Input value={form.docName} onChange={setE('docName')} placeholder="e.g. Subcontract_Rivera_v3.pdf" />
            </Field>
            <Field label="Document Type">
              <SelectField
                placeholder="Select type"
                options={['Subcontract','Owner Agreement','Change Order','NDA','Lien Waiver','Permit Application','Insurance Certificate','Lease','Other']}
                value={form.docType}
                onChange={set('docType')}
              />
            </Field>
            <Field label="Related Agreement #" hint="Link to Agreements dept">
              <Input value={form.relatedAgreement} onChange={setE('relatedAgreement')} placeholder="e.g. A-2026-045" />
            </Field>
            <Field label="Signature Deadline" required>
              <Input type="date" value={form.signatureDeadline} onChange={setE('signatureDeadline')} />
            </Field>
          </FieldGroup>

          {/* Signer 1 */}
          <div className="rounded-md border border-border/50 p-3 space-y-3 bg-muted/10">
            <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Signer 1</p>
            <FieldGroup>
              <Field label="Name" required>
                <Input value={form.signer1Name} onChange={setE('signer1Name')} placeholder="Full name" />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.signer1Email} onChange={setE('signer1Email')} placeholder="signer@email.com" />
              </Field>
              <Field label="Role">
                <SelectField
                  placeholder="Select role"
                  options={['Owner','GC','Subcontractor','Supplier','Architect','Attorney','Lender','Title Officer','Other']}
                  value={form.signer1Role}
                  onChange={set('signer1Role')}
                />
              </Field>
            </FieldGroup>
          </div>

          {/* Signer 2 */}
          <div className="rounded-md border border-border/50 p-3 space-y-3 bg-muted/10">
            <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Signer 2 (optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={form.signer2Name} onChange={setE('signer2Name')} placeholder="Full name" />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.signer2Email} onChange={setE('signer2Email')} placeholder="signer@email.com" />
              </Field>
            </div>
          </div>

          {/* Signer 3 */}
          <div className="rounded-md border border-border/50 p-3 space-y-3 bg-muted/10">
            <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Signer 3 (optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={form.signer3Name} onChange={setE('signer3Name')} placeholder="Full name" />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.signer3Email} onChange={setE('signer3Email')} placeholder="signer@email.com" />
              </Field>
            </div>
          </div>

          <Field label="Message to Signers" hint="Brief note sent with the document request" fullWidth>
            <textarea
              value={form.message}
              onChange={setE('message')}
              rows={3}
              className="w-full text-sm border border-input bg-background rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400/50 text-foreground resize-none"
              placeholder="Please review and sign at your earliest convenience..."
            />
          </Field>

          {/* Upload Document — drag-drop zone */}
          <Field label="Upload Document" fullWidth>
            <div className="contractor-upload-zone">
              <Upload className="w-6 h-6 text-orange-400" />
              <p className="text-xs text-muted-foreground text-center">
                Drag &amp; drop document here, or <span className="text-orange-500 font-medium">browse</span>
              </p>
              <p className="text-[10px] text-muted-foreground">PDF only — max 25 MB</p>
            </div>
          </Field>

          <OcrBanner />

          <FieldGroup>
            <Field label="Signature Method">
              <SelectField
                placeholder="Select method"
                options={['Kluje E-Sign (in-platform)','DocuSign (API)','Adobe Sign (API)','HelloSign (API)','Wet Ink — Upload Scan']}
                value={form.signatureMethod}
                onChange={set('signatureMethod')}
              />
            </Field>
            <Field label="Require ID Verification">
              <SelectField
                placeholder="Select"
                options={['Yes — SMS OTP','Yes — ID photo','No']}
                value={form.idVerification}
                onChange={set('idVerification')}
              />
            </Field>
          </FieldGroup>

          <div className="flex gap-2 pt-1">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8">Send for Signature</Button>
            <Button variant="outline" className="text-xs h-8">Save Draft</Button>
          </div>
        </div>
      </SectionCard>

      {/* ── Signature Queue ── */}
      <SectionCard title="Signature Queue">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="text-left py-2 pr-4 font-medium">Document</th>
                <th className="text-left py-2 pr-4 font-medium">Signer</th>
                <th className="text-left py-2 pr-4 font-medium">Status</th>
                <th className="text-left py-2 font-medium">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {SIGNATURE_QUEUE.map(row => (
                <tr key={row.doc} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                  <td className="py-2 pr-4 font-medium max-w-[180px] truncate">{row.doc}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{row.signer}</td>
                  <td className="py-2 pr-4"><StatusBadge status={row.status} color={row.color} /></td>
                  <td className={`py-2 font-semibold ${row.daysLeft < 0 ? 'text-red-600' : row.daysLeft <= 2 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                    {row.daysLeft < 0 ? 'Overdue' : row.daysLeft === 0 ? 'Today' : `${row.daysLeft}d`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Completion Rate ── */}
      <SectionCard title="Completion Rate">
        <SimpleBarChart data={COMPLETION_CHART} />
      </SectionCard>

      {/* ── Audit Trail ── */}
      <SectionCard title="Audit Trail — Last Completed Document">
        <div className="relative pl-5">
          {AUDIT_EVENTS.map((evt, i) => (
            <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
              {/* vertical line */}
              {i < AUDIT_EVENTS.length - 1 && (
                <div className="absolute left-[-10px] top-4 bottom-0 w-px bg-border/60" />
              )}
              <div className={`absolute left-[-14px] top-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${evt.done ? 'bg-orange-500' : 'bg-muted border border-border'}`}>
                {evt.done
                  ? <CheckCircle className="w-3 h-3 text-white" />
                  : <Clock className="w-3 h-3 text-muted-foreground" />
                }
              </div>
              <div className="ml-1">
                <span className="text-[11px] font-medium text-foreground">{evt.label}</span>
                <span className="text-[11px] text-muted-foreground ml-2">{evt.time}</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Cross-links ── */}
      <div className="flex flex-wrap gap-2">
        {CROSS_LINKS.map(link => (
          <button
            key={link}
            className="flex items-center gap-1 text-[11px] text-orange-500 hover:text-orange-600 border border-orange-200 dark:border-orange-800 rounded-md px-2.5 py-1 hover:bg-orange-50/50 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {link}
          </button>
        ))}
      </div>
    </DeptShell>
  );
}
