/**
 * FollowUpsDept — Communications > Automated Follow-ups
 *
 * Sequence builder for post-bid, post-job, and review-request follow-ups.
 * Status: Active, Paused, Completed. Per-contact timeline view.
 */

import { useState } from 'react';
import {
  DeptShell, KpiItem, SectionCard, StatusBadge,
} from '@/components/dashboard/contractors/DeptShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Plus, Pause, Play, CheckCircle2, Mail, MessageSquare, Phone, Trash2 } from 'lucide-react';

type SequenceType = 'post-bid' | 'post-job' | 'review-request' | 'estimate-follow-up';
type ContactStatus = 'Active' | 'Paused' | 'Completed' | 'Opted Out';
type ChannelType = 'Email' | 'SMS' | 'Call';

interface SequenceStep {
  dayOffset: number;
  channel: ChannelType;
  subject: string;
  body: string;
}

interface Sequence {
  id: string;
  name: string;
  type: SequenceType;
  steps: SequenceStep[];
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  sequenceId: string;
  status: ContactStatus;
  startedAt: string;
  currentStep: number;
  nextSendAt: string;
}

const CHANNEL_ICON: Record<ChannelType, React.ComponentType<{ className?: string }>> = {
  Email: Mail,
  SMS: MessageSquare,
  Call: Phone,
};

