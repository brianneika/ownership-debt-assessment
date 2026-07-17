import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchSessionDetail } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const BAND_CLASSES: Record<string, string> = {
  '#22c55e': 'bg-green-50 text-green-700 border-green-200',
  '#eab308': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  '#f97316': 'bg-orange-50 text-orange-700 border-orange-200',
  '#ef4444': 'bg-red-50 text-red-700 border-red-200',
};

function bandClass(hex: string | null) {
  return BAND_CLASSES[hex ?? ''] ?? 'bg-gray-50 text-gray-600 border-gray-200';
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const MODE_LABELS: Record<string, string> = {
  A: 'Mode A — Owner-Led (Transfer Barrier)',
  B: 'Mode B — Team-Led (Full OQI)',
  C: 'Mode C — Shared / No Owner (Role Clarity)',
};

// CSS-only hover tooltip — no JS state, shows on :hover/:focus via group-hover
function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group/tip">
      <svg
        tabIndex={0}
        className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500 focus:text-gray-500 outline-none cursor-help"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
      </svg>
      <span
        className="pointer-events-none absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-56 rounded-lg bg-gray-900 text-white text-xs leading-snug px-3 py-2 opacity-0 scale-95 group-hover/tip:opacity-100 group-hover/tip:scale-100 group-focus-within/tip:opacity-100 group-focus-within/tip:scale-100 transition-all duration-150 z-20"
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}

const ODS_TOOLTIP = 'Ownership Debt Score — measures how dependent this workflow is on the team leader. Higher score = more dependent.';
const OQI_TOOLTIP = 'Ownership Quality Index — measures how well-documented, accountable, and transferable this workflow is. Higher score = more transferable.';

function BusinessProfileChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2.5 py-1.5 bg-gray-50 rounded-md border border-gray-100">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-none mb-0.5">{label}</p>
      <p className="text-xs text-gray-700">{value}</p>
    </div>
  );
}

function ScorePill({ score, bandLabel, bandColor }: { score: number; bandLabel: string | null; bandColor: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-gray-900 tabular-nums">{score.toFixed(0)}</span>
      {bandLabel && (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bandClass(bandColor)}`}>
          {bandLabel}
        </span>
      )}
    </div>
  );
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const detail = await fetchSessionDetail(sessionId);

  if (!detail) notFound();

  const profileLabel = detail.drsProfile === 'solo' ? 'Solo Owner' : detail.drsProfile === 'team' ? 'Team Leader' : 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </Link>
          <form method="POST" action="/api/auth/logout">
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Respondent header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{detail.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{detail.businessName}</p>
            </div>
            <span className="text-xs text-gray-400">Completed {formatDate(detail.completedAt)}</span>
          </div>

          {/* Business profile chips */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
            {detail.businessModel && (
              <BusinessProfileChip label="Business Model" value={detail.businessModel} />
            )}
            {detail.transactionVolume && (
              <BusinessProfileChip label="Transaction Volume" value={detail.transactionVolume} />
            )}
            {detail.sideFocus && (
              <BusinessProfileChip label="Primary Focus" value={detail.sideFocus} />
            )}
            {detail.teamSize && (
              <BusinessProfileChip label="Team Size" value={detail.teamSize} />
            )}
          </div>
        </div>

        {/* Overall scores */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
              Ownership Debt Score
              <InfoTooltip text={ODS_TOOLTIP} />
            </p>
            {detail.ods ? (
              <ScorePill score={detail.ods.score} bandLabel={detail.ods.bandLabel} bandColor={detail.ods.bandColor} />
            ) : (
              <span className="text-gray-300 text-sm">Not scored</span>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Delegation Readiness Score</p>
            {detail.drs ? (
              <ScorePill score={detail.drs.score} bandLabel={detail.drs.bandLabel} bandColor={detail.drs.bandColor} />
            ) : (
              <span className="text-gray-300 text-sm">Not scored</span>
            )}
          </div>
        </div>

        {/* Workflow breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Workflow Breakdown</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {detail.workflows.map((wf) => (
              <div key={wf.key} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Workflow {wf.key}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{wf.name}</p>
                {wf.owner && (
                  <p className="text-xs text-gray-500 mb-1">Owner: <span className="font-medium text-gray-700">{wf.owner}</span></p>
                )}
                <p className="text-xs text-gray-400 mb-3">{wf.mode ? MODE_LABELS[wf.mode] : 'Mode not set'}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      ODS
                      <InfoTooltip text={ODS_TOOLTIP} />
                    </span>
                    {wf.ods ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 tabular-nums">{wf.ods.score.toFixed(0)}</span>
                        {wf.ods.bandLabel && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bandClass(wf.ods.bandColor)}`}>
                            {wf.ods.bandLabel}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>

                  {wf.mode === 'B' && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          OQI
                          <InfoTooltip text={OQI_TOOLTIP} />
                        </span>
                        {wf.oqi ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 tabular-nums">{wf.oqi.score.toFixed(0)}</span>
                            {wf.oqi.bandLabel && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${bandClass(wf.oqi.bandColor)}`}>
                                {wf.oqi.bandLabel}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>

                      {wf.oqiBreakdown.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-50 space-y-1.5">
                          {wf.oqiBreakdown.map((d) => (
                            <div key={d.label}>
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{d.label}</span>
                                <span className="text-[10px] text-gray-400 tabular-nums">{d.normalizedScore.toFixed(0)}</span>
                              </div>
                              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-400 rounded-full"
                                  style={{ width: `${Math.min(d.normalizedScore, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DRS profile + category breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-gray-900">Delegation Readiness Breakdown</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
              {profileLabel} track
            </span>
          </div>

          {detail.drsCategoryBreakdown.length === 0 ? (
            <p className="text-sm text-gray-300">No category data available.</p>
          ) : (
            <div className="space-y-3">
              {detail.drsCategoryBreakdown.map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">{cat.category}</span>
                    <span className="text-xs text-gray-400">
                      weight {(cat.weight * 100).toFixed(0)}% · <span className="font-semibold text-gray-700">{cat.normalizedScore.toFixed(0)}</span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(cat.normalizedScore, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section H — context */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Context & Priorities</h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Urgency</p>
              <p className="text-sm text-gray-800">{detail.sectionH.urgency ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Primary Goal</p>
              <p className="text-sm text-gray-800">{detail.sectionH.goal ?? '—'}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-xs text-gray-400 mb-1">For the consultant to know</p>
              <p className="text-sm text-gray-800">
                {detail.sectionH.consultantNote || <span className="text-gray-300">Not provided</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">What success looks like in 90 days</p>
              <p className="text-sm text-gray-800">
                {detail.sectionH.successVision || <span className="text-gray-300">Not provided</span>}
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
