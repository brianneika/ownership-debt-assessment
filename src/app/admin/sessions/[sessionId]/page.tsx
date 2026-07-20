import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchSessionDetail, fetchSessionName, type WorkflowDetail } from '@/lib/admin';
import { buildStartHere, OQI_DIMENSION_NAMES, RED_FLAG_THRESHOLD } from '@/lib/insight';
import PrintControls from './PrintControls';

export const dynamic = 'force-dynamic';

// The document <title> seeds the print dialog's suggested PDF filename, so make
// it the respondent's name rather than the route path.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}): Promise<Metadata> {
  const { sessionId } = await params;
  const name = await fetchSessionName(sessionId);
  return { title: name ? `Ownership Report — ${name}` : 'Ownership Report' };
}

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

function AnswerRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
      <p className={`text-xs ${emphasize ? 'font-semibold text-red-700' : 'text-gray-700'}`}>{value}</p>
    </div>
  );
}

// Mode-appropriate answer detail, collapsed by default (CSS-only via <details>)
function WorkflowAnswers({ wf }: { wf: WorkflowDetail }) {
  const d = wf.diagnostics;
  if (!d) return null;

  let body: ReactNode = null;

  if (d.mode === 'A') {
    body = (
      <div className="space-y-2.5">
        {d.hoursPerWeek && <AnswerRow label="Owner's time on this workflow" value={`${d.hoursPerWeek} / week`} />}
        {d.reasonNotDelegated && <AnswerRow label="Why it hasn't been delegated" value={d.reasonNotDelegated} />}
        {d.process && (
          <AnswerRow
            label="Documented process"
            value={`${d.process.label} (${d.process.value}/4)`}
            emphasize={d.process.value <= RED_FLAG_THRESHOLD}
          />
        )}
        {d.readyPerson && (
          <AnswerRow
            label="Someone ready to own it"
            value={`${d.readyPerson.label} (${d.readyPerson.value}/4)`}
            emphasize={d.readyPerson.value <= RED_FLAG_THRESHOLD}
          />
        )}
        {d.obstacle && <AnswerRow label="Biggest obstacle to delegating in 90 days (their words)" value={`“${d.obstacle}”`} />}
      </div>
    );
  } else if (d.mode === 'C') {
    body = (
      <div className="space-y-2.5">
        {d.noOwnerReason && <AnswerRow label="Why there's no single owner" value={d.noOwnerReason} />}
        {d.capacity && (
          <AnswerRow
            label="Could someone own it if assigned?"
            value={`${d.capacity.label} (${d.capacity.value}/4)`}
            emphasize={d.capacity.value <= RED_FLAG_THRESHOLD}
          />
        )}
        {d.fallthrough && (
          <AnswerRow
            label="Falls through the cracks"
            value={d.fallthrough.label}
            emphasize={d.fallthrough.value >= 3}
          />
        )}
      </div>
    );
  } else {
    body =
      d.lowAnswers.length === 0 ? (
        <p className="text-xs text-gray-400">No answers scored ≤{RED_FLAG_THRESHOLD} in this workflow.</p>
      ) : (
        <div className="space-y-2.5">
          {d.lowAnswers.map((a, i) => (
            <div key={i}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{a.dimension}</p>
              <p className="text-xs text-gray-700">{a.questionText}</p>
              <p className="text-xs font-semibold text-red-700 mt-0.5">→ {a.answerLabel}</p>
            </div>
          ))}
        </div>
      );
  }

  return (
    <details className="mt-3 pt-2 border-t border-gray-50 group/answers">
      <summary className="text-xs font-semibold text-indigo-500 cursor-pointer select-none list-none flex items-center gap-1">
        <svg className="w-3 h-3 transition-transform group-open/answers:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {d.mode === 'B' ? 'Problem answers' : 'Answers'}
      </summary>
      <div className="mt-2.5">{body}</div>
    </details>
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

  const startHere = buildStartHere({
    odsScore: detail.ods?.score ?? null,
    drsScore: detail.drs?.score ?? null,
    drsCategoryBreakdown: detail.drsCategoryBreakdown,
    workflows: detail.workflows.map((wf) => ({
      key: wf.key,
      name: wf.name,
      mode: wf.mode,
      odsScore: wf.ods?.score ?? null,
      diagnostics: wf.diagnostics,
      oqiBreakdown: wf.oqiBreakdown,
    })),
  });

  const hasRecommendations =
    detail.recommendations.ods.length > 0 ||
    detail.recommendations.drs.length > 0 ||
    detail.ods?.bandDescription ||
    detail.drs?.bandDescription;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="no-print bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to dashboard
          </Link>
          <div className="flex items-center gap-5">
            <PrintControls />
            <form method="POST" action="/api/auth/logout">
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Respondent header */}
        <div className="report-section bg-white rounded-xl border border-gray-100 shadow-sm p-6">
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

        {/* Start Here — call-prep insight (display-only, thresholds/copy in src/lib/insight.ts) */}
        {startHere && (
          <div className="report-section bg-white rounded-xl border border-indigo-200 shadow-sm p-6 space-y-4" data-audience="internal">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1.5">Start Here</p>
              <h2 className="text-lg font-bold text-gray-900">{startHere.quadrant.title}</h2>
              <p className="text-sm text-gray-600 mt-1.5">{startHere.quadrant.body}</p>
            </div>

            {startHere.readinessLever && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-400 mb-1">
                  Weakest readiness category — {startHere.readinessLever.category} ({startHere.readinessLever.score.toFixed(0)})
                </p>
                <p className="text-sm text-gray-800">{startHere.readinessLever.move}</p>
                {startHere.readinessLever.steps.length > 0 && (
                  <ol className="mt-2 space-y-1.5">
                    {startHere.readinessLever.steps.map((step, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-2">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-bold flex items-center justify-center mt-px">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            {startHere.firstWorkflow && (
              <div className="pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">First workflow</p>
                <p className="text-sm font-semibold text-gray-900">
                  {startHere.firstWorkflow.name}
                  <span className="ml-2 text-xs font-normal text-gray-400">highest debt — ODS {startHere.firstWorkflow.odsScore.toFixed(0)}</span>
                </p>
                {startHere.firstWorkflow.whyStuck.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {startHere.firstWorkflow.whyStuck.map((line, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-1.5">
                        <span className="text-gray-300 shrink-0">•</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {startHere.firstMove && (
              <div className="pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">First move</p>
                <p className="text-sm font-semibold text-gray-900">{startHere.firstMove.headline}</p>
                <p className="text-xs text-gray-600 mt-1">{startHere.firstMove.detail}</p>
                {startHere.firstMove.steps.length > 0 && (
                  <ol className="mt-2 space-y-1.5">
                    {startHere.firstMove.steps.map((step, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-2">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center mt-px">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            <p className="text-[10px] text-gray-300">
              Computed from scores and answers — display-only. Guidance copy is draft pending approval.
            </p>
          </div>
        )}

        {/* Overall scores */}
        <div className="report-section grid sm:grid-cols-2 gap-4">
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

        {/* Score legend — client PDF only, so the scores never read as bare
            numbers without framing. Static copy, always renders in client mode. */}
        <p className="print-client-only report-section text-xs text-gray-500">
          <span className="font-semibold text-gray-700">How to read these:</span>{' '}
          Ownership Debt Score — lower is better (less of the business depends on you).
          {' · '}
          Delegation Readiness Score — higher is better (the team is more ready to take work on).
        </p>

        {/* Workflow breakdown */}
        <div className="report-section bg-white rounded-xl border border-gray-100 shadow-sm p-6" data-audience="internal">
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
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{OQI_DIMENSION_NAMES[d.label] ?? d.label}</span>
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

                <WorkflowAnswers wf={wf} />
              </div>
            ))}
          </div>
        </div>

        {/* Red flags — every scored answer ≤ threshold after reverse-scoring */}
        <div className="report-section bg-white rounded-xl border border-gray-100 shadow-sm p-6" data-audience="internal">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold text-gray-900">Red Flags</h2>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${detail.redFlags.length > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {detail.redFlags.length}
            </span>
            <InfoTooltip text={`Every scored answer at ${RED_FLAG_THRESHOLD} or below (after reverse-scoring) — the call's talking-point list.`} />
          </div>

          {detail.redFlags.length === 0 ? (
            <p className="text-sm text-gray-400">No red-flag answers in this session.</p>
          ) : (
            <ul className="space-y-3">
              {detail.redFlags.map((flag) => (
                <li key={flag.questionKey} className="flex gap-3">
                  <span className="shrink-0 mt-0.5 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-semibold uppercase tracking-wide text-gray-500 h-fit">
                    {flag.contextLabel}
                  </span>
                  <div>
                    <p className="text-sm text-gray-800">{flag.questionText}</p>
                    <p className="text-xs font-semibold text-red-700 mt-0.5">→ {flag.answerLabel}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DRS profile + category breakdown */}
        <div className="report-section bg-white rounded-xl border border-gray-100 shadow-sm p-6" data-audience="internal">
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

        {/* How we can help — band descriptions + recommendation_templates copy.
            Hidden entirely until migration 007's seed is applied. */}
        {hasRecommendations && (
          <div className="report-section bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {/* Coach-facing heading (screen + internal PDF) vs. the client-facing
                framing (client PDF only) — the band descriptions below are
                client-safe; the recommendation_templates bodies are not. */}
            <h2 className="text-sm font-bold text-gray-900 mb-4" data-audience="internal">How We Can Help</h2>
            <h2 className="print-client-only text-sm font-bold text-gray-900 mb-4">What your scores mean</h2>
            <div className="space-y-4">
              {(detail.ods?.bandDescription || detail.recommendations.ods.length > 0) && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Ownership Debt — {detail.ods?.bandLabel ?? '—'}
                  </p>
                  {detail.ods?.bandDescription && (
                    <p className="text-sm text-gray-600 mb-1.5">{detail.ods.bandDescription}</p>
                  )}
                  {detail.recommendations.ods.length > 0 && (
                    <div data-audience="internal">
                      {detail.recommendations.ods.map((body, i) => (
                        <p key={i} className="text-sm text-gray-800 whitespace-pre-line">{body}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {(detail.drs?.bandDescription || detail.recommendations.drs.length > 0) && (
                <div className="pt-3 border-t border-gray-50">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                    Delegation Readiness — {detail.drs?.bandLabel ?? '—'}
                  </p>
                  {detail.drs?.bandDescription && (
                    <p className="text-sm text-gray-600 mb-1.5">{detail.drs.bandDescription}</p>
                  )}
                  {detail.recommendations.drs.length > 0 && (
                    <div data-audience="internal">
                      {detail.recommendations.drs.map((body, i) => (
                        <p key={i} className="text-sm text-gray-800 whitespace-pre-line">{body}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section H — context */}
        <div className="report-section bg-white rounded-xl border border-gray-100 shadow-sm p-6" data-audience="internal">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Context & Priorities</h2>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Urgency</p>
              <p className={`text-sm ${(detail.sectionH.urgencyValue ?? 0) >= 4 ? 'font-semibold text-red-700' : 'text-gray-800'}`}>
                {detail.sectionH.urgency ?? '—'}
                {detail.sectionH.urgencyValue !== null && (
                  <span className="ml-1.5 text-xs font-normal text-gray-400">({detail.sectionH.urgencyValue}/5)</span>
                )}
              </p>
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
