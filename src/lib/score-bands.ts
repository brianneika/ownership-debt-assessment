// lib/score-bands.ts
// One rule for every place a score is shown, banded or read: round to a whole
// number first. score_bands use whole-number ranges (0-30, 31-50, 51-70, 71-100)
// and the reads split at 51, so a stored 50.6 used to display as "51" with no
// band pill (nothing matches between 50 and 51) and a low-readiness read.
//
// Applied at READ time (results page, admin list and detail, quadrant and v2
// read), so sessions already scored get their band back without rescoring.
// Stored scores keep their decimals; findScoreBandId in scoring.ts uses the same
// rounding so band ids saved from now on agree.

import { wholeScore } from './scoring-v2';

export { wholeScore };

export interface ScoreBand {
  id: number;
  slug: string; // 'ods' | 'drs' | 'oqi'
  min_score: number;
  max_score: number;
  label: string;
  color_hex: string | null;
  description: string | null;
}

interface BandRow {
  id: number;
  min_score: number | string;
  max_score: number | string;
  label: string;
  color_hex: string | null;
  description: string | null;
  dimensions: { slug: string } | { slug: string }[] | null;
}

// Minimal shape of the Supabase client this needs (keeps this file free of
// server-only imports).
interface BandClient {
  from(table: 'score_bands'): {
    select(columns: string): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  };
}

export async function loadScoreBands(supabase: BandClient): Promise<ScoreBand[]> {
  const { data } = await supabase
    .from('score_bands')
    .select('id, min_score, max_score, label, color_hex, description, dimensions(slug)');
  return ((data ?? []) as BandRow[]).map((b) => {
    const dim = Array.isArray(b.dimensions) ? b.dimensions[0] : b.dimensions;
    return {
      id: b.id,
      slug: dim?.slug ?? '',
      min_score: Number(b.min_score),
      max_score: Number(b.max_score),
      label: b.label,
      color_hex: b.color_hex,
      description: b.description,
    };
  });
}

export function bandFor(bands: ScoreBand[], slug: string, score: number | null | undefined): ScoreBand | null {
  if (score === null || score === undefined || Number.isNaN(score)) return null;
  const s = wholeScore(score);
  return bands.find((b) => b.slug === slug && s >= b.min_score && s <= b.max_score) ?? null;
}