const DEMO_SEQUENCES: Sequence[] = [
  {
    id: 'seq-1',
    name: 'Post-Bid Follow-up',
    type: 'post-bid',
    steps: [
      { dayOffset: 1, channel: 'Email', subject: 'Checking in on your quote', body: 'Hi [Name], just following up on the estimate we sent. Happy to answer any questions!' },
      { dayOffset: 4, channel: 'SMS', subject: '', body: 'Hi [Name], this is [Company]. Did you get a chance to review our estimate? Let us know!' },
      { dayOffset: 8, channel: 'Email', subject: 'Final follow-up on your project', body: "Hi [Name], we want to make sure our quote works for your project. Let's connect!" },
    ],
  },
  {
    id: 'seq-2',
    name: 'Review Request',
    type: 'review-request',
    steps: [
      { dayOffset: 3, channel: 'Email', subject: 'How did we do?', body: 'Hi [Name], we recently completed your project. We'd love a Google review if you're happy with our work!' },
      { dayOffset: 10, channel: 'SMS', subject: '', body: 'Hi [Name], did you get our email about leaving a review? Your feedback means a lot to our team. [Link]' },
    ],
  },
  {
    id: 'seq-3',
    name: 'Post-Job Check-in',
    type: 'post-job',
    steps: [
      { dayOffset: 7, channel: 'Email', subject: 'How is everything?', body: 'Hi [Name], it's been a week since we completed your project. Is everything looking great?' },
      { dayOffset: 30, channel: 'Email', subject: '30-day check-in', body: 'Hi [Name], just a 30-day check-in to make sure everything is holding up. Let us know if you need anything!' },
    ],
  },
];

const DEMO_CONTACTS: Contact[] = [
  { id: 'c1', name: 'James Harrington', email: 'james@email.com', phone: '(555) 101-2030', sequenceId: 'seq-2', status: 'Active', startedAt: '2024-04-08', currentStep: 1, nextSendAt: '2024-04-18' },
  { id: 'c2', name: 'Maria Santos', email: 'maria@email.com', phone: '(555) 202-3040', sequenceId: 'seq-1', status: 'Active', startedAt: '2024-04-05', currentStep: 2, nextSendAt: '2024-04-13' },
  { id: 'c3', name: 'David Kim', email: 'dkim@email.com', phone: '(555) 303-4050', sequenceId: 'seq-1', status: 'Completed', startedAt: '2024-03-20', currentStep: 3, nextSendAt: '—' },
  { id: 'c4', name: 'Susan Blake', email: 'susan@email.com', phone: '(555) 404-5060', sequenceId: 'seq-3', status: 'Active', startedAt: '2024-04-03', currentStep: 1, nextSendAt: '2024-04-10' },
  { id: 'c5', name: 'Tom Richards', email: 'tomr@email.com', phone: '(555) 505-6070', sequenceId: 'seq-2', status: 'Opted Out', startedAt: '2024-03-28', currentStep: 1, nextSendAt: '—' },
];

const STATUS_COLOR: Record<ContactStatus, 'green' | 'amber' | 'red' | 'gray'> = {
  Active: 'green',
  Paused: 'amber',
  Completed: 'gray',
  'Opted Out': 'red',
};

const kpis: KpiItem[] = [
  { label: 'Active sequences', value: String(DEMO_CONTACTS.filter(c => c.status === 'Active').length), sub: 'Contacts in queue', trend: 'up' },
  { label: 'Emails sent (30d)', value: '14', sub: '+3 SMS', trend: 'up' },
  { label: 'Response rate', value: '28%', sub: 'Industry avg 22%', trend: 'up' },
  { label: 'Opted out', value: '1', sub: 'Removed from all', trend: 'neutral' },
];

export default function FollowUpsDept({ onBack }: { onBack: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>(DEMO_CONTACTS);
  const [sequences] = useState<Sequence[]>(DEMO_SEQUENCES);
  const [selectedSeq, setSelectedSeq] = useState<Sequence>(DEMO_SEQUENCES[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Contact>>({ sequenceId: 'seq-1' });

  function toggleContactStatus(id: string) {
    setContacts(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: c.status === 'Active' ? 'Paused' : c.status === 'Paused' ? 'Active' : c.status }
        : c
    ));
  }

  function addContact() {
    if (!form.name?.trim() || !form.email?.trim()) return;
    const c: Contact = {
      id: Date.now().toString(),
      name: form.name!,
      email: form.email!,
      phone: form.phone || '—',
      sequenceId: form.sequenceId || 'seq-1',
      status: 'Active',
      startedAt: new Date().toISOString().slice(0, 10),
      currentStep: 0,
      nextSendAt: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    };
    setContacts(prev => [c, ...prev]);
    setShowAdd(false);
    setForm({ sequenceId: 'seq-1' });
  }

  const contactsInSeq = contacts.filter(c => c.sequenceId === selectedSeq.id);

  return (
    <DeptShell
      title="Automated Follow-up Sequences"
      icon={Send}
      kpis={kpis}
      aiTips={[
        { text: 'Maria Santos is on step 2 of 3 of the post-bid follow-up. Send was due yesterday — check if the auto-send fired.', action: 'Check log' },
        { text: 'Post-job check-in sequences sent at day 7 have a 31% referral conversion rate according to industry benchmarks.', action: 'View data' },
      ]}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sequence Selector */}
        <SectionCard title="Sequences">
          <div className="space-y-2">
            {sequences.map(seq => (
              <button
                key={seq.id}
                onClick={() => setSelectedSeq(seq)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selectedSeq.id === seq.id
                    ? 'border-amber-300/50 bg-amber-300/10'
                    : 'border-slate-700/40 bg-[#0a1e3c] hover:border-amber-300/30'
                }`}
              >
                <div className="text-xs font-semibold text-slate-100 mb-0.5">{seq.name}</div>
                <div className="text-[10px] text-slate-400">
                  {seq.steps.length} steps · {contacts.filter(c => c.sequenceId === seq.id && c.status === 'Active').length} active
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Sequence Steps */}
        <div className="lg:col-span-2 space-y-3">
          <SectionCard title={`${selectedSeq.name} — Steps`}>
            <div className="relative pl-4">
              {selectedSeq.steps.map((step, i) => {
                const Icon = CHANNEL_ICON[step.channel];
                return (
                  <div key={i} className="relative mb-4 last:mb-0">
                    {/* Vertical line */}
                    {i < selectedSeq.steps.length - 1 && (
                      <div className="absolute left-[-13px] top-6 bottom-[-16px] w-px bg-slate-700" />
                    )}
                    {/* Step dot */}
                    <div className="absolute left-[-20px] top-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#0a2344]" />
                    <div className="rounded-lg border border-slate-700/40 bg-[#0a1e3c] p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-3.5 h-3.5 text-amber-300" />
                        <span className="text-xs font-semibold text-slate-100">
                          Day {step.dayOffset} — {step.channel}
                        </span>
                      </div>
                      {step.subject && (
                        <div className="text-[11px] text-amber-200 mb-0.5">Subject: {step.subject}</div>
                      )}
                      <div className="text-[11px] text-slate-300 leading-relaxed">{step.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Contact list for this sequence */}
          <SectionCard
            title="Contacts in Sequence"
            action={{ label: '+ Add contact', onClick: () => setShowAdd(true) }}
          >
            {contactsInSeq.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No contacts in this sequence yet.</p>
            ) : (
              <div className="space-y-2">
                {contactsInSeq.map(c => (
                  <div key={c.id} className="flex items-center gap-3 rounded border border-slate-700/40 bg-[#0a1e3c] px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-medium text-slate-100">{c.name}</span>
                        <StatusBadge status={c.status} color={STATUS_COLOR[c.status]} />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Step {c.currentStep}/{selectedSeq.steps.length} · Next: {c.nextSendAt}
                      </div>
                    </div>
                    {(c.status === 'Active' || c.status === 'Paused') && (
                      <button
                        onClick={() => toggleContactStatus(c.id)}
                        className="shrink-0 text-slate-400 hover:text-amber-300 transition-colors"
                        title={c.status === 'Active' ? 'Pause' : 'Resume'}
                      >
                        {c.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {c.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Add Contact Form */}
      {showAdd && (
        <SectionCard title="Enroll Contact in Sequence">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Full Name *</label>
              <Input
                placeholder="Contact name"
                value={form.name ?? ''}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Email *</label>
              <Input
                type="email"
                placeholder="contact@email.com"
                value={form.email ?? ''}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Phone</label>
              <Input
                placeholder="(555) 000-0000"
                value={form.phone ?? ''}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="h-8 text-xs bg-[#0d294f] border-amber-300/20 text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 mb-1 block">Sequence</label>
              <select
                value={form.sequenceId}
                onChange={e => setForm(f => ({ ...f, sequenceId: e.target.value }))}
                className="w-full h-8 text-xs border border-amber-300/20 bg-[#0d294f] rounded-md px-2 text-slate-100"
              >
                {sequences.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-amber-400 text-slate-900 hover:bg-amber-300" onClick={addContact}>Enroll</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </SectionCard>
      )}

      {/* All Contacts Overview */}
      <SectionCard title="All Enrolled Contacts">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-slate-400 pb-2 font-medium">Name</th>
                <th className="text-left text-slate-400 pb-2 font-medium">Sequence</th>
                <th className="text-left text-slate-400 pb-2 font-medium">Status</th>
                <th className="text-right text-slate-400 pb-2 font-medium">Next Send</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => {
                const seq = sequences.find(s => s.id === c.sequenceId);
                return (
                  <tr key={c.id} className="border-b border-slate-700/30 last:border-0">
                    <td className="py-2 text-slate-200">{c.name}</td>
                    <td className="py-2 text-slate-400">{seq?.name ?? '—'}</td>
                    <td className="py-2">
                      <StatusBadge status={c.status} color={STATUS_COLOR[c.status]} />
                    </td>
                    <td className="py-2 text-right text-slate-400">{c.nextSendAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </DeptShell>
  );
}
