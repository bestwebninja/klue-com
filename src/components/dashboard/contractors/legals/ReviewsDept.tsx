/**
 * ReviewsDept — Communications > Review Response Manager
 *
 * Aggregates reviews from Google, Yelp, BBB, HomeAdvisor.
 * AI-draft response, one-click send, sentiment tracker.
 */

import { useState } from 'react';
import {
  DeptShell, KpiItem, SectionCard, StatusBadge, SimpleBarChart,
} from '@/components/dashboard/contractors/DeptShell';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

interface Review {
  id: string;
  platform: 'Google' | 'Yelp' | 'BBB' | 'HomeAdvisor' | 'Angi';
  author: string;
  rating: number;
  date: string;
  text: string;
  responded: boolean;
  draftResponse?: string;
}

const PLATFORM_COLOR: Record<string, string> = {
  Google:      'bg-blue-600/80 text-white',
  Yelp:        'bg-red-600/80 text-white',
  BBB:         'bg-sky-700/80 text-white',
  HomeAdvisor: 'bg-orange-600/80 text-white',
  Angi:        'bg-teal-600/80 text-white',
};

function generateAiDraft(review: Review): string {
  if (review.rating >= 4) {
    return `Thank you so much, ${review.author.split(' ')[0]}! We're thrilled to hear you had a great experience with our team. We take pride in quality workmanship and clear communication on every job. We look forward to serving you again!`;
  }
  if (review.rating === 3) {
    return `Hi ${review.author.split(' ')[0]}, thank you for your feedback. We're glad aspects of the project met your expectations, and we take your comments seriously. We'd love the chance to discuss any concerns further — please reach out to us directly so we can make it right.`;
  }
  return `Hi ${review.author.split(' ')[0]}, we sincerely apologize for your experience. This is not the standard we hold ourselves to. Please contact our office directly so we can address your concerns and work toward a resolution. Customer satisfaction is our top priority.`;
}

const DEMO_REVIEWS: Review[] = [
  {
    id: '1', platform: 'Google', author: 'James Harrington', rating: 5, date: '2024-04-10',
    text: 'Incredible work on our kitchen remodel. The team was professional, clean, and finished on time. Would absolutely hire again.',
    responded: true, draftResponse: undefined,
  },
  {
    id: '2', platform: 'Yelp', author: 'Maria Santos', rating: 2, date: '2024-04-08',
    text: 'Work was delayed by 3 weeks and we had poor communication throughout. The end result was OK but the process was frustrating.',
    responded: false,
  },
  {
    id: '3', platform: 'Google', author: 'David Kim', rating: 5, date: '2024-04-06',
    text: 'Best contractor we have ever worked with. Transparent pricing, great crew, and they went above and beyond.',
    responded: false,
  },
  {
    id: '4', platform: 'HomeAdvisor', author: 'Susan Blake', rating: 4, date: '2024-04-01',
    text: 'Really happy with the bathroom remodel overall. Minor punch list items took a bit longer to wrap up but they did fix everything.',
    responded: false,
  },
  {
    id: '5', platform: 'BBB', author: 'Tom Richards', rating: 1, date: '2024-03-28',
    text: 'Project was never completed and I had difficulty getting calls returned. Filed a complaint. Not recommended.',
    responded: true,
  },
];

