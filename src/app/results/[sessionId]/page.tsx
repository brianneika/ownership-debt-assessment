import { getSupabaseServer } from '@/lib/supabase-server';
import { buildRespondentSynthesis, buildRespondentSynthesisV2 } from '@/lib/insight';
import { calculateScores, loadV2Answers, v2SessionInput } from '@/lib/scoring';
import { computeScoresV2 } from '@/lib/scoring-v2';
import { buildResultsBlocks } from '@/lib/insight-v2';
import type { V2FindingBlocks } from '@/components/results-visuals';
import { loadScoreBands, bandFor, wholeScore } from '@/lib/score-bands';
import { EmailGate, FullResults } from './EmailGate';
import { BrandWave } from '@/components/BrandWave';

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

type SupabaseServer = ReturnType<typeof getSupabaseServer>;

async function loadResults(supabase: SupabaseServer, sessionId: string) {
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
      // '*' for instrument_version, drs_profile and the workflow modes (v2 blocks).
      .select('*')
      .eq('id', sessionId)
      .single(),
    supabase
      .from('score_breakdowns')
      .select('breakdown_type, label, weight, normalized_score')
      .eq('session_id', sessionId)
      .returns<BreakdownRow[]>(),
  ]);

  return { scores, error, session, breakdowns };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = getSupabaseServer();

  let { scores, error, session, breakdowns } = await loadResults(supabase, sessionId);

  // Self-heal: the assessment was submitted (completed_at is set) but no scores
  // exist. That means the synchronous scoring at submit time threw and was
  // swallowed — leaving the user staring at a dead spinner that no refresh could
  // fix. Recompute now. calculateScores is idempotent (delete + insert), so a
  // refresh recovers the respondent instead of spinning forever.
  if ((error || !scores || scores.length === 0) && session?.completed_at) {
    try {
      await calculateScores(sessionId);
      ({ scores, error, session, breakdowns } = await loadResults(supabase, sessionId));
    } catch (err) {
      console.error(`[ResultsPage] self-heal calculateScores failed for ${sessionId}:`, err);
      return <ScoringErrorPage sessionId={sessionId} />;
    }
  }

  if (error || !scores || scores.length === 0) {
    // Not completed yet (or still no scores after a heal attempt) — show the
    // gentle "calculating" state rather than an error.
    return <CalculatingPage sessionId={sessionId} />;
  }

  const overall = scores.filter((r) => r.workflow_key === null);
  const odsRow = overall.find((r) => r.dimensions?.slug === 'ods');
  const drsRow = overall.find((r) => r.dimensions?.slug === 'drs');

  // Whole numbers first, then the band from that same number, so the score
  // shown, the band pill and the read always agree (see src/lib/score-bands.ts).
  const bands = await loadScoreBands(supabase);
  const odsWhole = odsRow ? wholeScore(odsRow.normalized_score) : null;
  const drsWhole = drsRow ? wholeScore(drsRow.normalized_score) : null;
  const odsBand = bandFor(bands, 'ods', odsWhole);
  const drsBand = bandFor(bands, 'drs', drsWhole);

  const ods: { score: number; bandLabel: string | null; bandColor: string | undefined; notScoredText?: string } = {
    score: odsWhole ?? 0,
    bandLabel: odsBand?.label ?? null,
    bandColor: odsBand?.color_hex ?? undefined,
  };
  const drs = {
    score: drsWhole ?? 0,
    bandLabel: drsBand?.label ?? null,
    bandColor: drsBand?.color_hex ?? undefined,
  };

  // DRS category sub-breakdown (post-gate only), heaviest-weighted first so the
  // list reads Willingness → Delegation Quality → Team Capacity → Authority Framework.
  const drsBreakdown = (breakdowns ?? [])
    .filter((r) => r.breakdown_type === 'drs')
    .map((r) => ({ category: r.label, score: r.normalized_score, weight: r.weight }))
    .sort((a, b) => b.weight - a.weight);

  const isV2 = session?.instrument_version === 2;

  let synthesis = buildRespondentSynthesis({
    odsScore: odsWhole,
    drsScore: drsWhole,
    drsCategoryBreakdown: drsBreakdown.map((d) => ({ category: d.category, normalizedScore: d.score })),
  });

  // v2: the read gains a no-support version, and the page gains what the result
  // is based on, where to start, and what it doesn't cover (scoring spec, section 7).
  let v2Blocks: V2FindingBlocks | null = null;
  if (isV2 && session) {
    const answers = await loadV2Answers(supabase, sessionId);
    const v2Session = v2SessionInput(session, answers);
    const v2Scores = computeScoresV2(v2Session, answers);
    v2Blocks = buildResultsBlocks(v2Session, answers, v2Scores).blocks;
    synthesis = buildRespondentSynthesisV2({
      odsScore: odsWhole,
      drsScore: drsWhole,
      noSupport: v2Scores.drsProfile === 'solo',
      drsCategoryBreakdown: drsBreakdown.map((d) => ({ category: d.category, normalizedScore: d.score })),
    }) as typeof synthesis;
    if (!odsRow) {
      ods.notScoredText =
        "Not scored: you told us you don't do any of the four workflows we measure. Your readiness score still applies.";
    }
  }

  const alreadyHasEmail = !!session?.respondent_email;

  return (
    <div className="min-h-screen bg-vai-gray py-14 px-4">
      <BrandWave />
      <div className="max-w-2xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vai-logo.svg" alt="VAI" className="inline-block h-11 w-auto mb-5" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Ownership Debt Results</h1>
          <p className="text-gray-500 text-sm">
            Assessment complete · Bri will review these scores with you on your free call
          </p>
        </div>

        {alreadyHasEmail ? (
          <FullResults ods={ods} drs={drs} synthesis={synthesis} drsBreakdown={drsBreakdown} v2Blocks={v2Blocks} />
        ) : (
          <EmailGate
            sessionId={sessionId}
            ods={ods}
            drs={drs}
            synthesis={synthesis}
            drsBreakdown={drsBreakdown}
            v2Blocks={v2Blocks}
          />
        )}

      </div>
    </div>
  );
}

function ScoringErrorPage({ sessionId }: { sessionId: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vai-gray to-vai-navy-wash flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500 mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">We hit a snag scoring your results</h1>
        <p className="text-gray-500 mb-6">
          Your answers are saved. Tap Try again, or Bri can pull your
          scores directly. Nothing was lost.
        </p>
        <a
          href={`/results/${sessionId}`}
          className="inline-block bg-vai-navy text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-vai-navy-deep transition-colors"
        >
          Try again
        </a>
      </div>
    </div>
  );
}

function CalculatingPage({ sessionId }: { sessionId: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-vai-gray to-vai-navy-wash flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-vai-navy mb-6">
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
          className="inline-block bg-vai-navy text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-vai-navy-deep transition-colors"
        >
          Refresh
        </a>
      </div>
    </div>
  );
}
