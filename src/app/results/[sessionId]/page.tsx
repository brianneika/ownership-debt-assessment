import { getSupabaseServer } from '@/lib/supabase-server';
import { buildRespondentSynthesis } from '@/lib/insight';
import { EmailGate, FullResults } from './EmailGate';

interface ScoreRow {
  dimension_id: number;
  workflow_key: string | null;
  normalized_score: number;
  dimensions: { slug: string; name: string };
  score_bands: { label: string; color_hex: string; description: string | null } | null;
}

interface BreakdownRow {
  breakdown_type: string;
  label: string;
  weight: number;
  normalized_score: number;
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = getSupabaseServer();

  const [{ data: scores, error }, { data: session }, { data: breakdowns }] = await Promise.all([
    supabase
      .from('dimension_scores')
      .select(`
        dimension_id,
        workflow_key,
        normalized_score,
        dimensions ( slug, name ),
        score_bands ( label, color_hex, description )
      `)
      .eq('session_id', sessionId)
      .returns<ScoreRow[]>(),
    supabase
      .from('assessment_sessions')
      .select('respondent_email')
      .eq('id', sessionId)
      .single(),
    supabase
      .from('score_breakdowns')
      .select('breakdown_type, label, weight, normalized_score')
      .eq('session_id', sessionId)
      .returns<BreakdownRow[]>(),
  ]);

  if (error || !scores || scores.length === 0) {
    return <CalculatingPage sessionId={sessionId} />;
  }

  const overall = scores.filter((r) => r.workflow_key === null);
  const odsRow = overall.find((r) => r.dimensions?.slug === 'ods');
  const drsRow = overall.find((r) => r.dimensions?.slug === 'drs');

  const ods = {
    score: odsRow?.normalized_score ?? 0,
    bandLabel: odsRow?.score_bands?.label ?? null,
    bandColor: odsRow?.score_bands?.color_hex,
  };
  const drs = {
    score: drsRow?.normalized_score ?? 0,
    bandLabel: drsRow?.score_bands?.label ?? null,
    bandColor: drsRow?.score_bands?.color_hex,
  };

  // DRS category sub-breakdown (post-gate only), heaviest-weighted first so the
  // list reads Willingness → Delegation Quality → Team Capacity → Authority Framework.
  const drsBreakdown = (breakdowns ?? [])
    .filter((r) => r.breakdown_type === 'drs')
    .map((r) => ({ category: r.label, score: r.normalized_score, weight: r.weight }))
    .sort((a, b) => b.weight - a.weight);

  const synthesis = buildRespondentSynthesis({
    odsScore: odsRow?.normalized_score ?? null,
    drsScore: drsRow?.normalized_score ?? null,
    drsCategoryBreakdown: drsBreakdown.map((d) => ({ category: d.category, normalizedScore: d.score })),
  });

  const alreadyHasEmail = !!session?.respondent_email;

  return (
    <div className="min-h-screen bg-gray-50 py-14 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-5">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Ownership Debt Results</h1>
          <p className="text-gray-500 text-sm">
            Assessment complete · Your consultant will review these scores with you
          </p>
        </div>

        {alreadyHasEmail ? (
          <FullResults ods={ods} drs={drs} synthesis={synthesis} drsBreakdown={drsBreakdown} />
        ) : (
          <EmailGate
            sessionId={sessionId}
            ods={ods}
            drs={drs}
            synthesis={synthesis}
            drsBreakdown={drsBreakdown}
          />
        )}

      </div>
    </div>
  );
}

function CalculatingPage({ sessionId }: { sessionId: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Calculating your scores…</h1>
        <p className="text-gray-500 mb-6">
          This usually takes a few seconds. Refresh the page if scores don&apos;t appear.
        </p>
        <a
          href={`/results/${sessionId}`}
          className="inline-block bg-indigo-600 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </a>
      </div>
    </div>
  );
}