const kpis: KpiItem[] = [
  { label: 'Avg rating', value: '3.8★', sub: 'Across all platforms', trend: 'up' },
  { label: 'Total reviews', value: String(DEMO_REVIEWS.length), sub: 'Last 30 days', trend: 'up' },
  { label: 'Unanswered', value: String(DEMO_REVIEWS.filter(r => !r.responded).length), sub: 'Awaiting response', trend: 'down' },
  { label: 'Response rate', value: '40%', sub: 'Industry avg 60%', trend: 'down' },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsDept({ onBack }: { onBack: () => void }) {
  const [reviews, setReviews] = useState<Review[]>(DEMO_REVIEWS);
  const [selected, setSelected] = useState<Review | null>(DEMO_REVIEWS[1]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<Set<string>>(new Set());

  function generateDraft(r: Review) {
    const text = generateAiDraft(r);
    setDraft(prev => ({ ...prev, [r.id]: text }));
  }

  function markResponded(id: string) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, responded: true } : r));
    setSent(prev => new Set([...prev, id]));
  }

  const platformCounts = ['Google', 'Yelp', 'BBB', 'HomeAdvisor', 'Angi'].map(p => ({
    label: p,
    value: `${reviews.filter(r => r.platform === p).length} reviews`,
    pct: Math.round((reviews.filter(r => r.platform === p).length / reviews.length) * 100),
  }));

  const positiveCount = reviews.filter(r => r.rating >= 4).length;
  const negativeCount = reviews.filter(r => r.rating <= 2).length;

  return (
    <DeptShell
      title="Review Response Manager"
      icon={MessageSquare}
      kpis={kpis}
      aiTips={[
        { text: 'Responding to negative reviews within 24 hours increases trust scores by up to 30%. You have 3 unanswered negative reviews.', action: 'Draft responses' },
        { text: 'Encourage satisfied clients (like James Harrington) to post on Google — it outweighs negative reviews algorithmically.', action: 'Send request' },
      ]}
      onBack={onBack}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Review List */}
        <SectionCard title="Recent Reviews">
          <div className="space-y-2">
            {reviews.map(r => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  selected?.id === r.id
                    ? 'border-amber-300/50 bg-amber-300/10'
                    : 'border-slate-700/40 bg-[#0a1e3c] hover:border-amber-300/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PLATFORM_COLOR[r.platform]}`}>
                      {r.platform}
                    </span>
                    <Stars rating={r.rating} />
                  </div>
                  {r.responded ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] text-amber-300 font-medium">Needs reply</span>
                  )}
                </div>
                <div className="text-xs font-medium text-slate-200">{r.author}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{r.text}</div>
                <div className="text-[10px] text-slate-500 mt-1">{r.date}</div>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Review Detail + Response */}
        <div className="space-y-3">
          {selected ? (
            <SectionCard title="Review Detail & Response">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${PLATFORM_COLOR[selected.platform]}`}>
                    {selected.platform}
                  </span>
                  <Stars rating={selected.rating} />
                  <span className="text-xs text-slate-400 ml-auto">{selected.date}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">{selected.author}</div>
                  <div className="text-xs text-slate-300 mt-1 leading-relaxed">{selected.text}</div>
                </div>

                {selected.responded || sent.has(selected.id) ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Response recorded
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-300">Your response</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-[10px] border-amber-300/30 text-amber-200 h-6 px-2"
                        onClick={() => generateDraft(selected)}
                      >
                        <RefreshCw className="w-3 h-3" />
                        AI Draft
                      </Button>
                    </div>
                    <textarea
                      value={draft[selected.id] ?? ''}
                      onChange={e => setDraft(prev => ({ ...prev, [selected.id]: e.target.value }))}
                      placeholder="Type your response or click AI Draft…"
                      rows={5}
                      className="w-full rounded-md border border-amber-300/20 bg-[#0d294f] text-slate-100 text-xs p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                    />
                    <Button
                      size="sm"
                      className="gap-1.5 bg-amber-400 text-slate-900 hover:bg-amber-300"
                      disabled={!draft[selected.id]?.trim()}
                      onClick={() => markResponded(selected.id)}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Mark as Responded
                    </Button>
                  </div>
                )}
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Review Detail">
              <p className="text-sm text-slate-400 text-center py-6">Select a review to respond.</p>
            </SectionCard>
          )}

          {/* Sentiment Summary */}
          <SectionCard title="Sentiment Overview">
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="rounded bg-[#0a1e3c] border border-emerald-500/20 p-2">
                <ThumbsUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-emerald-300">{positiveCount}</div>
                <div className="text-[10px] text-slate-400">Positive</div>
              </div>
              <div className="rounded bg-[#0a1e3c] border border-slate-600/40 p-2">
                <Star className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-amber-300">
                  {reviews.filter(r => r.rating === 3).length}
                </div>
                <div className="text-[10px] text-slate-400">Neutral</div>
              </div>
              <div className="rounded bg-[#0a1e3c] border border-red-500/20 p-2">
                <ThumbsDown className="w-4 h-4 text-red-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-red-300">{negativeCount}</div>
                <div className="text-[10px] text-slate-400">Negative</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mb-2">Reviews by Platform</div>
            <SimpleBarChart data={platformCounts} colorClass="bg-sky-500" />
          </SectionCard>
        </div>
      </div>
    </DeptShell>
  );
}
